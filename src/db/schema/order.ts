import { float, int, json, mysqlTable, text, timestamp, tinyint, varchar } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

export const orderData = mysqlTable("order", {
    id: int().autoincrement().primaryKey().notNull(),
    buyerId: int(),
    game: text(),
    sellerId: int(),
    status: text(),
    paymentStatus: text(),
    shippingStatus: text(),
    totalPrice: float(),
    paidAt: timestamp(),
    shippedAt: timestamp(),
    arrivedAt: timestamp(),
    cancelledAt: timestamp(),
    ...timestamps
});

export const orderItemData = mysqlTable("orderItem", {
    id: int().autoincrement().primaryKey().notNull(),
    orderId: int(),
    foreignKey: varchar({length: 255}),
    foreignKeySource: text(),
    quantity: int(),
    price: float(),
    displayName: text(),
    game: text(),
    type: text(),
    originalItem: json(), // Store complete inventory item data as JSON
    ...timestamps
});

export const orderAddressData = mysqlTable("orderAddress", {
    id: int().autoincrement().primaryKey().notNull(),
    orderId: int(),
    address: text(),
    ...timestamps
});

export const orderShippingData = mysqlTable("orderShipping", {
    id: int().autoincrement().primaryKey().notNull(),
    orderId: int(),
    displayName: text(),
    price: float(),
    trackingNumber: text(),
    tracking: tinyint(),
    ...timestamps
});

export const orderCancellationData = mysqlTable("orderCancellation", {
    id: int().autoincrement().primaryKey().notNull(),
    orderId: int(),
    message: text(),
    status: text(),
    requestedByUserId: int(),
    acceptedAt: timestamp(),
    ...timestamps
});

