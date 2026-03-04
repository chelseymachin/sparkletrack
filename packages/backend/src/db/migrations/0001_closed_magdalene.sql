PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer,
	`project_id` integer,
	`action` text NOT NULL,
	`from_value` text,
	`to_value` text,
	`created_at` text DEFAULT '2026-03-04T18:55:16.619Z' NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_activity_log`("id", "issue_id", "project_id", "action", "from_value", "to_value", "created_at") SELECT "id", "issue_id", "project_id", "action", "from_value", "to_value", "created_at" FROM `activity_log`;--> statement-breakpoint
DROP TABLE `activity_log`;--> statement-breakpoint
ALTER TABLE `__new_activity_log` RENAME TO `activity_log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` text DEFAULT '2026-03-04T18:55:16.619Z' NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "issue_id", "body", "created_at") SELECT "id", "issue_id", "body", "created_at" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
CREATE TABLE `__new_issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`number` integer NOT NULL,
	`full_key` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'task' NOT NULL,
	`status` text DEFAULT 'backlog' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`board_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '2026-03-04T18:55:16.618Z' NOT NULL,
	`updated_at` text DEFAULT '2026-03-04T18:55:16.618Z' NOT NULL,
	`closed_at` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_issues`("id", "project_id", "number", "full_key", "title", "description", "type", "status", "priority", "board_order", "created_at", "updated_at", "closed_at") SELECT "id", "project_id", "number", "full_key", "title", "description", "type", "status", "priority", "board_order", "created_at", "updated_at", "closed_at" FROM `issues`;--> statement-breakpoint
DROP TABLE `issues`;--> statement-breakpoint
ALTER TABLE `__new_issues` RENAME TO `issues`;--> statement-breakpoint
CREATE UNIQUE INDEX `issues_full_key_unique` ON `issues` (`full_key`);--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`prefix` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#ff5eab' NOT NULL,
	`icon` text DEFAULT '🌸' NOT NULL,
	`created_at` text DEFAULT '2026-03-04T18:55:16.617Z' NOT NULL,
	`archived` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "name", "prefix", "description", "color", "icon", "created_at", "archived") SELECT "id", "name", "prefix", "description", "color", "icon", "created_at", "archived" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_prefix_unique` ON `projects` (`prefix`);