import { mysqlTable, int, tinyint, text, varchar, float } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";
import { relations } from "drizzle-orm";

export const WishlistData = mysqlTable("mtg.wishlist", {
    id: int().autoincrement().primaryKey().notNull(),
    userId: int(),
    type: text(),
    name: text(),
    description: text(),
    ...timestamps
});

export const wishlistsRelations = relations(WishlistData, ({ many }) => ({
    items: many(WishlistItemData),
}));

export const WishlistItemData = mysqlTable("mtg.wishlistitems", {
    id: int().autoincrement().primaryKey().notNull(),
    uuid: varchar({ length: 255 }),
    wishlistId: int().notNull(),
    name: text(),
    setCodes: text(),
    quantity: int().default(1),
    language: text(),
    quality: text(),
    isFoil: tinyint().default(0),
    isAltered: tinyint().default(0),
    isSigned: tinyint().default(0),
    isMisprint: tinyint().default(0),
    isGraded: tinyint().default(0),
    price: float(),
    comment: text(),
    ...timestamps
});

export const WanslistItemRelations = relations(WishlistItemData, ({ one }) => ({
    wishlist: one(WishlistData, { fields: [WishlistItemData.wishlistId], references: [WishlistData.id] }),
}));