CREATE TABLE `authTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(32) NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `authTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `profiledata` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `profiledata` ADD `roles` varchar(255);--> statement-breakpoint
ALTER TABLE `profiledata` ADD `emailVerifiedAt` timestamp;--> statement-breakpoint
CREATE INDEX `authTokens_tokenHash` ON `authTokens` (`tokenHash`);--> statement-breakpoint
CREATE INDEX `authTokens_userId` ON `authTokens` (`userId`);