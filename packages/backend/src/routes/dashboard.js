import { Router } from 'express'
import { db } from '../db/client.js'
import { issues, projects, activityLog, comments } from '../db/schema.js'
import { eq, sql, and, gte, desc } from 'drizzle-orm'

const router = Router()

// ── GET /api/dashboard/stats ──────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const totalIssues = db
      .select({ count: sql`COUNT(*)` })
      .from(issues)
      .get()

    const openIssues = db
      .select({ count: sql`COUNT(*)` })
      .from(issues)
      .where(sql`status != 'done'`)
      .get()

    const doneIssues = db
      .select({ count: sql`COUNT(*)` })
      .from(issues)
      .where(eq(issues.status, 'done'))
      .get()

    const criticalIssues = db
      .select({ count: sql`COUNT(*)` })
      .from(issues)
      .where(and(
        eq(issues.priority, 'critical'),
        sql`status != 'done'`
      ))
      .get()

    const totalProjects = db
      .select({ count: sql`COUNT(*)` })
      .from(projects)
      .where(eq(projects.archived, false))
      .get()

    const createdThisWeek = db
      .select({ count: sql`COUNT(*)` })
      .from(issues)
      .where(gte(issues.createdAt, sevenDaysAgo))
      .get()

    const doneThisWeek = db
      .select({ count: sql`COUNT(*)` })
      .from(issues)
      .where(and(
        eq(issues.status, 'done'),
        gte(issues.updatedAt, sevenDaysAgo)
      ))
      .get()

    // Issues by status
    const byStatus = db
      .select({
        status: issues.status,
        count:  sql`COUNT(*)`,
      })
      .from(issues)
      .groupBy(issues.status)
      .all()

    // Issues by priority
    const byPriority = db
      .select({
        priority: issues.priority,
        count:    sql`COUNT(*)`,
      })
      .from(issues)
      .groupBy(issues.priority)
      .all()

    // Per-project health
    const projectHealth = db
      .select({
        id:     projects.id,
        name:   projects.name,
        prefix: projects.prefix,
        color:  projects.color,
        icon:   projects.icon,
        total:  sql`COUNT(${issues.id})`,
        done:   sql`SUM(CASE WHEN ${issues.status} = 'done' THEN 1 ELSE 0 END)`,
        open:   sql`SUM(CASE WHEN ${issues.status} != 'done' THEN 1 ELSE 0 END)`,
      })
      .from(projects)
      .leftJoin(issues, eq(issues.projectId, projects.id))
      .where(eq(projects.archived, false))
      .groupBy(projects.id)
      .all()

    res.json({
      totalIssues:    Number(totalIssues.count),
      openIssues:     Number(openIssues.count),
      doneIssues:     Number(doneIssues.count),
      criticalIssues: Number(criticalIssues.count),
      totalProjects:  Number(totalProjects.count),
      createdThisWeek: Number(createdThisWeek.count),
      doneThisWeek:   Number(doneThisWeek.count),
      byStatus,
      byPriority,
      projectHealth,
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/dashboard/activity ───────────────────────────
router.get('/activity', async (req, res, next) => {
  try {
    // Last 20 activity log entries across all projects, with issue info joined
    const activity = db
      .select({
        id:          activityLog.id,
        action:      activityLog.action,
        fromValue:   activityLog.fromValue,
        toValue:     activityLog.toValue,
        createdAt:   activityLog.createdAt,
        issueId:     activityLog.issueId,
        projectId:   activityLog.projectId,
        fullKey:     issues.fullKey,
        issueTitle:  issues.title,
        projectName: projects.name,
        projectColor: projects.color,
        projectIcon:  projects.icon,
      })
      .from(activityLog)
      .innerJoin(issues, eq(activityLog.issueId, issues.id))
      .innerJoin(projects, eq(activityLog.projectId, projects.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(20)
      .all()

    // Last 10 comments across all projects
    const recentComments = db
      .select({
        id:          comments.id,
        body:        comments.body,
        createdAt:   comments.createdAt,
        issueId:     comments.issueId,
        fullKey:     issues.fullKey,
        issueTitle:  issues.title,
        projectName: projects.name,
        projectColor: projects.color,
        projectIcon:  projects.icon,
      })
      .from(comments)
      .innerJoin(issues, eq(comments.issueId, issues.id))
      .innerJoin(projects, eq(issues.projectId, projects.id))
      .orderBy(desc(comments.createdAt))
      .limit(10)
      .all()

    // Combine and sort
    const feed = [
      ...activity.map(a => ({ ...a, feedType: 'activity' })),
      ...recentComments.map(c => ({ ...c, feedType: 'comment' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .slice(0, 20)

    res.json(feed)
  } catch (err) {
    next(err)
  }
})

export default router