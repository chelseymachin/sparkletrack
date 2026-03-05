import { Router } from 'express'
import { db } from '../db/client.js'
import { issues, projects } from '../db/schema.js'
import { like, eq, or } from 'drizzle-orm'

const router = Router()

// ── GET /api/search?q= ────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q?.trim()
    if (!q || q.length < 2) {
      return res.json({ issues: [], projects: [] })
    }

    const pattern = `%${q}%`

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

    res.json({ issues: matchedIssues, projects: matchedProjects })
  } catch (err) {
    next(err)
  }
})

export default router