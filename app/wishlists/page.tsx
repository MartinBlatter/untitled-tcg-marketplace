'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import WishlistAddDialog from '@/src/components/Wishlist/WishlistAddDialog/WishlistAddDialog';
import WishlistTile from '@/src/components/Wishlist/WishlistTile/WishlistTile';
import { useWishlistsStore } from '@/src/store/wishlists';
import { Button, Card, Grid, LinearProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function Wishlists() {
    const t = useTranslations();
    const [showAddDialog, setShowAddDialog] = React.useState(false);
    const { refresh, loading, wishlists } = useWishlistsStore();

    React.useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`wishlists.title`)} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`wishlists.title`)}
            </Typography>
            <>
                <Card sx={{ mt: 5, p: 5 }}>
                    <Typography variant='body1'>{t(`wishlists.description`)}</Typography>
                    {!loading && wishlists && wishlists.length === 0 ? (
                        <Typography variant='body1' sx={{ mt: 2 }}>
                            {t('wishlists.noWishlists')}
                            <Button variant='contained' sx={{ float: 'right' }} onClick={() => setShowAddDialog(true)}>
                                {t('wishlists.createWishlist')}
                            </Button>
                        </Typography>
                    ) : null}
                    {!loading && wishlists && wishlists.length > 0 ? (
                        <Typography variant='body1' sx={{ mt: 2 }}>
                            {t('wishlists.amountOfWishlists', {
                                amount: wishlists.length,
                            })}
                            <Button variant='contained' sx={{ float: 'right' }} onClick={() => setShowAddDialog(true)}>
                                {t('wishlists.createWishlist')}
                            </Button>
                        </Typography>
                    ) : null}
                </Card>
                {loading ? (
                    <LinearProgress sx={{ mt: 5 }} />
                ) : (
                    <Grid container spacing={4} sx={{ mt: 2, justifyContent: 'center' }}>
                        {wishlists && wishlists.length > 0
                            ? wishlists.map((wishlist: any) => <WishlistTile key={wishlist['mtg.wishlist'].id} wishlist={wishlist['mtg.wishlist']} count={wishlist.items?.length | 0} />)
                            : null}
                    </Grid>
                )}
            </>
            <WishlistAddDialog show={showAddDialog} setShow={setShowAddDialog} />
        </>
    );
}
