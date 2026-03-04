import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Resolve DB path ───────────────────────────────────────
// Uses DB_PATH env var if set, otherwise puts the file right
// in the backend folder at packages/backend/sparkletrack.db
const dbPath = process.env.DB_PATH
  ?? path.resolve(__dirname, '../../sparkletrack.db')

// Make sure the directory exists (matters if DB_PATH points somewhere custom)
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

// ── Connect ───────────────────────────────────────────────
const sqlite = new Database(dbPath)

// These pragmas make SQLite much faster and enforce foreign keys
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

// ── Drizzle instance (what your routes will import) ───────
export const db = drizzle(sqlite, { schema })

// ── Auto-migrate on startup ───────────────────────────────
// Runs any pending migrations from your migrations folder.
// Safe to call every time — only applies what's new.
const migrationsFolder = path.resolve(__dirname, './migrations')

migrate(db, { migrationsFolder })

console.log(`✨ Database connected: ${dbPath}`)