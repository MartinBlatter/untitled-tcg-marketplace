import { relations } from "drizzle-orm";
import { float, int, mysqlTable, text, tinyint, varchar } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

// Define table schemas first
export const BuylistData = mysqlTable("mtg.buylist", {
    id: int().autoincrement().primaryKey().notNull(),
    userId: int(),
    type: text(),
    name: text(),
    description: text(),
    isPublic: tinyint().default(0),
    ...timestamps
});

export const BuylistItemData = mysqlTable("mtg.buylistitems", {
    id: int().autoincrement().primaryKey().notNull(),
    uuid: varchar({ length: 255 }),
    buylistId: int().notNull(),
    quantity: int().default(1),
    maxBuys: int().default(0), // Maximum number of items to buy
    bought: int().default(0),  // Number of items already bought
    language: text(),
    quality: text(),
    isFoil: tinyint().default(0),
    isAltered: tinyint().default(0),
    isSigned: tinyint().default(0),
    isMisprint: tinyint().default(0),
    isGraded: tinyint().default(0),
    price: float(),
    comment: text(),
    name: text(),
    setCodes: text(),
    ...timestamps
});

// Define relations after table schemas
export const buylistsRelations = relations(BuylistData, ({ many }) => ({
    items: many(BuylistItemData),
}));

export const BuylistItemRelations = relations(BuylistItemData, ({ one }) => ({
    buylist: one(BuylistData, { fields: [BuylistItemData.buylistId], references: [BuylistData.id] }),
}));