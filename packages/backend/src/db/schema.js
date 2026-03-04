import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ── Projects ─────────────────────────────────────────────
export const projects = sqliteTable('projects', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  prefix:      text('prefix').notNull().unique(),   // e.g. "SPARK" — immutable after creation
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
  number:      integer('number').notNull(),          // per-project incrementing number
  fullKey:     text('full_key').notNull().unique(),  // e.g. "SPARK-42"
  title:       text('title').notNull(),
  description: text('description'),                  // stored as HTML from Tiptap
  type:        text('type').notNull().default('task'),        // bug | feature | task | chore
  status:      text('status').notNull().default('backlog'),   // backlog | todo | in_progress | in_review | done
  priority:    text('priority').notNull().default('medium'),  // low | medium | high | critical
  boardOrder:  integer('board_order').notNull().default(0),
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
  action:    text('action').notNull(),    // e.g. "status_changed", "comment_added", "issue_created"
  fromValue: text('from_value'),          // e.g. "todo"
  toValue:   text('to_value'),            // e.g. "in_progress"
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})