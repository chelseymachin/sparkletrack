import express from 'express'
import cors from 'cors'
import { db } from './src/db/client.js'
import projectsRouter from './src/routes/projects.js'
import issuesRouter from './src/routes/issues.js'
import labelsRouter   from './src/routes/labels.js'
import commentsRouter from './src/routes/comments.js'
import dashboardRouter from './src/routes/dashboard.js'
import searchRouter from './src/routes/search.js'
import exportRouter from './src/routes/export.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '✨ SparkleTrack API is running!' })
})

router.use('/projects', projectsRouter)
router.use('/issues', issuesRouter)
router.use('/labels', labelsRouter)
router.use('/comments', commentsRouter)
router.use('/dashboard', dashboardRouter)
router.use('/search', searchRouter)
router.use('/export', exportRouter)

router.post('/projects/:projectId/issues', (req, res, next) => {
  req.url = `/project/${req.params.projectId}`
  issuesRouter(req, res, next)
})

router.get('/projects/:projectId/issues', (req, res, next) => {
  req.url = `/project/${req.params.projectId}`
  issuesRouter(req, res, next)
})

// Project-scoped label routes
router.get('/projects/:projectId/labels', (req, res, next) => {
  req.url = `/project/${req.params.projectId}`
  labelsRouter(req, res, next)
})

router.post('/projects/:projectId/labels', (req, res, next) => {
  req.url = `/project/${req.params.projectId}`
  labelsRouter(req, res, next)
})

// Issue-scoped comment routes
router.get('/issues/:issueId/comments', (req, res, next) => {
  req.url = `/${req.params.issueId}`
  commentsRouter(req, res, next)
})

router.post('/issues/:issueId/comments', (req, res, next) => {
  req.url = `/${req.params.issueId}`
  commentsRouter(req, res, next)
})

// Issue-label association routes
router.post('/issues/:issueId/labels/:labelId', (req, res, next) => {
  req.url = `/issue/${req.params.issueId}/add/${req.params.labelId}`
  labelsRouter(req, res, next)
})

router.delete('/issues/:issueId/labels/:labelId', (req, res, next) => {
  req.url = `/issue/${req.params.issueId}/remove/${req.params.labelId}`
  labelsRouter(req, res, next)
})

app.use('/api', router)

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🌸 SparkleTrack API running at http://localhost:${PORT}`)
})