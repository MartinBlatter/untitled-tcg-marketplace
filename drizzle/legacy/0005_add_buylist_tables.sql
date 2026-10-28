-- Create buylist table
CREATE TABLE `mtg.buylist` (
    `id` int AUTO_INCREMENT NOT NULL,
    `userId` int DEFAULT 0,
    `type` text,
    `name` text,
    `description` text,
    `isPublic` tinyint DEFAULT 0,
    `updatedAt` timestamp NULL,
    `createdAt` timestamp DEFAULT (now()) NOT NULL,
    `deactivatedAt` timestamp NULL,
    CONSTRAINT `mtg_buylist_id` PRIMARY KEY(`id`)
);

-- Create buylist items table
CREATE TABLE `mtg.buylistitems` (
    `id` int AUTO_INCREMENT NOT NULL,
    `uuid` varchar(255),
    `buylistId` int NOT NULL,
    `quantity` int DEFAULT 1,
    `maxBuys` int DEFAULT 0,
    `bought` int DEFAULT 0,
    `language` text,
    `quality` text,
    `isFoil` tinyint DEFAULT 0,
    `isAltered` tinyint DEFAULT 0,
    `isSigned` tinyint DEFAULT 0,
    `isMisprint` tinyint DEFAULT 0,
    `isGraded` tinyint DEFAULT 0,
    `price` float DEFAULT 0,
    `comment` text,
    `updatedAt` timestamp NULL,
    `createdAt` timestamp DEFAULT (now()) NOT NULL,
    `deactivatedAt` timestamp NULL,
    `name` text,
    `setCodes` text,
    CONSTRAINT `mtg_buylistitems_id` PRIMARY KEY(`id`)
);

-- Create index for better performance
CREATE INDEX `mtg_buylistitems_buylistId_fk` ON `mtg.buylistitems` (`buylistId`);