import { int, mysqlTable, text, timestamp } from "drizzle-orm/mysql-core";

export const PicklistData = mysqlTable("picklist", {
    id: int().autoincrement().primaryKey().notNull(),
    userId: int(),
    name: text(),
    updatedAt: timestamp(),
    createdAt: timestamp().defaultNow().notNull(),
});

export const PicklistItemData = mysqlTable("picklistItems", {
    id: int().autoincrement().primaryKey().notNull(),
    picklistId: int(),
    orderItemId: int(),
    status: text().default("pending"),
    problem: text(),
    updatedAt: timestamp(),
    createdAt: timestamp().defaultNow().notNull(),
});