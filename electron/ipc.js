import { ipcMain } from 'electron'
import { eq, sql, desc, gte, and, like, or } from 'drizzle-orm'
import { projects, issues, labels, issueLabels, comments, activityLog } from './schema.js'
import { z } from 'zod'

// ── Validation schemas ──
const createProjectSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  prefix:      z.string()
                .min(2).max(6)
                .regex(/^[A-Z]+$/, 'Prefix must be uppercase letters only'),
  description: z.string().optional().nullable(),
  color:       z.string().default('#ff5eab'),
  icon:        z.string().default('🌸'),
})

const updateProjectSchema = z.object({
  name:        z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  color:       z.string().optional(),
  icon:        z.string().optional(),
})

const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
})

export function registerIpcHandlers(db) {

  // ── Projects ─────────────────────────────────────────────
  ipcMain.handle('projects:getAll', () => {
    return db
      .select({
        id:          projects.id,
        name:        projects.name,
        prefix:      projects.prefix,
        description: projects.description,
        color:       projects.color,
        icon:        projects.icon,
        createdAt:   projects.createdAt,
        archived:    projects.archived,
        openIssues: sql`(
          SELECT COUNT(*) FROM issues
          WHERE issues.project_id = ${projects.id}
          AND issues.status != 'done'
        )`.as('openIssues'),
        totalIssues: sql`(
          SELECT COUNT(*) FROM issues
          WHERE issues.project_id = ${projects.id}
        )`.as('totalIssues'),
      })
      .from(projects)
      .where(eq(projects.archived, false))
      .all()
  })

  ipcMain.handle('projects:getOne', (_, id) => {
    const project = db
      .select({
        id:          projects.id,
        name:        projects.name,
        prefix:      projects.prefix,
        description: projects.description,
        color:       projects.color,
        icon:        projects.icon,
        createdAt:   projects.createdAt,
        archived:    projects.archived,
        openIssues: sql`(
          SELECT COUNT(*) FROM issues
          WHERE issues.project_id = ${projects.id}
          AND issues.status != 'done'
        )`.as('openIssues'),
        totalIssues: sql`(
          SELECT COUNT(*) FROM issues
          WHERE issues.project_id = ${projects.id}
        )`.as('totalIssues'),
        doneIssues: sql`(
          SELECT COUNT(*) FROM issues
          WHERE issues.project_id = ${projects.id}
          AND issues.status = 'done'
        )`.as('doneIssues'),
      })
      .from(projects)
      .where(eq(projects.id, Number(id)))
      .get()

    if (!project) throw new Error('Project not found')
    return project
  })

  ipcMain.handle('projects:create', (_, data) => {
    if (data.prefix) data.prefix = data.prefix.toUpperCase()

    const parsed = createProjectSchema.safeParse(data)
    if (!parsed.success) {
      throw Object.assign(new Error('Validation failed'), {
        details: parsed.error.flatten().fieldErrors
      })
    }

    const existing = db
      .select()
      .from(projects)
      .where(eq(projects.prefix, parsed.data.prefix))
      .get()

    if (existing) {
      throw Object.assign(new Error('Prefix already in use'), {
        details: { prefix: [`"${parsed.data.prefix}" is already taken`] }
      })
    }

    return db
      .insert(projects)
      .values({
        ...parsed.data,
        createdAt: new Date().toISOString(),
        archived: false,
      })
      .returning()
      .get()
  })

  ipcMain.handle('projects:update', (_, { id, ...data }) => {
    const parsed = updateProjectSchema.safeParse(data)
    if (!parsed.success) {
      throw Object.assign(new Error('Validation failed'), {
        details: parsed.error.flatten().fieldErrors
      })
    }

    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, Number(id)))
      .get()

    if (!project) throw new Error('Project not found')

    return db
      .update(projects)
      .set(parsed.data)
      .where(eq(projects.id, Number(id)))
      .returning()
      .get()
  })

  ipcMain.handle('projects:delete', (_, id) => {
    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, Number(id)))
      .get()

    if (!project) throw new Error('Project not found')

    // Soft delete all issues in this project
    db.update(issues)
      .set({ archived: true })
      .where(eq(issues.projectId, Number(id)))
      .run()

    // Soft delete the project
    db.update(projects)
      .set({ archived: true })
      .where(eq(projects.id, Number(id)))
      .run()

    return { success: true }
  })

  // ── Comments ─────────────────────────────────────────────
  ipcMain.handle('comments:getByIssue', (_, issueId) => {
    return db
      .select()
      .from(comments)
      .where(eq(comments.issueId, Number(issueId)))
      .orderBy(desc(comments.createdAt))
      .all()
  })

  ipcMain.handle('comments:create', (_, { issueId, body }) => {
    const parsed = commentSchema.safeParse({ body })
    if (!parsed.success) {
      throw Object.assign(new Error('Validation failed'), {
        details: parsed.error.flatten().fieldErrors
      })
    }

    return db
      .insert(comments)
      .values({
        issueId:   Number(issueId),
        body:      parsed.data.body,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get()
  })

  ipcMain.handle('comments:delete', (_, id) => {
    const existing = db
      .select()
      .from(comments)
      .where(eq(comments.id, Number(id)))
      .get()

    if (!existing) throw new Error('Comment not found')

    db.delete(comments)
      .where(eq(comments.id, Number(id)))
      .run()

    return { success: true }
  })

  // ── Dashboard ─────────────────────────────────────────────
  ipcMain.handle('dashboard:getStats', () => {
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

    const byStatus = db
      .select({ status: issues.status, count: sql`COUNT(*)` })
      .from(issues)
      .groupBy(issues.status)
      .all()

    const byPriority = db
      .select({ priority: issues.priority, count: sql`COUNT(*)` })
      .from(issues)
      .groupBy(issues.priority)
      .all()

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

    return {
      totalIssues:     Number(totalIssues.count),
      openIssues:      Number(openIssues.count),
      doneIssues:      Number(doneIssues.count),
      criticalIssues:  Number(criticalIssues.count),
      totalProjects:   Number(totalProjects.count),
      createdThisWeek: Number(createdThisWeek.count),
      doneThisWeek:    Number(doneThisWeek.count),
      byStatus,
      byPriority,
      projectHealth,
    }
  })

  ipcMain.handle('dashboard:getActivity', () => {
    const activity = db
      .select({
        id:           activityLog.id,
        action:       activityLog.action,
        fromValue:    activityLog.fromValue,
        toValue:      activityLog.toValue,
        createdAt:    activityLog.createdAt,
        issueId:      activityLog.issueId,
        projectId:    activityLog.projectId,
        fullKey:      issues.fullKey,
        issueTitle:   issues.title,
        projectName:  projects.name,
        projectColor: projects.color,
        projectIcon:  projects.icon,
      })
      .from(activityLog)
      .innerJoin(issues, eq(activityLog.issueId, issues.id))
      .innerJoin(projects, eq(activityLog.projectId, projects.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(20)
      .all()

    const recentComments = db
      .select({
        id:           comments.id,
        body:         comments.body,
        createdAt:    comments.createdAt,
        issueId:      comments.issueId,
        fullKey:      issues.fullKey,
        issueTitle:   issues.title,
        projectName:  projects.name,
        projectColor: projects.color,
        projectIcon:  projects.icon,
      })
      .from(comments)
      .innerJoin(issues, eq(comments.issueId, issues.id))
      .innerJoin(projects, eq(issues.projectId, projects.id))
      .orderBy(desc(comments.createdAt))
      .limit(10)
      .all()

    return [
      ...activity.map(a => ({ ...a, feedType: 'activity' })),
      ...recentComments.map(c => ({ ...c, feedType: 'comment' })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
  })

  // ── Issues ────────────────────────────────────────────────

  const createIssueSchema = z.object({
    title:       z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    type:        z.enum(['bug', 'feature', 'task', 'chore']).default('task'),
    status:      z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).default('backlog'),
    priority:    z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  })

  const updateIssueSchema = z.object({
    title:       z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    type:        z.enum(['bug', 'feature', 'task', 'chore']).optional(),
    status:      z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).optional(),
    priority:    z.enum(['low', 'medium', 'high', 'critical']).optional(),
  })

  function logActivity({ issueId, projectId, action, fromValue, toValue }) {
    db.insert(activityLog)
      .values({
        issueId,
        projectId,
        action,
        fromValue:  fromValue ?? null,
        toValue:    toValue ?? null,
        createdAt:  new Date().toISOString(),
      })
      .run()
  }

  ipcMain.handle('issues:getAll', (_, filters = {}) => {
    const { status, type, priority } = filters

    let query = db
      .select({
        id:            issues.id,
        fullKey:       issues.fullKey,
        number:        issues.number,
        title:         issues.title,
        description:   issues.description,
        type:          issues.type,
        status:        issues.status,
        priority:      issues.priority,
        createdAt:     issues.createdAt,
        updatedAt:     issues.updatedAt,
        projectId:     issues.projectId,
        projectName:   projects.name,
        projectColor:  projects.color,
        projectIcon:   projects.icon,
        projectPrefix: projects.prefix,
      })
      .from(issues)
      .innerJoin(projects, eq(issues.projectId, projects.id))

    const conditions = []
    if (status)   conditions.push(eq(issues.status, status))
    if (type)     conditions.push(eq(issues.type, type))
    if (priority) conditions.push(eq(issues.priority, priority))

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    return query.orderBy(desc(issues.createdAt)).all()
  })

  ipcMain.handle('issues:getByProject', (_, { projectId, filters = {} }) => {
    const { status, type, priority } = filters

    const conditions = [eq(issues.projectId, Number(projectId))]
    if (status)   conditions.push(eq(issues.status, status))
    if (type)     conditions.push(eq(issues.type, type))
    if (priority) conditions.push(eq(issues.priority, priority))

    const result = db
      .select({
        id:          issues.id,
        fullKey:     issues.fullKey,
        number:      issues.number,
        title:       issues.title,
        description: issues.description,
        type:        issues.type,
        status:      issues.status,
        priority:    issues.priority,
        boardOrder:  issues.boardOrder,
        createdAt:   issues.createdAt,
        updatedAt:   issues.updatedAt,
      })
      .from(issues)
      .where(and(...conditions))
      .orderBy(issues.boardOrder)
      .all()

    return result.map(issue => {
      const issueLabelsResult = db
        .select({
          id:    labels.id,
          name:  labels.name,
          color: labels.color,
        })
        .from(issueLabels)
        .innerJoin(labels, eq(issueLabels.labelId, labels.id))
        .where(eq(issueLabels.issueId, issue.id))
        .all()

      return { ...issue, labels: issueLabelsResult }
    })
  })

  ipcMain.handle('issues:getOne', (_, key) => {
    const issue = db
      .select({
        id:            issues.id,
        fullKey:       issues.fullKey,
        number:        issues.number,
        title:         issues.title,
        description:   issues.description,
        type:          issues.type,
        status:        issues.status,
        priority:      issues.priority,
        boardOrder:    issues.boardOrder,
        createdAt:     issues.createdAt,
        updatedAt:     issues.updatedAt,
        closedAt:      issues.closedAt,
        projectId:     issues.projectId,
        projectName:   projects.name,
        projectColor:  projects.color,
        projectIcon:   projects.icon,
        projectPrefix: projects.prefix,
      })
      .from(issues)
      .innerJoin(projects, eq(issues.projectId, projects.id))
      .where(eq(issues.fullKey, key))
      .get()

    if (!issue) throw new Error('Issue not found')

    const issueLabelsResult = db
      .select({
        id:    labels.id,
        name:  labels.name,
        color: labels.color,
      })
      .from(issueLabels)
      .innerJoin(labels, eq(issueLabels.labelId, labels.id))
      .where(eq(issueLabels.issueId, issue.id))
      .all()

    const activity = db
      .select()
      .from(activityLog)
      .where(eq(activityLog.issueId, issue.id))
      .all()

    const issueComments = db
      .select()
      .from(comments)
      .where(eq(comments.issueId, issue.id))
      .all()

    const feed = [
      ...activity.map(a => ({ ...a, feedType: 'activity' })),
      ...issueComments.map(c => ({ ...c, feedType: 'comment' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return { ...issue, labels: issueLabelsResult, feed }
  })

  ipcMain.handle('issues:create', (_, { projectId, ...data }) => {
    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, Number(projectId)))
      .get()

    if (!project) throw new Error('Project not found')

    const parsed = createIssueSchema.safeParse(data)
    if (!parsed.success) {
      throw Object.assign(new Error('Validation failed'), {
        details: parsed.error.flatten().fieldErrors
      })
    }

    const lastIssue = db
      .select({ number: issues.number })
      .from(issues)
      .where(eq(issues.projectId, Number(projectId)))
      .orderBy(desc(issues.number))
      .get()

    const nextNumber = (lastIssue?.number ?? 0) + 1
    const fullKey    = `${project.prefix}-${nextNumber}`
    const now        = new Date().toISOString()

    const newIssue = db
      .insert(issues)
      .values({
        projectId:   Number(projectId),
        number:      nextNumber,
        fullKey,
        title:       parsed.data.title,
        description: parsed.data.description ?? null,
        type:        parsed.data.type,
        status:      parsed.data.status,
        priority:    parsed.data.priority,
        boardOrder:  nextNumber,
        createdAt:   now,
        updatedAt:   now,
      })
      .returning()
      .get()

    logActivity({
      issueId:   newIssue.id,
      projectId: Number(projectId),
      action:    'issue_created',
      toValue:   newIssue.status,
    })

    return newIssue
  })

  ipcMain.handle('issues:update', (_, { id, ...data }) => {
    const issueId = Number(id)

    const existing = db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .get()

    if (!existing) throw new Error('Issue not found')

    const parsed = updateIssueSchema.safeParse(data)
    if (!parsed.success) {
      throw Object.assign(new Error('Validation failed'), {
        details: parsed.error.flatten().fieldErrors
      })
    }

    if (parsed.data.status && parsed.data.status !== existing.status) {
      logActivity({
        issueId,
        projectId:  existing.projectId,
        action:     'status_changed',
        fromValue:  existing.status,
        toValue:    parsed.data.status,
      })
    }

    const closedAt = parsed.data.status === 'done' && existing.status !== 'done'
      ? new Date().toISOString()
      : existing.closedAt

    return db
      .update(issues)
      .set({ ...parsed.data, closedAt, updatedAt: new Date().toISOString() })
      .where(eq(issues.id, issueId))
      .returning()
      .get()
  })

  ipcMain.handle('issues:updateStatus', (_, { id, status }) => {
    const issueId = Number(id)

    if (!status) throw new Error('Status is required')

    const existing = db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .get()

    if (!existing) throw new Error('Issue not found')

    if (existing.status !== status) {
      logActivity({
        issueId,
        projectId:  existing.projectId,
        action:     'status_changed',
        fromValue:  existing.status,
        toValue:    status,
      })
    }

    const closedAt = status === 'done' ? new Date().toISOString() : existing.closedAt

    return db
      .update(issues)
      .set({ status, closedAt, updatedAt: new Date().toISOString() })
      .where(eq(issues.id, issueId))
      .returning()
      .get()
  })

  ipcMain.handle('issues:reorder', (_, { projectId, orderedIds, status }) => {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new Error('orderedIds must be a non-empty array')
    }

    orderedIds.forEach((id, index) => {
      db.update(issues)
        .set({ boardOrder: index })
        .where(and(
          eq(issues.id, id),
          eq(issues.projectId, Number(projectId)),
          eq(issues.status, status)
        ))
        .run()
    })

    return { success: true }
  })

  ipcMain.handle('issues:delete', (_, id) => {
    const issueId = Number(id)

    const existing = db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .get()

    if (!existing) throw new Error('Issue not found')

    db.delete(activityLog)
      .where(eq(activityLog.issueId, issueId))
      .run()

    db.delete(issues)
      .where(eq(issues.id, issueId))
      .run()

    return { success: true }
  })

  // ── Search ────────────────────────────────────────────────

  ipcMain.handle('search:query', (_, q) => {
    if (!q || q.trim().length < 2) {
      return { issues: [], projects: [] }
    }

    const pattern = `%${q.trim()}%`

    const matchedIssues = db
      .select({
        id:           issues.id,
        fullKey:      issues.fullKey,
        title:        issues.title,
        status:       issues.status,
        priority:     issues.priority,
        type:         issues.type,
        projectColor: projects.color,
        projectName:  projects.name,
        projectIcon:  projects.icon,
      })
      .from(issues)
      .innerJoin(projects, eq(issues.projectId, projects.id))
      .where(or(
        like(issues.title, pattern),
        like(issues.fullKey, pattern),
      ))
      .limit(10)
      .all()

    const matchedProjects = db
      .select({
        id:     projects.id,
        name:   projects.name,
        prefix: projects.prefix,
        icon:   projects.icon,
        color:  projects.color,
      })
      .from(projects)
      .where(or(
        like(projects.name, pattern),
        like(projects.prefix, pattern),
      ))
      .limit(5)
      .all()

    return { issues: matchedIssues, projects: matchedProjects }
  })

  // ── Labels ────────────────────────────────────────────────
  const labelSchema = z.object({
    name:  z.string().min(1, 'Name is required'),
    color: z.string().default('#ff5eab'),
  })

  ipcMain.handle('labels:getByProject', (_, projectId) => {
    return db
      .select()
      .from(labels)
      .where(eq(labels.projectId, Number(projectId)))
      .all()
  })

  ipcMain.handle('labels:getByIssue', (_, issueId) => {
    return db
      .select({
        id:    labels.id,
        name:  labels.name,
        color: labels.color,
      })
      .from(issueLabels)
      .innerJoin(labels, eq(issueLabels.labelId, labels.id))
      .where(eq(issueLabels.issueId, Number(issueId)))
      .all()
  })

  ipcMain.handle('labels:create', (_, { projectId, ...data }) => {
    const parsed = labelSchema.safeParse(data)
    if (!parsed.success) {
      throw Object.assign(new Error('Validation failed'), {
        details: parsed.error.flatten().fieldErrors
      })
    }

    return db
      .insert(labels)
      .values({
        projectId: Number(projectId),
        name:      parsed.data.name,
        color:     parsed.data.color,
      })
      .returning()
      .get()
  })

  ipcMain.handle('labels:update', (_, { id, ...data }) => {
    const parsed = labelSchema.safeParse(data)
    if (!parsed.success) {
      throw Object.assign(new Error('Validation failed'), {
        details: parsed.error.flatten().fieldErrors
      })
    }

    const existing = db
      .select()
      .from(labels)
      .where(eq(labels.id, Number(id)))
      .get()

    if (!existing) throw new Error('Label not found')

    return db
      .update(labels)
      .set({ name: parsed.data.name, color: parsed.data.color })
      .where(eq(labels.id, Number(id)))
      .returning()
      .get()
  })

  ipcMain.handle('labels:delete', (_, id) => {
    const existing = db
      .select()
      .from(labels)
      .where(eq(labels.id, Number(id)))
      .get()

    if (!existing) throw new Error('Label not found')

    db.delete(issueLabels)
      .where(eq(issueLabels.labelId, Number(id)))
      .run()

    db.delete(labels)
      .where(eq(labels.id, Number(id)))
      .run()

    return { success: true }
  })

  ipcMain.handle('labels:addToIssue', (_, { issueId, labelId }) => {
    const existing = db
      .select()
      .from(issueLabels)
      .where(and(
        eq(issueLabels.issueId, Number(issueId)),
        eq(issueLabels.labelId, Number(labelId))
      ))
      .get()

    if (existing) throw new Error('Label already assigned')

    db.insert(issueLabels)
      .values({ issueId: Number(issueId), labelId: Number(labelId) })
      .run()

    return { success: true }
  })

  ipcMain.handle('labels:removeFromIssue', (_, { issueId, labelId }) => {
    db.delete(issueLabels)
      .where(and(
        eq(issueLabels.issueId, Number(issueId)),
        eq(issueLabels.labelId, Number(labelId))
      ))
      .run()

    return { success: true }
  })

  // ── Export ────────────────────────────────────────────────
  ipcMain.handle('export:json', () => {
    return {
      exportedAt: new Date().toISOString(),
      version:    '1.0',
      data: {
        projects:    db.select().from(projects).all(),
        issues:      db.select().from(issues).all(),
        labels:      db.select().from(labels).all(),
        issueLabels: db.select().from(issueLabels).all(),
        comments:    db.select().from(comments).all(),
        activity:    db.select().from(activityLog).all(),
      }
    }
  })
}