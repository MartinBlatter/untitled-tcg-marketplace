import 'dotenv/config';
import { sql } from "drizzle-orm";
import db from "../src/db/mysql";

async function createHelpTables() {
  try {
    console.log('Creating multi-language help center tables...');
    
    // Drop existing tables to avoid conflicts
    await db.execute(sql`
      DROP TABLE IF EXISTS helpArticleRelated;
      DROP TABLE IF EXISTS helpArticleTranslations;
      DROP TABLE IF EXISTS helpArticles;
    `);
    console.log('Dropped any existing help center tables.');
    
    // Create base article metadata table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS helpArticles (
        id VARCHAR(255) PRIMARY KEY NOT NULL,
        category VARCHAR(50) NOT NULL,
        tags TEXT NOT NULL,
        lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deactivatedAt TIMESTAMP NULL
      )
    `);
    console.log('helpArticles table created successfully.');
    
    // Create table for language-specific content
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS helpArticleTranslations (
        id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        articleId VARCHAR(255) NOT NULL,
        language VARCHAR(10) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        summary TEXT NOT NULL,
        updatedAt TIMESTAMP NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deactivatedAt TIMESTAMP NULL,
        CONSTRAINT unique_article_language UNIQUE(articleId, language),
        FOREIGN KEY (articleId) REFERENCES helpArticles(id) ON DELETE CASCADE
      )
    `);
    console.log('helpArticleTranslations table created successfully.');
    
    // Create table for article relationships
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS helpArticleRelated (
        id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        articleId VARCHAR(255) NOT NULL,
        relatedArticleId VARCHAR(255) NOT NULL,
        relevanceScore INT DEFAULT 1,
        updatedAt TIMESTAMP NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deactivatedAt TIMESTAMP NULL,
        FOREIGN KEY (articleId) REFERENCES helpArticles(id) ON DELETE CASCADE,
        FOREIGN KEY (relatedArticleId) REFERENCES helpArticles(id) ON DELETE CASCADE
      )
    `);
    console.log('helpArticleRelated table created successfully.');
    
    // Create indices for better performance
    await db.execute(sql`
      CREATE INDEX idx_article_translations_article_id ON helpArticleTranslations(articleId);
      CREATE INDEX idx_article_translations_language ON helpArticleTranslations(language);
      CREATE INDEX idx_article_related_article_id ON helpArticleRelated(articleId);
      CREATE INDEX idx_article_related_related_article_id ON helpArticleRelated(relatedArticleId);
    `);
    console.log('Indices created successfully.');
    
    console.log('All help center tables created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createHelpTables();