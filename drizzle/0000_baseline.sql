CREATE TABLE `bugreports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(255),
	`title` varchar(1024),
	`description` text,
	`email` varchar(255),
	`status` varchar(255),
	`closedAt` timestamp,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `bugreports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.buylist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` text,
	`name` text,
	`description` text,
	`isPublic` tinyint DEFAULT 0,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `mtg.buylist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`price` float,
	`comment` text,
	`name` text,
	`setCodes` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `mtg.buylistitems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`funds` varchar(255),
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `funds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fundsHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fundsId` int,
	`amount` varchar(255),
	`type` varchar(255),
	`addOrSub` varchar(255),
	`orderId` int,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `fundsHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `helpArticles` (
	`id` varchar(255) NOT NULL,
	`category` varchar(50) NOT NULL,
	`tags` text NOT NULL,
	`lastUpdated` timestamp DEFAULT (now()),
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `helpArticles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `helpArticleRelated` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` varchar(255) NOT NULL,
	`relatedArticleId` varchar(255) NOT NULL,
	`relevanceScore` int DEFAULT 1,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `helpArticleRelated_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `helpArticleTranslations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` varchar(255) NOT NULL,
	`language` varchar(10) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`summary` text NOT NULL,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `helpArticleTranslations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` text,
	`foreignKeySource` varchar(255),
	`foreignKey` varchar(255),
	`price` float DEFAULT 0,
	`quantity` int DEFAULT 1,
	`quality` text,
	`language` text,
	`comment` text,
	`internalComment` text,
	`isFoil` tinyint DEFAULT 0,
	`isAltered` tinyint DEFAULT 0,
	`isSigned` tinyint DEFAULT 0,
	`isMisprint` tinyint DEFAULT 0,
	`isSealed` tinyint DEFAULT 0,
	`isListed` tinyint DEFAULT 0,
	`isGraded` tinyint DEFAULT 0,
	`grading` text,
	`gradingCompany` text,
	`imagePath` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `mtg.inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.cardForeignData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`faceName` text,
	`flavorText` text,
	`identifiers` text,
	`language` text,
	`multiverseId` int,
	`name` text,
	`text` text,
	`type` text,
	`uuid` varchar(36) NOT NULL,
	CONSTRAINT `mtg.cardforeigndata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.cardIdentifiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardKingdomEtchedId` text,
	`cardKingdomFoilId` text,
	`cardKingdomId` text,
	`cardsphereFoilId` text,
	`cardsphereId` text,
	`mcmId` text,
	`mcmMetaId` text,
	`mtgArenaId` text,
	`mtgjsonFoilVersionId` text,
	`mtgjsonNonFoilVersionId` text,
	`mtgjsonV4Id` text,
	`mtgoFoilId` text,
	`mtgoId` text,
	`multiverseId` text,
	`scryfallCardBackId` text,
	`scryfallId` text,
	`scryfallIllustrationId` text,
	`scryfallOracleId` text,
	`tcgplayerEtchedProductId` text,
	`tcgplayerProductId` text,
	`uuid` varchar(36) NOT NULL,
	CONSTRAINT `mtg.cardidentifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.cardLegalities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alchemy` text,
	`brawl` text,
	`commander` text,
	`duel` text,
	`explorer` text,
	`future` text,
	`gladiator` text,
	`historic` text,
	`legacy` text,
	`modern` text,
	`oathbreaker` text,
	`oldschool` text,
	`pauper` text,
	`paupercommander` text,
	`penny` text,
	`pioneer` text,
	`predh` text,
	`premodern` text,
	`standard` text,
	`standardbrawl` text,
	`timeless` text,
	`uuid` varchar(36) NOT NULL,
	`vintage` text,
	CONSTRAINT `mtg.cardlegalities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.cardPurchaseUrls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardKingdom` text,
	`cardKingdomEtched` text,
	`cardKingdomFoil` text,
	`cardmarket` text,
	`tcgplayer` text,
	`tcgplayerEtched` text,
	`uuid` varchar(36) NOT NULL,
	CONSTRAINT `mtg.cardpurchaseurls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.cardRulings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date,
	`text` text,
	`uuid` varchar(36) NOT NULL,
	CONSTRAINT `mtg.cardrulings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artist` text,
	`artistIds` text,
	`asciiName` text,
	`attractionLights` text,
	`availability` text,
	`boosterTypes` text,
	`borderColor` text,
	`cardParts` text,
	`colorIdentity` text,
	`colorIndicator` text,
	`colors` text,
	`defense` text,
	`duelDeck` text,
	`edhrecRank` int,
	`edhrecSaltiness` float,
	`faceConvertedManaCost` float,
	`faceFlavorName` text,
	`faceManaValue` float,
	`faceName` text,
	`finishes` text,
	`flavorName` text,
	`flavorText` text,
	`frameEffects` text,
	`frameVersion` text,
	`hand` text,
	`hasAlternativeDeckLimit` tinyint,
	`hasContentWarning` tinyint,
	`isAlternative` tinyint,
	`isFullArt` tinyint,
	`isFunny` tinyint,
	`isOnlineOnly` tinyint,
	`isOversized` tinyint,
	`isPromo` tinyint,
	`isRebalanced` tinyint,
	`isReprint` tinyint,
	`isReserved` tinyint,
	`isStarter` tinyint,
	`isStorySpotlight` tinyint,
	`isTextless` tinyint,
	`isTimeshifted` tinyint,
	`keywords` text,
	`language` text,
	`layout` text,
	`leadershipSkills` text,
	`life` text,
	`loyalty` text,
	`manaCost` text,
	`manaValue` float,
	`name` text,
	`number` text,
	`originalPrintings` text,
	`originalReleaseDate` text,
	`originalText` text,
	`originalType` text,
	`otherFaceIds` text,
	`power` text,
	`printings` text,
	`promoTypes` text,
	`rarity` text,
	`rebalancedPrintings` text,
	`relatedCards` text,
	`securityStamp` text,
	`setCode` text,
	`side` text,
	`signature` text,
	`sourceProducts` text,
	`subsets` text,
	`subtypes` text,
	`supertypes` text,
	`text` text,
	`toughness` text,
	`type` text,
	`types` text,
	`uuid` varchar(36) NOT NULL,
	`variations` text,
	`watermark` text,
	CONSTRAINT `mtg.cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.meta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date,
	`version` text,
	CONSTRAINT `mtg.meta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.setBoosterContents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boosterIndex` int,
	`boosterName` varchar(255),
	`setCode` varchar(20),
	`sheetName` varchar(255),
	`sheetPicks` int,
	CONSTRAINT `mtg.setboostercontents_id` PRIMARY KEY(`id`),
	CONSTRAINT `setCode` UNIQUE(`setCode`,`sheetName`,`boosterName`,`boosterIndex`)
);
--> statement-breakpoint
CREATE TABLE `mtg.setBoosterContentWeights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boosterIndex` int,
	`boosterName` varchar(255),
	`boosterWeight` int,
	`setCode` varchar(20),
	CONSTRAINT `mtg.setboostercontentweights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.setBoosterSheetCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boosterName` varchar(255),
	`cardUuid` varchar(36) NOT NULL,
	`cardWeight` bigint,
	`setCode` varchar(20),
	`sheetName` varchar(255),
	CONSTRAINT `mtg.setboostersheetcards_id` PRIMARY KEY(`id`),
	CONSTRAINT `setCode` UNIQUE(`setCode`,`sheetName`,`boosterName`,`cardUuid`)
);
--> statement-breakpoint
CREATE TABLE `mtg.setBoosterSheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boosterName` varchar(255),
	`setCode` varchar(20),
	`sheetHasBalanceColors` tinyint,
	`sheetIsFoil` tinyint,
	`sheetName` varchar(255),
	CONSTRAINT `mtg.setboostersheets_id` PRIMARY KEY(`id`),
	CONSTRAINT `setCode` UNIQUE(`setCode`,`sheetName`,`boosterName`)
);
--> statement-breakpoint
CREATE TABLE `mtg.sets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`baseSetSize` int,
	`block` text,
	`cardsphereSetId` int,
	`code` varchar(8) NOT NULL,
	`isFoilOnly` tinyint,
	`isForeignOnly` tinyint,
	`isNonFoilOnly` tinyint,
	`isOnlineOnly` tinyint,
	`isPartialPreview` tinyint,
	`keyruneCode` text,
	`languages` text,
	`mcmId` int,
	`mcmIdExtras` int,
	`mcmName` text,
	`mtgoCode` text,
	`name` text,
	`parentCode` text,
	`releaseDate` text,
	`tcgplayerGroupId` int,
	`tokenSetCode` text,
	`totalSetSize` int,
	`type` text,
	CONSTRAINT `mtg.sets_id` PRIMARY KEY(`id`),
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `mtg.setTranslations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` text,
	`setCode` varchar(20),
	`translation` text,
	CONSTRAINT `mtg.settranslations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.tokenIdentifiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardKingdomEtchedId` text,
	`cardKingdomFoilId` text,
	`cardKingdomId` text,
	`cardsphereFoilId` text,
	`cardsphereId` text,
	`mcmId` text,
	`mcmMetaId` text,
	`mtgArenaId` text,
	`mtgjsonFoilVersionId` text,
	`mtgjsonNonFoilVersionId` text,
	`mtgjsonV4Id` text,
	`mtgoFoilId` text,
	`mtgoId` text,
	`multiverseId` text,
	`scryfallCardBackId` text,
	`scryfallId` text,
	`scryfallIllustrationId` text,
	`scryfallOracleId` text,
	`tcgplayerEtchedProductId` text,
	`tcgplayerProductId` text,
	`uuid` varchar(36) NOT NULL,
	CONSTRAINT `mtg.tokenidentifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artist` text,
	`artistIds` text,
	`asciiName` text,
	`availability` text,
	`boosterTypes` text,
	`borderColor` text,
	`colorIdentity` text,
	`colors` text,
	`edhrecSaltiness` float,
	`faceName` text,
	`finishes` text,
	`flavorName` text,
	`flavorText` text,
	`frameEffects` text,
	`frameVersion` text,
	`hasFoil` tinyint,
	`hasNonFoil` tinyint,
	`isFullArt` tinyint,
	`isFunny` tinyint,
	`isOversized` tinyint,
	`isPromo` tinyint,
	`isReprint` tinyint,
	`isTextless` tinyint,
	`keywords` text,
	`language` text,
	`layout` text,
	`manaCost` text,
	`name` text,
	`number` text,
	`orientation` text,
	`originalText` text,
	`originalType` text,
	`otherFaceIds` text,
	`power` text,
	`promoTypes` text,
	`relatedCards` text,
	`reverseRelated` text,
	`securityStamp` text,
	`setCode` text,
	`side` text,
	`signature` text,
	`subtypes` text,
	`supertypes` text,
	`text` text,
	`toughness` text,
	`type` text,
	`types` text,
	`uuid` varchar(36) NOT NULL,
	`watermark` text,
	CONSTRAINT `mtg.tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int,
	`recipientId` int,
	`title` text,
	`text` text,
	`read` tinyint DEFAULT 0,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderAddress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`address` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `orderAddress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderCancellation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`message` text,
	`status` text,
	`requestedByUserId` int,
	`acceptedAt` timestamp,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `orderCancellation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int,
	`game` text,
	`sellerId` int,
	`status` text,
	`paymentStatus` text,
	`shippingStatus` text,
	`totalPrice` float,
	`paidAt` timestamp,
	`shippedAt` timestamp,
	`arrivedAt` timestamp,
	`cancelledAt` timestamp,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItem` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`foreignKey` varchar(255),
	`foreignKeySource` text,
	`quantity` int,
	`price` float,
	`displayName` text,
	`game` text,
	`type` text,
	`originalItem` json,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `orderItem_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderShipping` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`displayName` text,
	`price` float,
	`trackingNumber` text,
	`tracking` tinyint,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `orderShipping_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `picklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `picklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `picklistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`picklistId` int,
	`orderItemId` int,
	`status` text DEFAULT ('pending'),
	`problem` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `picklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shoppingCart` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`status` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `shoppingCart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shoppingCartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int,
	`status` text,
	`game` text,
	`foreignKeySource` text,
	`foreignKey` text,
	`quantity` int,
	`price` text,
	`displayName` text,
	`sellerId` int,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `shoppingCartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` varchar(36) NOT NULL,
	`userId` varchar(255),
	`category` varchar(50) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`contactEmail` varchar(255),
	`createdAt` timestamp NOT NULL,
	`status` enum('open','in_progress','resolved','closed') NOT NULL,
	`responseMessage` text,
	`respondedBy` varchar(255),
	`respondedAt` timestamp,
	`resolvedAt` timestamp,
	`reviewedAt` timestamp,
	`closedAt` timestamp,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `address` (
	`id` int AUTO_INCREMENT NOT NULL,
	`address` text,
	`eMail` varchar(255),
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `address_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customShipping` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(255),
	`cards` int,
	`maxValue` int,
	`weight` int,
	`price` int,
	`tracking` int,
	`range` varchar(255),
	CONSTRAINT `customShipping_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profilebusinessdata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`eMail` varchar(255) NOT NULL,
	`description` text,
	`UstId` varchar(255),
	`presale` tinyint DEFAULT 0,
	`avatar` varchar(255),
	`banner` varchar(255),
	`taxNumber` varchar(255),
	`country` varchar(255),
	`imprint` text,
	`terms` text,
	`privacy` text,
	`revocation` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `profileBusinessData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiledata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userName` varchar(255),
	`firstName` text,
	`lastName` text,
	`company` text,
	`address` text,
	`shippingAddress` int,
	`type` text,
	`eMail` varchar(255),
	`active` tinyint,
	`onVacation` tinyint,
	`lastLogin` date,
	`country` varchar(255),
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `profiledata_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiledata_userName_unique` UNIQUE(`userName`),
	CONSTRAINT `profiledata_eMail_unique` UNIQUE(`eMail`)
);
--> statement-breakpoint
CREATE TABLE `profileSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`value` varchar(255),
	CONSTRAINT `profileSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.wishlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` text,
	`name` text,
	`description` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `mtg.wishlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mtg.wishlistitems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(255),
	`wishlistId` int NOT NULL,
	`name` text,
	`setCodes` text,
	`quantity` int DEFAULT 1,
	`language` text,
	`quality` text,
	`isFoil` tinyint DEFAULT 0,
	`isAltered` tinyint DEFAULT 0,
	`isSigned` tinyint DEFAULT 0,
	`isMisprint` tinyint DEFAULT 0,
	`isGraded` tinyint DEFAULT 0,
	`price` float,
	`comment` text,
	`updatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deactivatedAt` timestamp,
	CONSTRAINT `mtg.wishlistitems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `cardForeignData_uuid` ON `mtg.cardForeignData` (`uuid`);--> statement-breakpoint
CREATE INDEX `cardIdentifiers_uuid` ON `mtg.cardIdentifiers` (`uuid`);--> statement-breakpoint
CREATE INDEX `cardLegalities_uuid` ON `mtg.cardLegalities` (`uuid`);--> statement-breakpoint
CREATE INDEX `cardPurchaseUrls_uuid` ON `mtg.cardPurchaseUrls` (`uuid`);--> statement-breakpoint
CREATE INDEX `cardRulings_uuid` ON `mtg.cardRulings` (`uuid`);--> statement-breakpoint
CREATE INDEX `cards_uuid` ON `mtg.cards` (`uuid`);--> statement-breakpoint
CREATE INDEX `tokenIdentifiers_uuid` ON `mtg.tokenIdentifiers` (`uuid`);--> statement-breakpoint
CREATE INDEX `tokens_uuid` ON `mtg.tokens` (`uuid`);--> statement-breakpoint
CREATE INDEX `profileBusinessData_email` ON `profilebusinessdata` (`eMail`);--> statement-breakpoint
CREATE INDEX `profiledata_email` ON `profiledata` (`eMail`);