import { Router } from 'express'
import { db } from '../db/client.js'
import { issues, projects, activityLog, issueLabels, labels, comments } from '../db/schema.js'
import { eq, sql, and, desc } from 'drizzle-orm'
import { z } from 'zod'

const router = Router()

// ── Validation schemas ────────────────────────────────────
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

// ── Helper: log activity ──────────────────────────────────
function logActivity({ issueId, projectId, action, fromValue, toValue }) {
  db.insert(activityLog)
    .values({
      issueId,
      projectId,
      action,
      fromValue:  fromValue ?? null,
      toValue:    toValue ?? null,
      createdAt: new Date().toISOString(),
    })
    .run()
}

// ── GET /api/issues — cross-project ───────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { status, type, priority } = req.query

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

    const result = query.orderBy(desc(issues.createdAt)).all()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/projects/:projectId/issues ───────────────────
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { status, type, priority } = req.query
    const projectId = Number(req.params.projectId)

    const conditions = [eq(issues.projectId, projectId)]
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

      const issuesWithLabels = result.map(issue => {
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

    res.json(issuesWithLabels)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/issues/:key — fetch by full key e.g. SPARK-42
router.get('/:key', async (req, res, next) => {
  try {
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
      .where(eq(issues.fullKey, req.params.key))
      .get()

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    // Fetch labels for this issue
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

    // Fetch activity log entries
    const activity = db
      .select()
      .from(activityLog)
      .where(eq(activityLog.issueId, issue.id))
      .all()

    // Fetch comments
    const issueComments = db
      .select()
      .from(comments)
      .where(eq(comments.issueId, issue.id))
      .all()

    // Combine activity + comments into a single chronological feed
    const feed = [
      ...activity.map(a => ({ ...a, feedType: 'activity' })),
      ...issueComments.map(c => ({ ...c, feedType: 'comment' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json({ ...issue, labels: issueLabelsResult, feed })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/projects/:projectId/issues ──────────────────
router.post('/project/:projectId', async (req, res, next) => {
  try {
    const projectId = Number(req.params.projectId)

    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get()

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const data = createIssueSchema.safeParse(req.body)
    if (!data.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: data.error.flatten().fieldErrors
      })
    }

    const lastIssue = db
      .select({ number: issues.number })
      .from(issues)
      .where(eq(issues.projectId, projectId))
      .orderBy(desc(issues.number))
      .get()

    const nextNumber = (lastIssue?.number ?? 0) + 1
    const fullKey    = `${project.prefix}-${nextNumber}`
    const now        = new Date().toISOString()

    const newIssue = db
      .insert(issues)
      .values({
        projectId,
        number:      nextNumber,
        fullKey,
        title:       data.data.title,
        description: data.data.description ?? null,
        type:        data.data.type,
        status:      data.data.status,
        priority:    data.data.priority,
        boardOrder:  nextNumber,
        createdAt:   now,
        updatedAt:   now,
      })
      .returning()
      .get()

    logActivity({
      issueId:   newIssue.id,
      projectId,
      action:    'issue_created',
      toValue:   newIssue.status,
    })

    res.status(201).json(newIssue)
  } catch (err) {
    next(err)
  }
})

// ── PUT /api/issues/:id ───────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const issueId = Number(req.params.id)

    const existing = db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .get()

    if (!existing) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    const data = updateIssueSchema.safeParse(req.body)
    if (!data.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: data.error.flatten().fieldErrors
      })
    }

    if (data.data.status && data.data.status !== existing.status) {
      logActivity({
        issueId,
        projectId:  existing.projectId,
        action:     'status_changed',
        fromValue:  existing.status,
        toValue:    data.data.status,
      })
    }

    const closedAt = data.data.status === 'done' && existing.status !== 'done'
      ? new Date().toISOString()
      : existing.closedAt

    const updated = db
      .update(issues)
      .set({
        ...data.data,
        closedAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(issues.id, issueId))
      .returning()
      .get()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ── PATCH /api/issues/reorder/:projectId ─────────────────
router.patch('/reorder/:projectId', async (req, res, next) => {
  try {
    const { orderedIds, status } = req.body  // ← add status
    const projectId = Number(req.params.projectId)
    console.log('reorder hit:', { orderedIds, status, projectId })

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: 'orderedIds must be a non-empty array' })
    }

    orderedIds.forEach((id, index) => {
      db.update(issues)
        .set({ boardOrder: index })
        .where(and(
          eq(issues.id, id),
          eq(issues.projectId, projectId),
          eq(issues.status, status)  // ← scope to column status
        ))
        .run()
      console.log(`updated id ${id} to boardOrder ${index}`)
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// ── PATCH /api/issues/:id/status ──────────────────────────
router.patch('/:id/status', async (req, res, next) => {
  try {
    const issueId = Number(req.params.id)
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const existing = db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .get()

    if (!existing) {
      return res.status(404).json({ error: 'Issue not found' })
    }

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

    const updated = db
      .update(issues)
      .set({ status, closedAt, updatedAt: new Date().toISOString() })
      .where(eq(issues.id, issueId))
      .returning()
      .get()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/issues/:id ────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const issueId = Number(req.params.id)

    const existing = db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .get()

    if (!existing) {
      return res.status(404).json({ error: 'Issue not found' })
    }

    db.delete(activityLog)
      .where(eq(activityLog.issueId, issueId))
      .run()

    db.delete(issues)
      .where(eq(issues.id, issueId))
      .run()

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router