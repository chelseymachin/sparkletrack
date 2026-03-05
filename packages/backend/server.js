import express from 'express'
import cors from 'cors'
import { db } from './src/db/client.js'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import projectsRouter from './src/routes/projects.js'
import issuesRouter from './src/routes/issues.js'
import labelsRouter   from './src/routes/labels.js'
import commentsRouter from './src/routes/comments.js'
import dashboardRouter from './src/routes/dashboard.js'
import searchRouter from './src/routes/search.js'
import exportRouter from './src/routes/export.js'

const app = express()
const PORT = process.env.PORT ?? 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin or no origin (Electron)
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
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

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(process.resourcesPath, 'frontend')
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath))
    // SPA fallback — serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next()
      res.sendFile(path.join(frontendPath, 'index.html'))
    })
  }
}

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