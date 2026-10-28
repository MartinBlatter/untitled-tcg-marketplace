CREATE TABLE `helpArticleRelated` (
    `id` int AUTO_INCREMENT NOT NULL,
    `articleId` varchar(255) NOT NULL,
    `relatedArticleId` varchar(255) NOT NULL,
    `relevanceScore` int DEFAULT 1,
    `updatedAt` timestamp,
    `createdAt` timestamp DEFAULT (now()) NOT NULL,
    `deactivatedAt` timestamp,
    CONSTRAINT `helpArticleRelated_id` PRIMARY KEY(`id`),
    FOREIGN KEY (`articleId`) REFERENCES `helpArticles` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`relatedArticleId`) REFERENCES `helpArticles` (`id`) ON DELETE CASCADE
);