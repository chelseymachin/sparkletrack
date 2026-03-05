import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ── Projects ─────────────────────────────────────────────
export const projects = sqliteTable('projects', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  prefix:      text('prefix').notNull().unique(),  
  description: text('description'),
  color:       text('color').notNull().default('#ff5eab'),
  icon:        text('icon').notNull().default('🌸'),
  createdAt:   text('created_at').notNull().default(new Date().toISOString()),
  archived:    integer('archived', { mode: 'boolean' }).notNull().default(false),
})

// ── Issues ────────────────────────────────────────────────
export const issues = sqliteTable('issues', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  projectId:   integer('project_id').notNull().references(() => projects.id),
  number:      integer('number').notNull(),
  fullKey:     text('full_key').notNull().unique(),
  title:       text('title').notNull(),
  description: text('description'),
  type:        text('type').notNull().default('task'),
  status:      text('status').notNull().default('backlog'),
  priority:    text('priority').notNull().default('medium'),
  boardOrder:  integer('board_order').notNull().default(0),
  archived:    integer('archived', { mode: 'boolean' }).notNull().default(false), 
  createdAt:   text('created_at').notNull().default(new Date().toISOString()),
  updatedAt:   text('updated_at').notNull().default(new Date().toISOString()),
  closedAt:    text('closed_at'),
})

// ── Labels ────────────────────────────────────────────────
export const labels = sqliteTable('labels', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  name:      text('name').notNull(),
  color:     text('color').notNull().default('#d0b0ff'),
})

// ── Issue ↔ Label join table ──────────────────────────────
export const issueLabels = sqliteTable('issue_labels', {
  issueId:  integer('issue_id').notNull().references(() => issues.id),
  labelId:  integer('label_id').notNull().references(() => labels.id),
})

// ── Comments ──────────────────────────────────────────────
export const comments = sqliteTable('comments', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  issueId:   integer('issue_id').notNull().references(() => issues.id),
  body:      text('body').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})

// ── Activity Log ──────────────────────────────────────────
export const activityLog = sqliteTable('activity_log', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  issueId:   integer('issue_id').references(() => issues.id),
  projectId: integer('project_id').references(() => projects.id),
  action:    text('action').notNull(),
  fromValue: text('from_value'),          
  toValue:   text('to_value'),           
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})