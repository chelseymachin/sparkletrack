import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate as drizzleMigrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createDb() {
  const userDataPath = app.getPath('userData')
  fs.mkdirSync(userDataPath, { recursive: true })
  const dbPath = path.join(userDataPath, 'sparkletrack.db')

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite)

  const migrate = () => {
  const migrationsFolder = path.join(__dirname, 'migrations')
  console.log('📁 DB path:', dbPath)           // ← add this
  console.log('📁 Migrations:', migrationsFolder) // ← and this
  sqlite.pragma('foreign_keys = OFF')
  drizzleMigrate(db, { migrationsFolder })
  sqlite.pragma('foreign_keys = ON')
  console.log('✅ Migrations complete!')
}

  return { db, migrate }
}