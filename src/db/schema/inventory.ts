import { mysqlTable, int, tinyint, text, primaryKey, varchar, float } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

export const inventoryData = mysqlTable("mtg.inventory", {
    id: int().autoincrement().primaryKey().notNull(),
    userId: int(),
    type: text(),
    foreignKeySource: varchar({ length: 255 }),
    foreignKey: varchar({ length: 255 }),
    price: float().default(0),
    quantity: int().default(1),
    quality: text(),
    language: text(),
    comment: text(),
    internalComment: text(),
    isFoil: tinyint().default(0),
    isAltered: tinyint().default(0),
    isSigned: tinyint().default(0),
    isMisprint: tinyint().default(0),
    isSealed: tinyint().default(0),
    isListed: tinyint().default(0),
    isGraded: tinyint().default(0),
    grading: text(),
    gradingCompany: text(),
    imagePath: text(),
    ...timestamps
});