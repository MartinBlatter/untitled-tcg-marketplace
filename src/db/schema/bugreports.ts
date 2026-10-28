import { int, mysqlTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

export const bugReportData = mysqlTable("bugreports", {
    id: int().autoincrement().primaryKey().notNull(),
    category: varchar({ length: 255 }),
    title: varchar({ length: 1024 }),
    description: text(),
    email: varchar({ length: 255 }),
    status: varchar({ length: 255 }),
    closedAt: timestamp(),
    ...timestamps
},
    (table) => [
        primaryKey({ columns: [table.id], name: "bugreport_id" }),
    ]);