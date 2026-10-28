import HelpCenterArticle from '@/src/components/HelpCenter/HelpCenterArticle';
import { getLocale } from 'next-intl/server';

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const currentLanguage = await getLocale();
    const { id } = await params;

    return <HelpCenterArticle articleId={id} currentLanguage={currentLanguage} />;
}
