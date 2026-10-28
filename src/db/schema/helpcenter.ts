import { relations } from "drizzle-orm";
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

// Base table for help articles metadata
export const helpArticleData = mysqlTable("helpArticles", {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    category: varchar({ length: 50 }).notNull(),
    tags: text().notNull(), // Store as JSON string
    lastUpdated: timestamp().defaultNow(),
    ...timestamps
});

// Table for language-specific article content
export const helpArticleTranslationData = mysqlTable("helpArticleTranslations", {
    id: int().autoincrement().primaryKey().notNull(),
    articleId: varchar({ length: 255 }).notNull(),
    language: varchar({ length: 10 }).notNull(), // 'en', 'de', 'es', 'fr', 'it'
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    summary: text().notNull(),
    ...timestamps
});

// Schema for related articles
export const helpArticleRelatedData = mysqlTable("helpArticleRelated", {
    id: int().autoincrement().primaryKey().notNull(),
    articleId: varchar({ length: 255 }).notNull(),
    relatedArticleId: varchar({ length: 255 }).notNull(),
    relevanceScore: int().default(1),
    ...timestamps
});

// Define relations between articles and their translations
export const helpArticleRelations = relations(helpArticleData, ({ many }) => ({
    translations: many(helpArticleTranslationData),
    relatedArticles: many(helpArticleRelatedData, {
        relationName: "article_to_related"
    })
}));

export const helpArticleTranslationRelations = relations(helpArticleTranslationData, ({ one }) => ({
    article: one(helpArticleData, {
        fields: [helpArticleTranslationData.articleId],
        references: [helpArticleData.id]
    })
}));

export const helpArticleRelatedRelations = relations(helpArticleRelatedData, ({ one }) => ({
    article: one(helpArticleData, {
        fields: [helpArticleRelatedData.articleId],
        references: [helpArticleData.id],
        relationName: "article_to_related"
    }),
    relatedArticle: one(helpArticleData, {
        fields: [helpArticleRelatedData.relatedArticleId],
        references: [helpArticleData.id],
        relationName: "related_article"
    })
}));