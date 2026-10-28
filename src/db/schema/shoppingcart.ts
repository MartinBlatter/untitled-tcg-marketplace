import { int, mysqlTable, text } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

export const shoppingCartData = mysqlTable("shoppingCart", {
    id: int().autoincrement().primaryKey().notNull(),
    userId: int(),
    status: text(),
    ...timestamps
});

export const shoppingCartItemData = mysqlTable("shoppingCartItems", {
    id: int().autoincrement().primaryKey().notNull(),
    cartId: int(),
    status: text(),
    game: text(),
    foreignKeySource: text(),
    foreignKey: text(),
    quantity: int(),
    price: text(),
    displayName: text(),
    sellerId: int(),
    ...timestamps
});