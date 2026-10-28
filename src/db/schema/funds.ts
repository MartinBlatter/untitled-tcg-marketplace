import { int, mysqlTable, primaryKey, varchar } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

export const fundsData = mysqlTable("funds", {
    id: int().autoincrement().primaryKey().notNull(),
    userId: int(),
    funds: varchar({ length: 255 }),
    ...timestamps
},
    (table) => [
        primaryKey({ columns: [table.id], name: "funds_id" }),
    ]);

export const fundsHistoryData = mysqlTable("fundsHistory", {
    id: int().autoincrement().primaryKey().notNull(),
    fundsId: int(),
    amount: varchar({ length: 255 }),
    type: varchar({ length: 255 }),
    addOrSub: varchar({ length: 255 }),
    orderId: int(),
    ...timestamps
},
    (table) => [
        primaryKey({ columns: [table.id], name: "funds_history_id" }),
    ]);