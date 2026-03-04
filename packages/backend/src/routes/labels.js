import { Router } from 'express'
import { db } from '../db/client.js'
import { labels, issueLabels } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const router = Router()

const labelSchema = z.object({
  name:  z.string().min(1, 'Name is required'),
  color: z.string().default('#ff5eab'),
})

// ── GET /api/projects/:projectId/labels ───────────────────
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const result = db
      .select()
      .from(labels)
      .where(eq(labels.projectId, Number(req.params.projectId)))
      .all()

    res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/projects/:projectId/labels ──────────────────
router.post('/project/:projectId', async (req, res, next) => {
  try {
    const data = labelSchema.safeParse(req.body)
    if (!data.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: data.error.flatten().fieldErrors
      })
    }

    const newLabel = db
      .insert(labels)
      .values({
        projectId: Number(req.params.projectId),
        name:      data.data.name,
        color:     data.data.color,
      })
      .returning()
      .get()

    res.status(201).json(newLabel)
  } catch (err) {
    next(err)
  }
})

// ── PUT /api/labels/:id ───────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const data = labelSchema.safeParse(req.body)
    if (!data.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: data.error.flatten().fieldErrors
      })
    }

    const existing = db
      .select()
      .from(labels)
      .where(eq(labels.id, Number(req.params.id)))
      .get()

    if (!existing) {
      return res.status(404).json({ error: 'Label not found' })
    }

    const updated = db
      .update(labels)
      .set({ name: data.data.name, color: data.data.color })
      .where(eq(labels.id, Number(req.params.id)))
      .returning()
      .get()

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/labels/:id ────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = db
      .select()
      .from(labels)
      .where(eq(labels.id, Number(req.params.id)))
      .get()

    if (!existing) {
      return res.status(404).json({ error: 'Label not found' })
    }

    // Remove all issue associations first
    db.delete(issueLabels)
      .where(eq(issueLabels.labelId, Number(req.params.id)))
      .run()

    db.delete(labels)
      .where(eq(labels.id, Number(req.params.id)))
      .run()

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/issues/:issueId/labels/:labelId ─────────────
router.post('/issue/:issueId/add/:labelId', async (req, res, next) => {
  try {
    const issueId  = Number(req.params.issueId)
    const labelId  = Number(req.params.labelId)

    // Check if already assigned
    const existing = db
      .select()
      .from(issueLabels)
      .where(and(
        eq(issueLabels.issueId, issueId),
        eq(issueLabels.labelId, labelId)
      ))
      .get()

    if (existing) {
      return res.status(409).json({ error: 'Label already assigned' })
    }

    db.insert(issueLabels)
      .values({ issueId, labelId })
      .run()

    res.status(201).json({ success: true })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/issues/:issueId/labels/:labelId ───────────
router.delete('/issue/:issueId/remove/:labelId', async (req, res, next) => {
  try {
    db.delete(issueLabels)
      .where(and(
        eq(issueLabels.issueId, Number(req.params.issueId)),
        eq(issueLabels.labelId, Number(req.params.labelId))
      ))
      .run()

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/issues/:issueId/labels ──────────────────────
router.get('/issue/:issueId', async (req, res, next) => {
  try {
    const result = db
      .select({
        id:    labels.id,
        name:  labels.name,
        color: labels.color,
      })
      .from(issueLabels)
      .innerJoin(labels, eq(issueLabels.labelId, labels.id))
      .where(eq(issueLabels.issueId, Number(req.params.issueId)))
      .all()

    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router