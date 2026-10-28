CREATE TABLE `helpArticles` (
    `id` varchar(255) NOT NULL,
    `title` varchar(255) NOT NULL,
    `content` text NOT NULL,
    `summary` text NOT NULL,
    `category` varchar(50) NOT NULL,
    `tags` text NOT NULL,
    `lastUpdated` timestamp DEFAULT (now()),
    `updatedAt` timestamp,
    `createdAt` timestamp DEFAULT (now()) NOT NULL,
    `deactivatedAt` timestamp,
    CONSTRAINT `helpArticles_id` PRIMARY KEY(`id`)
);