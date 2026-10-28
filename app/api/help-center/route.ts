import db from "@/src/db/mysql";
import { helpArticleData, helpArticleRelatedData, helpArticleTranslationData } from "@/src/db/schema/helpcenter";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'de', 'es', 'fr', 'it'];

// GET all articles with optional filtering and language support
// or GET a specific article by ID
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const language = searchParams.get('lang') || DEFAULT_LANGUAGE;
        const category = searchParams.get('category');
        const id = searchParams.get('id');

        // Validate language
        if (!SUPPORTED_LANGUAGES.includes(language)) {
            return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
        }

        // If an ID is provided, fetch a specific article
        if (id) {
            // Try to find the article in the requested language
            let article = await db
                .select({
                    article: helpArticleData,
                    translation: helpArticleTranslationData
                })
                .from(helpArticleData)
                .innerJoin(
                    helpArticleTranslationData,
                    and(
                        eq(helpArticleData.id, helpArticleTranslationData.articleId),
                        eq(helpArticleTranslationData.language, language)
                    )
                )
                .where(eq(helpArticleData.id, id))
                .limit(1);

            let languageFallback = false;

            // If not found in requested language, fall back to default language
            if (article.length === 0 && language !== DEFAULT_LANGUAGE) {
                article = await db
                    .select({
                        article: helpArticleData,
                        translation: helpArticleTranslationData
                    })
                    .from(helpArticleData)
                    .innerJoin(
                        helpArticleTranslationData,
                        and(
                            eq(helpArticleData.id, helpArticleTranslationData.articleId),
                            eq(helpArticleTranslationData.language, DEFAULT_LANGUAGE)
                        )
                    )
                    .where(eq(helpArticleData.id, id))
                    .limit(1);
                
                languageFallback = true;
            }

            if (article.length === 0) {
                return NextResponse.json({ error: 'Article not found' }, { status: 404 });
            }

            // Fetch related articles
            const relatedIds = await db
                .select({
                    relatedId: helpArticleRelatedData.relatedArticleId
                })
                .from(helpArticleRelatedData)
                .where(eq(helpArticleRelatedData.articleId, id));
            
            const relatedArticles = [];
            
            if (relatedIds.length > 0) {
                // Get details of related articles
                for (const related of relatedIds) {
                    const relatedArticle = await db
                        .select({
                            article: helpArticleData,
                            translation: helpArticleTranslationData
                        })
                        .from(helpArticleData)
                        .innerJoin(
                            helpArticleTranslationData,
                            and(
                                eq(helpArticleData.id, helpArticleTranslationData.articleId),
                                eq(helpArticleTranslationData.language, language)
                            )
                        )
                        .where(eq(helpArticleData.id, related.relatedId))
                        .limit(1);
                    
                    if (relatedArticle.length > 0) {
                        relatedArticles.push({
                            id: relatedArticle[0].article.id,
                            title: relatedArticle[0].translation.title,
                            summary: relatedArticle[0].translation.summary,
                            language
                        });
                    } else {
                        // Try default language if translation not found
                        const fallbackArticle = await db
                            .select({
                                article: helpArticleData,
                                translation: helpArticleTranslationData
                            })
                            .from(helpArticleData)
                            .innerJoin(
                                helpArticleTranslationData,
                                and(
                                    eq(helpArticleData.id, helpArticleTranslationData.articleId),
                                    eq(helpArticleTranslationData.language, DEFAULT_LANGUAGE)
                                )
                            )
                            .where(eq(helpArticleData.id, related.relatedId))
                            .limit(1);
                        
                        if (fallbackArticle.length > 0) {
                            relatedArticles.push({
                                id: fallbackArticle[0].article.id,
                                title: fallbackArticle[0].translation.title,
                                summary: fallbackArticle[0].translation.summary,
                                language: DEFAULT_LANGUAGE
                            });
                        }
                    }
                }
            }

            // Format the article response
            const articleItem = article[0];
            const processedArticle = {
                id: articleItem.article.id,
                category: articleItem.article.category,
                tags: JSON.parse(articleItem.article.tags),
                lastUpdated: articleItem.article.lastUpdated,
                title: articleItem.translation.title,
                summary: articleItem.translation.summary,
                content: articleItem.translation.content,
                language: articleItem.translation.language,
                relatedArticles
            };

            return NextResponse.json({ 
                article: processedArticle,
                languageFallback
            });
        }

        // Query articles with optional category filter
        const articlesQuery = db
            .select({
                article: helpArticleData,
                translation: helpArticleTranslationData
            })
            .from(helpArticleData)
            .innerJoin(
                helpArticleTranslationData,
                and(
                    eq(helpArticleData.id, helpArticleTranslationData.articleId),
                    eq(helpArticleTranslationData.language, language)
                )
            );

        if (category) {
            articlesQuery.where(eq(helpArticleData.category, category));
        }

        const articles = await articlesQuery;

        // Process articles
        const processedArticles = articles.map(item => ({
            id: item.article.id,
            category: item.article.category,
            tags: JSON.parse(item.article.tags),
            lastUpdated: item.article.lastUpdated,
            title: item.translation.title,
            summary: item.translation.summary,
            language
        }));

        return NextResponse.json({ articles: processedArticles });
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

// POST to create a new article with multiple language translations
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, tags, translations } = body;

        if (!category || !tags || !translations || !Array.isArray(translations)) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Generate a unique ID for the article
        const articleId = crypto.randomUUID();

        // Insert main article
        await db.insert(helpArticleData).values({
            id: articleId,
            category,
            tags: JSON.stringify(tags),
            lastUpdated: new Date()
        });

        // Insert translations
        const translationValues = translations.map(translation => ({
            articleId,
            language: translation.language,
            title: translation.title,
            content: translation.content,
            summary: translation.summary
        }));

        await db.insert(helpArticleTranslationData).values(translationValues);

        return NextResponse.json({ success: true, articleId });
    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}

// PUT to update an existing article
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, category, tags, translations } = body;

        if (!id || !translations || !Array.isArray(translations)) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Update main article
        await db.update(helpArticleData).set({
            category,
            tags: JSON.stringify(tags),
            lastUpdated: new Date()
        }).where(eq(helpArticleData.id, id));

        // Update translations
        for (const translation of translations) {
            await db.update(helpArticleTranslationData).set({
                title: translation.title,
                content: translation.content,
                summary: translation.summary
            }).where(
                and(
                    eq(helpArticleTranslationData.articleId, id),
                    eq(helpArticleTranslationData.language, translation.language)
                )
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating article:', error);
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }
}

// DELETE to remove an article
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
        }
        
        // Check if article exists
        const existingArticle = await db
            .select()
            .from(helpArticleData)
            .where(eq(helpArticleData.id, id));
            
        if (existingArticle.length === 0) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }
        
        // Delete the article (translations and relations will cascade delete due to foreign key constraints)
        await db
            .delete(helpArticleData)
            .where(eq(helpArticleData.id, id));
            
        return NextResponse.json({ 
            success: true, 
            message: 'Article deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting help article:', error);
        return NextResponse.json({ error: 'Failed to delete help article' }, { status: 500 });
    }
}