import { mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const supportTicketsData = mysqlTable('supportTickets', {
    id: varchar('id', { length: 36 }).primaryKey().notNull(),
    userId: varchar('userId', { length: 255 }),
    category: varchar('category', { length: 50 }).notNull(),
    subject: varchar('subject', { length: 255 }).notNull(),
    message: text('message').notNull(),
    contactEmail: varchar('contactEmail', { length: 255 }),
    createdAt: timestamp('createdAt').notNull(),
    status: mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).notNull(),
    responseMessage: text('responseMessage'),
    respondedBy: varchar('respondedBy', { length: 255 }),
    respondedAt: timestamp('respondedAt'),
    resolvedAt: timestamp('resolvedAt'),
    reviewedAt: timestamp('reviewedAt'),
    closedAt: timestamp('closedAt'),
});