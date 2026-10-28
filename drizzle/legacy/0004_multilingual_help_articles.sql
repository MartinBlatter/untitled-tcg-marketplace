-- Drop existing tables to recreate with multi-language support
DROP TABLE IF EXISTS helpArticleRelated;
DROP TABLE IF EXISTS helpArticles;

-- Create the base article metadata table
CREATE TABLE `helpArticles` (
    `id` varchar(255) NOT NULL,
    `category` varchar(50) NOT NULL,
    `tags` text NOT NULL,
    `lastUpdated` timestamp DEFAULT (now()),
    `updatedAt` timestamp NULL,
    `createdAt` timestamp DEFAULT (now()) NOT NULL,
    `deactivatedAt` timestamp NULL,
    CONSTRAINT `helpArticles_id` PRIMARY KEY(`id`)
);

-- Create table for language-specific content
CREATE TABLE `helpArticleTranslations` (
    `id` int AUTO_INCREMENT NOT NULL,
    `articleId` varchar(255) NOT NULL,
    `language` varchar(10) NOT NULL,
    `title` varchar(255) NOT NULL,
    `content` text NOT NULL,
    `summary` text NOT NULL,
    `updatedAt` timestamp NULL,
    `createdAt` timestamp DEFAULT (now()) NOT NULL,
    `deactivatedAt` timestamp NULL,
    CONSTRAINT `helpArticleTranslations_id` PRIMARY KEY(`id`),
    CONSTRAINT `unique_article_language` UNIQUE(`articleId`, `language`),
    FOREIGN KEY (`articleId`) REFERENCES `helpArticles` (`id`) ON DELETE CASCADE
);

-- Create table for article relationships
CREATE TABLE `helpArticleRelated` (
    `id` int AUTO_INCREMENT NOT NULL,
    `articleId` varchar(255) NOT NULL,
    `relatedArticleId` varchar(255) NOT NULL,
    `relevanceScore` int DEFAULT 1,
    `updatedAt` timestamp NULL,
    `createdAt` timestamp DEFAULT (now()) NOT NULL,
    `deactivatedAt` timestamp NULL,
    CONSTRAINT `helpArticleRelated_id` PRIMARY KEY(`id`),
    FOREIGN KEY (`articleId`) REFERENCES `helpArticles` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`relatedArticleId`) REFERENCES `helpArticles` (`id`) ON DELETE CASCADE
);

-- Create indices for better performance
CREATE INDEX `idx_article_translations_article_id` ON `helpArticleTranslations` (`articleId`);
CREATE INDEX `idx_article_translations_language` ON `helpArticleTranslations` (`language`);
CREATE INDEX `idx_article_related_article_id` ON `helpArticleRelated` (`articleId`);
CREATE INDEX `idx_article_related_related_article_id` ON `helpArticleRelated` (`relatedArticleId`);