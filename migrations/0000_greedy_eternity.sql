CREATE TABLE `debts` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` integer,
	`created_at` integer DEFAULT '"2025-12-28T21:10:28.591Z"',
	`updated_at` integer DEFAULT '"2025-12-28T21:10:28.591Z"',
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`debt_id` text NOT NULL,
	`amount` real NOT NULL,
	`paid_at` integer DEFAULT '"2025-12-28T21:10:28.591Z"',
	`notes` text,
	`created_at` integer DEFAULT '"2025-12-28T21:10:28.591Z"',
	FOREIGN KEY (`debt_id`) REFERENCES `debts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`notes` text,
	`created_at` integer DEFAULT '"2025-12-28T21:10:28.591Z"',
	`updated_at` integer DEFAULT '"2025-12-28T21:10:28.591Z"'
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT '"2025-12-28T21:10:28.590Z"'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);