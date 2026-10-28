import { mysqlTable, int, tinyint, date, text, primaryKey, index, varchar, timestamp } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

export const profileData = mysqlTable("profiledata", {
    id: int().autoincrement().notNull(),
    userName: varchar({ length: 255 }).unique(),
    firstName: text(),
    lastName: text(),
    company: text(),
    address: text(),
    shippingAddress: int(),
    type: text(),
    eMail: varchar({ length: 255 }).unique(),
    active: tinyint(),
    onVacation: tinyint(),
    lastLogin: date(),
    country: varchar({ length: 255 }),
    /**
     * Self-describing scrypt string, see src/lib/auth/password.ts:
     *   scrypt$N=32768,r=8,p=1$<salt-base64>$<hash-base64>
     * Nullable: rows created before local login have no password yet.
     */
    passwordHash: varchar({ length: 255 }),
    /** Comma-separated role list. Parsed in exactly one place: src/lib/auth/roles.ts. */
    roles: varchar({ length: 255 }),
    /** Unused today - registration trusts the address. Here so email verification needs no migration. */
    emailVerifiedAt: timestamp(),
    ...timestamps
},
    (table) => [
        index("profiledata_email").on(table.eMail),
        primaryKey({ columns: [table.id], name: "profiledata_id" }),
    ]);

export const addressData = mysqlTable("address", {
    id: int().autoincrement().notNull(),
    address: text(),
    eMail: varchar({ length: 255 }),
    ...timestamps
},
    (table) => [
        primaryKey({ columns: [table.id], name: "address_id" }),
    ]);

export const profileBusinessData = mysqlTable("profilebusinessdata", {
    id: int().autoincrement().notNull(),
    name: varchar({ length: 255 }),
    eMail: varchar({ length: 255 }).notNull(),
    description: text(),
    UstId: varchar({ length: 255 }),
    presale: tinyint().default(0),
    avatar: varchar({ length: 255 }),
    banner: varchar({ length: 255 }),
    taxNumber: varchar({ length: 255 }),
    country: varchar({ length: 255 }),
    imprint: text(),
    terms: text(),
    privacy: text(),
    revocation: text(),
    ...timestamps
},
    (table) => [
        index("profileBusinessData_email").on(table.eMail),
        primaryKey({ columns: [table.id], name: "profileBusinessData_id" }),
    ]);

export const profileSettingsData = mysqlTable("profileSettings", {
    id: int().autoincrement().notNull(),
    userId: int().notNull(),
    name: varchar({ length: 255 }),
    value: varchar({ length: 255 }),
}, (table) => [
    primaryKey({ columns: [table.id], name: "profileSettings_id" }),
]);

export const customShippingData = mysqlTable("customShipping", {
    id: int().autoincrement().notNull(),
    userId: int().notNull(),
    type: varchar({ length: 255 }),
    cards: int(),
    maxValue: int(),
    weight: int(),
    price: int(),
    tracking: int(),
    range: varchar({ length: 255 }),
}, (table) => [
    primaryKey({ columns: [table.id], name: "customShipping_id" }),
]);