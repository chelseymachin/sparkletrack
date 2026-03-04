import express from 'express'
import cors from 'cors'
import { db } from './src/db/client.js'
import projectsRouter from './src/routes/projects.js'
import issuesRouter from './src/routes/issues.js'

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

router.post('/projects/:projectId/issues', (req, res, next) => {
  req.url = `/project/${req.params.projectId}`
  issuesRouter(req, res, next)
})

router.get('/projects/:projectId/issues', (req, res, next) => {
  req.url = `/project/${req.params.projectId}`
  issuesRouter(req, res, next)
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