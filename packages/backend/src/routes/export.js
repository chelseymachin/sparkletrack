import { Router } from 'express'
import { db } from '../db/client.js'
import { issues, projects, labels, issueLabels, comments, activityLog } from '../db/schema.js'

const router = Router()

// ── GET /api/export/json ──────────────────────────────────
router.get('/json', async (req, res, next) => {
  try {
    const allProjects    = db.select().from(projects).all()
    const allIssues      = db.select().from(issues).all()
    const allLabels      = db.select().from(labels).all()
    const allIssueLabels = db.select().from(issueLabels).all()
    const allComments    = db.select().from(comments).all()
    const allActivity    = db.select().from(activityLog).all()

    const exportData = {
      exportedAt: new Date().toISOString(),
      version:    '1.0',
      data: {
        projects:    allProjects,
        issues:      allIssues,
        labels:      allLabels,
        issueLabels: allIssueLabels,
        comments:    allComments,
        activity:    allActivity,
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="sparkletrack-export-${Date.now()}.json"`)
    res.json(exportData)
  } catch (err) {
    next(err)
  }
})

export default router