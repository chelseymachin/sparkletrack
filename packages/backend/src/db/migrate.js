import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dbPath = process.env.DB_PATH
  ?? path.resolve(__dirname, '../../sparkletrack.db')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite)

const migrationsFolder = path.resolve(__dirname, './migrations')

console.log('✨ Running migrations...')
migrate(db, { migrationsFolder })
console.log('✅ Migrations complete!')

sqlite.close()