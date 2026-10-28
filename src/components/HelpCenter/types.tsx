export interface HelpArticle {
    id: string;
    title: string;
    content: string;
    summary: string;
    category: string;
    tags: string[];
    lastUpdated: string;
    language: string;
}

export interface HelpCenterComponentProps {
    currentLanguage: string;
}

export interface HelpArticle {
    id: string;
    title: string;
    content: string;
    summary: string;
    category: string;
    tags: string[];
    lastUpdated: string;
    language: string;
    availableLanguages?: string[];
    relatedArticles?: RelatedArticle[];
}

export interface RelatedArticle extends HelpArticle {
    relevanceScore: number;
}

export interface HelpCenterArticleProps {
    articleId: string;
    currentLanguage: string;
}
