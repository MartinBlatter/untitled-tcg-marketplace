'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import WishlistItemsList from '@/src/components/Wishlist/WishlistItemsList/WishlistItemsList';
import WishlistItemsTiles from '@/src/components/Wishlist/WishlistItemsTiles/WishlistItemsTiles';
import { useWishlistsStore } from '@/src/store/wishlists';
import List from '@mui/icons-material/List';
import ViewModule from '@mui/icons-material/ViewModule';
import { Box, Button, ButtonGroup, LinearProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { use } from 'react';

export default function SharedWishlist(props: { params: Promise<{ hash: string }> }) {
    const t = useTranslations();
    const params = use(props.params);
    const hash = params.hash;
    const wishlistsStore = useWishlistsStore();
    const { refreshPublicWishlist, loading, publicWishlist, sortPublicItems } = wishlistsStore;
    const [sortBy, setSortBy] = React.useState('');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [viewMode, setViewMode] = React.useState<string>('list');

    React.useEffect(() => {
        refreshPublicWishlist(hash);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!hash) return null;

    if (publicWishlist === undefined) return null;

    const setSort = (column: string) => {
        let newSortorder = 'asc';
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            newSortorder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            setSortOrder('asc');
        }
        setSortBy(column);
        sortPublicItems(column, newSortorder);
    };

    const sort = () => {
        sortPublicItems(sortBy, sortOrder);
    };

    return (
        <>
            {loading && <LinearProgress sx={{ mt: 5 }} />}
            {!loading && publicWishlist && (
                <>
                    <BasicBreadcrumbs current={`${t(`wishlists.singleCardDialog.wishlist`)} - ${publicWishlist && publicWishlist.name ? publicWishlist.name : null}`} />
                    <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                        {`${t(`wishlists.singleCardDialog.wishlist`)} - ${publicWishlist && publicWishlist.name ? publicWishlist.name : null}`}
                    </Typography>
                    <>
                        <Box sx={{ mt: 2, mb: 2, height: '32px' }}>
                            <ButtonGroup className='view-mode-buttons' variant='outlined' aria-label='Basic button group' sx={{ float: 'right' }}>
                                <Button
                                    role='button'
                                    aria-pressed={viewMode === 'list'}
                                    onClick={() => {
                                        setViewMode('list');
                                    }}
                                >
                                    <List />
                                </Button>
                                <Button
                                    role='button'
                                    aria-pressed={viewMode === 'tiles'}
                                    onClick={() => {
                                        setViewMode('tiles');
                                    }}
                                >
                                    <ViewModule />
                                </Button>
                            </ButtonGroup>
                        </Box>
                        {loading && <LinearProgress sx={{ mt: 5 }} />}
                        {!loading && (
                            <Box sx={{ position: 'relative' }}>
                                <Typography variant='body1' sx={{ mt: 2 }}>
                                    {t('wishlists.single.totalItems', {
                                        count: publicWishlist && publicWishlist.items ? publicWishlist?.items.length : 0,
                                    })}
                                </Typography>
                            </Box>
                        )}
                        {!loading && publicWishlist && viewMode === 'list' && <WishlistItemsList setSort={setSort} wishlist={publicWishlist} sortOrder={sortOrder} sortBy={sortBy} />}
                        {!loading && publicWishlist && viewMode === 'tiles' && <WishlistItemsTiles setSort={setSort} wishlist={publicWishlist} sortOrder={sortOrder} sortBy={sortBy} />}
                    </>
                </>
            )}
        </>
    );
}
