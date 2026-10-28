'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import { CATEGORIES, TAGS } from '@/src/constants/helpCenter';
import { formatStringForUrl } from '@/src/utils/helpers';
import { Category as CategoryIcon, Search as SearchIcon, LocalOffer as TagIcon } from '@mui/icons-material';
import { Alert, Box, Card, CardActionArea, CardContent, Chip, CircularProgress, Container, Divider, Grid, InputAdornment, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { HelpArticle, HelpCenterComponentProps } from './types';

export default function HelpCenter({ currentLanguage }: HelpCenterComponentProps) {
    const t = useTranslations();
    const router = useRouter();

    // State for search, filters and language
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [articles, setArticles] = useState<HelpArticle[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState<number>(0);

    // Fetch articles from the API with language support
    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/help-center?lang=${currentLanguage}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch articles');
                }

                const data = await response.json();
                setArticles(data.articles);
                setFilteredArticles(data.articles);
                setError(null);
            } catch (err) {
                console.error('Error fetching help articles:', err);
                setError('Failed to load help articles. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [currentLanguage]);

    // Handle tab change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Handle search
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Handle category selection
    const handleCategoryToggle = (category: string) => {
        setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
    };

    // Handle tag selection
    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    // Navigate to article detail page
    const navigateToArticle = (articleId: string) => {
        // Use router.push with appropriate URL structure
        // Make sure language is passed as a URL parameter
        const articleUrl = `/help-center/article/${formatStringForUrl(articleId)}`;
        router.push(articleUrl);
    };

    // Filter articles based on search query, selected categories, and tags
    useEffect(() => {
        if (loading) return;

        let results = [...articles];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(
                (article) => (article.title?.toLowerCase() || '').includes(query) || (article.content?.toLowerCase() || '').includes(query) || (article.summary?.toLowerCase() || '').includes(query)
            );
        }

        // Filter by categories
        if (selectedCategories.length > 0) {
            results = results.filter((article) => selectedCategories.includes(article.category));
        }

        // Filter by tags
        if (selectedTags.length > 0) {
            results = results.filter((article) => article.tags.some((tag) => selectedTags.includes(tag)));
        }

        setFilteredArticles(results);
    }, [searchQuery, selectedCategories, selectedTags, articles, loading]);

    return (
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
            <BasicBreadcrumbs current={t('helpCenter.title')} />

            <Typography variant='h4' component='h1' sx={{ textAlign: 'center', mb: 2 }}>
                {t('helpCenter.title')}
            </Typography>

            <Typography variant='subtitle1' align='center' component='p' sx={{
                color: 'text.secondary'
            }}>
                {t('helpCenter.subtitle')}
            </Typography>

            {/* Search bar */}
            <Box sx={{ my: 4 }}>
                <TextField
                    fullWidth
                    variant='outlined'
                    placeholder={t('helpCenter.searchPlaceholder')}
                    value={searchQuery}
                    onChange={handleSearch}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            {/* Tabs for Categories and Tags */}
            <Box sx={{ width: '100%', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label='filter tabs' centered>
                    <Tab icon={<CategoryIcon />} label={t('helpCenter.categories')} id='tab-0' />
                    <Tab icon={<TagIcon />} label={t('helpCenter.tags')} id='tab-1' />
                </Tabs>

                <Box role='tabpanel' hidden={tabValue !== 0} id='tabpanel-0' sx={{ p: 2 }}>
                    {tabValue === 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {CATEGORIES.map((category) => (
                                <Chip
                                    key={category}
                                    label={t(`helpCenter.categoryLabels.${category}`)}
                                    onClick={() => handleCategoryToggle(category)}
                                    color={selectedCategories.includes(category) ? 'primary' : 'default'}
                                    sx={{ m: 0.5 }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                <Box role='tabpanel' hidden={tabValue !== 1} id='tabpanel-1' sx={{ p: 2 }}>
                    {tabValue === 1 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {TAGS.map((tag) => (
                                <Chip key={tag} label={tag} onClick={() => handleTagToggle(tag)} color={selectedTags.includes(tag) ? 'primary' : 'default'} size='small' sx={{ m: 0.5 }} />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Filter summary */}
            {(selectedCategories.length > 0 || selectedTags.length > 0) && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant='subtitle2' gutterBottom>
                        {t('helpCenter.activeFilters')}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedCategories.map((category) => (
                            <Chip
                                key={`selected-${category}`}
                                label={t(`helpCenter.categoryLabels.${category}`)}
                                onDelete={() => handleCategoryToggle(category)}
                                color='primary'
                                size='small'
                                sx={{ m: 0.5 }}
                            />
                        ))}
                        {selectedTags.map((tag) => (
                            <Chip key={`selected-tag-${tag}`} label={tag} onDelete={() => handleTagToggle(tag)} color='primary' variant='outlined' size='small' sx={{ m: 0.5 }} />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Error message */}
            {error && (
                <Alert severity='error' sx={{ my: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Articles display */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : filteredArticles.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredArticles.map((article) => (
                        <Grid key={article.id} size={{ xs: 12, md: 6 }}>
                            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardActionArea onClick={() => navigateToArticle(article.id)} sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography gutterBottom variant='h6' component='div'>
                                                {article.title}
                                            </Typography>
                                            <Typography variant='body2' component='p' sx={{
                                                color: 'text.secondary'
                                            }}>
                                                {article.summary}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                            <Chip label={t(`helpCenter.categoryLabels.${article.category}`)} size='small' color='primary' />
                                            <Typography variant='caption' sx={{
                                                color: 'text.secondary'
                                            }}>
                                                {t('helpCenter.lastUpdated')}: {new Date(article.lastUpdated).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Alert severity='info' sx={{ my: 4 }}>
                    {t('helpCenter.noResultsFound')}
                </Alert>
            )}
        </Container>
    );
}
