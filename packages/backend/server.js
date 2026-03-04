import express from 'express'
import cors from 'cors'
import { db } from './src/db/client.js'

const app = express()
const PORT = process.env.PORT ?? 3001

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173'
}))
app.use(express.json())

// ── API Router ────────────────────────────────────────────
const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '✨ SparkleTrack API is running!' })
})

router.get('/projects', (req, res) => res.json([]))
router.get('/issues', (req, res) => res.json([]))

app.use('/api', router)

// ── 404 fallback ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌸 SparkleTrack API running at http://localhost:${PORT}`)
})