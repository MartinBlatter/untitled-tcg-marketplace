import { mysqlTable, tinyint, int, text } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

export const messageData = mysqlTable("messages", {
    id: int().autoincrement().primaryKey().notNull(),
    senderId: int(),
    recipientId: int(),
    title: text(),
    text: text(),
    read: tinyint().default(0),
    ...timestamps
});