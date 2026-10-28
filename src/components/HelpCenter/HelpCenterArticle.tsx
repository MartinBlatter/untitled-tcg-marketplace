'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import { ArrowBack, Category as CategoryIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Container, Divider, LinearProgress, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HelpArticle, HelpCenterArticleProps } from './types';

export default function HelpCenterArticle({ articleId, currentLanguage }: HelpCenterArticleProps) {
    const router = useRouter();
    const t = useTranslations();
    const [article, setArticle] = useState<HelpArticle | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [languageFallback, setLanguageFallback] = useState<boolean>(false);

    // Fetch article data from API using ID and language
    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                // API call to get specific article by ID and language
                const response = await fetch(`/api/help-center?id=${articleId}&lang=${currentLanguage}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch article');
                }

                const data = await response.json();

                if (data.article) {
                    setArticle(data.article);
                    setLanguageFallback(!!data.languageFallback);
                    setError(null);
                } else {
                    setError('Article not found');
                }
            } catch (err) {
                console.error('Error fetching article:', err);
                setError('Failed to load article');
            } finally {
                setLoading(false);
            }
        };

        if (articleId && currentLanguage) {
            fetchArticle();
        }
    }, [articleId, currentLanguage]);

    // Go back to help center main page
    const handleBackClick = () => {
        router.push(`/help-center`);
    };

    // Navigate to a related article
    const navigateToArticle = (articleId: string) => {
        router.push(`/help-center/article/${articleId}`);
    };

    // Handle markdown content formatting
    const formatContent = (content: string) => {
        // Very basic markdown parsing
        // In a real app, use a proper markdown renderer
        const formattedLines = content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
                return (
                    <Typography key={index} variant='h4' component='h1' gutterBottom>
                        {line.substring(2)}
                    </Typography>
                );
            } else if (line.startsWith('## ')) {
                return (
                    <Typography key={index} variant='h5' component='h2' gutterBottom sx={{ mt: 3 }}>
                        {line.substring(3)}
                    </Typography>
                );
            } else if (line.startsWith('### ')) {
                return (
                    <Typography key={index} variant='h6' component='h3' gutterBottom>
                        {line.substring(4)}
                    </Typography>
                );
            } else if (line.startsWith('- ')) {
                return (
                    <Typography key={index} component='li' sx={{ ml: 3 }}>
                        {line.substring(2)}
                    </Typography>
                );
            } else if (line.match(/^\d+\./)) {
                return (
                    <Typography key={index} component='li' sx={{ ml: 3, display: 'list-item' }}>
                        {line.substring(line.indexOf('.') + 1)}
                    </Typography>
                );
            } else if (line.trim() === '') {
                return <Box key={index} sx={{ my: 1 }} />;
            } else {
                return (
                    <Typography key={index} component='p'>
                        {line}
                    </Typography>
                );
            }
        });

        return <Box>{formattedLines}</Box>;
    };

    if (loading) {
        return (
            <Container maxWidth='lg' sx={{ mt: 5, mb: 4, display: 'flex', justifyContent: 'center' }}>
                <LinearProgress />
            </Container>
        );
    }

    if (error || !article) {
        return (
            <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
                <Alert severity='error'>{error || 'Article not found'}</Alert>
                <Box sx={{ mt: 2 }}>
                    <Button startIcon={<ArrowBack />} onClick={handleBackClick}>
                        {t('helpCenter.article.backToHelpCenter')}
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 2 }}>
                <BasicBreadcrumbs current={article.title} previous={[{ text: t('helpCenter.article.title'), url: `/help-center` }]} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={handleBackClick}>
                    {t('helpCenter.article.backToHelpCenter')}
                </Button>
            </Box>

            {languageFallback && article.language !== currentLanguage && (
                <Alert severity='info' sx={{ mb: 3 }}>
                    {t('helpCenter.article.languageFallbackMessage', {
                        requested: currentLanguage,
                        available: article.language,
                    })}
                </Alert>
            )}

            <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant='h4' component='h1' gutterBottom>
                    {article.title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <Chip icon={<CategoryIcon />} label={t(`helpCenter.article.categoryLabels.${article.category}`)} color='primary' />
                    <Typography variant='body2' sx={{
                        color: 'text.secondary'
                    }}>
                        {t('helpCenter.article.lastUpdated')}: {new Date(article.lastUpdated).toLocaleDateString()}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ my: 4 }}>{formatContent(article.content)}</Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle2' gutterBottom>
                        {t('helpCenter.article.relatedTopics')}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {article.tags.map((tag) => (
                            <Chip key={tag} label={t(`helpCenter.article.tags.${tag}`)} size='small' onClick={() => router.push(`/help-center?tag=${tag}`)} />
                        ))}
                    </Box>
                </Box>

                {/* Related Articles Section */}
                {article.relatedArticles && article.relatedArticles.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant='h6' gutterBottom>
                            {t('helpCenter.article.relatedArticles')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {article.relatedArticles.map((related) => (
                                <Card key={related.id} elevation={1}>
                                    <CardActionArea onClick={() => navigateToArticle(related.id)}>
                                        <CardContent>
                                            <Typography variant='subtitle1'>{related.title}</Typography>
                                            <Typography variant='body2' sx={{
                                                color: 'text.secondary'
                                            }}>
                                                {related.summary}
                                            </Typography>
                                            {related.language !== currentLanguage && (
                                                <Typography
                                                    variant='caption'
                                                    sx={{
                                                        color: 'text.secondary',
                                                        display: 'block',
                                                        mt: 1
                                                    }}>
                                                    {t('helpCenter.article.availableIn', {
                                                        language: related.language,
                                                    })}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant='body2' sx={{
                        color: 'text.secondary'
                    }}>
                        {t('helpCenter.article.wasThisHelpful')}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
