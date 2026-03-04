import { Router } from 'express'
import { db } from '../db/client.js'
import { comments, activityLog } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const router = Router()

const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
})

// ── GET /api/issues/:issueId/comments ────────────────────
router.get('/:issueId', async (req, res, next) => {
  try {
    const result = db
      .select()
      .from(comments)
      .where(eq(comments.issueId, Number(req.params.issueId)))
      .orderBy(desc(comments.createdAt))
      .all()

    res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/issues/:issueId/comments ───────────────────
router.post('/:issueId', async (req, res, next) => {
  try {
    const issueId = Number(req.params.issueId)

    const data = commentSchema.safeParse(req.body)
    if (!data.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: data.error.flatten().fieldErrors
      })
    }

    const newComment = db
      .insert(comments)
      .values({
        issueId,
        body:      data.data.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning()
      .get()

    res.status(201).json(newComment)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/comments/:id ──────────────────────────────
router.delete('/delete/:id', async (req, res, next) => {
  try {
    const existing = db
      .select()
      .from(comments)
      .where(eq(comments.id, Number(req.params.id)))
      .get()

    if (!existing) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    db.delete(comments)
      .where(eq(comments.id, Number(req.params.id)))
      .run()

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router