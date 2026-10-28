'use client';
import { getCardsAction } from '@/src/actions/cards';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { formatStringForUrl } from '@/src/utils/helpers';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Divider, Fade, IconButton, InputBase, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Tooltip, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { isEmpty } from 'ramda';
import React, { useRef, useState } from 'react';
import CardImageBadge from '../../CardImageBadge/CardImageBadge';
import ImageWithFallback from '../../ImageWithFallback/ImageWithFallback';

export default function SearchField() {
    const t = useTranslations();
    const [showSearchResults, setshowSearchResults] = React.useState(false);
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [currentSearch, setCurrentSearch] = useState('');
    const currentLocale = useLocale();
    const timer = useRef(setTimeout(() => null, 0));

    const fetchSearchData = (searchString: string) => {
        getCardsAction(currentLocale, searchString, 10, 1, {}, 'name', 'asc', {}).then((data: any) => {
            setData(data);
            setLoading(false);
            setCurrentSearch(searchString);
        });
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 2) {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                setshowSearchResults(true);
                setLoading(true);
                fetchSearchData(event.target.value);
            }, 500);
        } else {
            setshowSearchResults(false);
        }
    };

    return (
        <>
            <Paper component='form' className='search-field' sx={{ p: '2px 0', display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={t('appBar.searchField.placeholder')}
                    inputProps={{ 'aria-label': 'search' }}
                    onChange={handleChange}
                    onSelect={handleChange}
                    onBlur={() => setshowSearchResults(false)}
                />
                <IconButton type='button' sx={{ p: '10px' }} aria-label='search'>
                    <SearchIcon />
                </IconButton>
            </Paper>
            <Fade in={showSearchResults} onBlurCapture={() => setshowSearchResults(false)}>
                <Paper
                    className='search-field'
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        position: 'absolute',
                        left: 0,
                        top: { xs: '130px', md: '70px' },
                        backgroundColor: 'background.paper',
                        color: 'grey.900',
                        zIndex: 2,
                    }}
                >
                    {isLoading && (
                        <Box sx={{ width: '100%', p: 2 }}>
                            <LinearProgress />
                        </Box>
                    )}
                    {!isLoading && isEmpty(data) && (
                        <Typography variant='h6' sx={{ p: 2 }}>
                            {t('appBar.searchField.noResults')}
                        </Typography>
                    )}
                    {!isLoading && !isEmpty(data) && (
                        <List dense={true} sx={{ width: '100%', p: 0 }}>
                            {(data as any).cards.slice(0, 10).map((searchResult: any) => (
                                <Link
                                    key={`search-result-${searchResult.id}`}
                                    className='search-result-link'
                                    href={{
                                        pathname: `/magic/${searchResult.setCode}/products/singles/${formatStringForUrl(searchResult.name)}`,
                                        query: {
                                            uuid: searchResult.uuid,
                                        },
                                    }}
                                >
                                    <ListItemButton key={`search-result-${searchResult.id}-button`}>
                                        <ListItemIcon>
                                            <Tooltip
                                                title={
                                                    <React.Fragment>
                                                        <CardImageBadge card={searchResult} />
                                                    </React.Fragment>
                                                }
                                            >
                                                <CameraAltIcon />
                                            </Tooltip>
                                        </ListItemIcon>
                                        <Box sx={{ width: 30, marginRight: '30px', textAlign: 'center', paddingTop: '5px' }}>
                                            <ListItemIcon sx={{ display: 'inline' }}>
                                                <ImageWithFallback
                                                    height={20}
                                                    width={20}
                                                    className='invertFilter'
                                                    src={`${INTERNAL_ROUTES.STATIC.IMAGES.MAGIC.EDITIONS}/${searchResult.setCode.toLowerCase()}.svg`}
                                                    fallbackSrc={`${INTERNAL_ROUTES.STATIC.IMAGES.MAGIC.EDITIONS}/fallback.svg`}
                                                    alt={searchResult.setCode}
                                                />
                                            </ListItemIcon>
                                        </Box>
                                        <ListItemText sx={{ color: 'text.primary' }} primary={searchResult.name} secondary={searchResult.foreignName} />
                                    </ListItemButton>
                                </Link>
                            ))}
                            {(data as any).count[0].count === 0 && (
                                <ListItem>
                                    <Typography variant='h6' sx={{ p: 2 }}>
                                        {t('appBar.searchField.noResults')}
                                    </Typography>
                                </ListItem>
                            )}
                            {(data as any).count[0].count > 10 && (
                                <>
                                    <Divider />
                                    <Link
                                        key={`search-result-all-link`}
                                        className='search-result-link'
                                        href={{
                                            pathname: `/magic/products/singles`,
                                            query: {
                                                search: formatStringForUrl(currentSearch),
                                            },
                                        }}
                                    >
                                        <ListItemButton>
                                            <ListItemText sx={{ textAlign: 'center' }} primary={t('appBar.searchField.moreResults', { count: (data as any).count[0].count })} />
                                        </ListItemButton>
                                    </Link>
                                </>
                            )}
                            <Link
                                key={`search-result-detail-link`}
                                className='search-result-detail-link'
                                href={{
                                    pathname: `/magic/search`,
                                }}
                            >
                                <ListItemButton>
                                    <ListItemText sx={{ textAlign: 'center' }} primary={t('appBar.searchField.detailedSearch')} />
                                </ListItemButton>
                            </Link>
                        </List>
                    )}
                </Paper>
            </Fade>
        </>
    );
}
