-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `cardforeigndata` (
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
	CONSTRAINT `cardforeigndata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cardidentifiers` (
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
	CONSTRAINT `cardidentifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cardlegalities` (
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
	CONSTRAINT `cardlegalities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cardpurchaseurls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardKingdom` text,
	`cardKingdomEtched` text,
	`cardKingdomFoil` text,
	`cardmarket` text,
	`tcgplayer` text,
	`tcgplayerEtched` text,
	`uuid` varchar(36) NOT NULL,
	CONSTRAINT `cardpurchaseurls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cardrulings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date,
	`text` text,
	`uuid` varchar(36) NOT NULL,
	CONSTRAINT `cardrulings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cards` (
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
	`hasFoil` tinyint,
	`hasNonFoil` tinyint,
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
	CONSTRAINT `cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date,
	`version` text,
	CONSTRAINT `meta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `setboostercontents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boosterIndex` int,
	`boosterName` varchar(255),
	`setCode` varchar(20),
	`sheetName` varchar(255),
	`sheetPicks` int,
	CONSTRAINT `setboostercontents_id` PRIMARY KEY(`id`),
	CONSTRAINT `setCode` UNIQUE(`setCode`,`sheetName`,`boosterName`,`boosterIndex`)
);
--> statement-breakpoint
CREATE TABLE `setboostercontentweights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boosterIndex` int,
	`boosterName` varchar(255),
	`boosterWeight` int,
	`setCode` varchar(20),
	CONSTRAINT `setboostercontentweights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `setboostersheetcards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boosterName` varchar(255),
	`cardUuid` varchar(36) NOT NULL,
	`cardWeight` bigint,
	`setCode` varchar(20),
	`sheetName` varchar(255),
	CONSTRAINT `setboostersheetcards_id` PRIMARY KEY(`id`),
	CONSTRAINT `setCode` UNIQUE(`setCode`,`sheetName`,`boosterName`,`cardUuid`)
);
--> statement-breakpoint
CREATE TABLE `setboostersheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boosterName` varchar(255),
	`setCode` varchar(20),
	`sheetHasBalanceColors` tinyint,
	`sheetIsFoil` tinyint,
	`sheetName` varchar(255),
	CONSTRAINT `setboostersheets_id` PRIMARY KEY(`id`),
	CONSTRAINT `setCode` UNIQUE(`setCode`,`sheetName`,`boosterName`)
);
--> statement-breakpoint
CREATE TABLE `sets` (
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
	CONSTRAINT `sets_id` PRIMARY KEY(`id`),
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `settranslations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` text,
	`setCode` varchar(20),
	`translation` text,
	CONSTRAINT `settranslations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokenidentifiers` (
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
	CONSTRAINT `tokenidentifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokens` (
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
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `cardForeignData_uuid` ON `cardforeigndata` (`uuid`);--> statement-breakpoint
CREATE INDEX `cardIdentifiers_uuid` ON `cardidentifiers` (`uuid`);--> statement-breakpoint
CREATE INDEX `cardLegalities_uuid` ON `cardlegalities` (`uuid`);--> statement-breakpoint
CREATE INDEX `cardPurchaseUrls_uuid` ON `cardpurchaseurls` (`uuid`);--> statement-breakpoint
CREATE INDEX `cardRulings_uuid` ON `cardrulings` (`uuid`);--> statement-breakpoint
CREATE INDEX `cards_uuid` ON `cards` (`uuid`);--> statement-breakpoint
CREATE INDEX `tokenIdentifiers_uuid` ON `tokenidentifiers` (`uuid`);--> statement-breakpoint
CREATE INDEX `tokens_uuid` ON `tokens` (`uuid`);
*/