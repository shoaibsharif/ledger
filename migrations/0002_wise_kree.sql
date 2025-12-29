PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_debts` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_debts`("id", "person_id", "amount", "currency", "description", "type", "status", "due_date", "created_at", "updated_at") SELECT "id", "person_id", "amount", "currency", "description", "type", "status", "due_date", "created_at", "updated_at" FROM `debts`;--> statement-breakpoint
DROP TABLE `debts`;--> statement-breakpoint
ALTER TABLE `__new_debts` RENAME TO `debts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`debt_id` text NOT NULL,
	`amount` real NOT NULL,
	`paid_at` integer DEFAULT (unixepoch()),
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`debt_id`) REFERENCES `debts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_payments`("id", "debt_id", "amount", "paid_at", "notes", "created_at") SELECT "id", "debt_id", "amount", "paid_at", "notes", "created_at" FROM `payments`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
ALTER TABLE `__new_payments` RENAME TO `payments`;--> statement-breakpoint
CREATE TABLE `__new_people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_people`("id", "name", "email", "phone", "notes", "created_at", "updated_at") SELECT "id", "name", "email", "phone", "notes", "created_at", "updated_at" FROM `people`;--> statement-breakpoint
DROP TABLE `people`;--> statement-breakpoint
ALTER TABLE `__new_people` RENAME TO `people`;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "token", "expires_at", "created_at") SELECT "id", "token", "expires_at", "created_at" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "created_at") SELECT "id", "email", "password", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);