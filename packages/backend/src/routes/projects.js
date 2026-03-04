import { Router } from 'express'
import { db } from '../db/client.js'
import { projects, issues } from '../db/schema.js'
import { eq, sql, and } from 'drizzle-orm'
import { z } from 'zod'

const router = Router()

// ── Validation schemas ────────────────────────────────────
const createProjectSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  prefix:      z.string()
                .min(2, 'Prefix must be at least 2 characters')
                .max(6, 'Prefix must be 6 characters or fewer')
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
  // prefix intentionally excluded — immutable after creation
})

// ── GET /api/projects ─────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const allProjects = db
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

    res.json(allProjects)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/projects/:id ─────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
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
      .where(eq(projects.id, Number(req.params.id)))
      .get()

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json(project)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/projects ────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    // Auto-uppercase the prefix before validation
    if (req.body.prefix) {
      req.body.prefix = req.body.prefix.toUpperCase()
    }

    const data = createProjectSchema.safeParse(req.body)
    if (!data.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: data.error.flatten().fieldErrors
      })
    }

    // Check prefix uniqueness
    const existing = db
      .select()
      .from(projects)
      .where(eq(projects.prefix, data.data.prefix))
      .get()

    if (existing) {
      return res.status(409).json({
        error: 'Prefix already in use',
        details: { prefix: [`"${data.data.prefix}" is already taken`] }
      })
    }

    const newProject = db
      .insert(projects)
      .values({
        ...data.data,
        createdAt: new Date().toISOString(),
        archived: false,
      })
      .returning()
      .get()

    res.status(201).json(newProject)
  } catch (err) {
    next(err)
  }
})

// ── PUT /api/projects/:id ─────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const data = updateProjectSchema.safeParse(req.body)
    if (!data.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: data.error.flatten().fieldErrors
      })
    }

    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, Number(req.params.id)))
      .get()

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const updated = db
      .update(projects)
      .set(data.data)
      .where(eq(projects.id, Number(req.params.id)))
      .returning()
      .get()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/projects/:id (soft delete / archive) ──────
router.delete('/:id', async (req, res, next) => {
  try {
    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, Number(req.params.id)))
      .get()

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Soft delete the project
    db.update(projects)
      .set({ archived: true })
      .where(eq(projects.id, Number(req.params.id)))
      .run()

    // Cascade close all open issues for this project
    db.update(issues)
      .set({
        status: 'done',
        closedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(issues.projectId, Number(req.params.id)),
          sql`${issues.status} != 'done'`
        )
      )
      .run()

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router