CREATE TABLE `identity_tiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room` text NOT NULL,
	`client_id` text NOT NULL,
	`current_word` text DEFAULT '' NOT NULL,
	`future_phrase` text DEFAULT '' NOT NULL,
	`bridge_phrase` text DEFAULT '' NOT NULL,
	`current_color` text NOT NULL,
	`future_color` text NOT NULL,
	`shape` text NOT NULL,
	`motion` text NOT NULL,
	`distance` integer DEFAULT 48 NOT NULL,
	`share_words` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_identity_tiles_room_client` ON `identity_tiles` (`room`,`client_id`);