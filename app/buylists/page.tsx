'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import BuylistAddDialog from '@/src/components/Buylist/BuylistAddDialog';
import BuylistTile from '@/src/components/Buylist/BuylistTile';
import { useBuylistStore } from '@/src/store/buylist';
import { Add } from '@mui/icons-material';
import { Box, Button, Grid, LinearProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function BuylistPage() {
    const t = useTranslations();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const { buylists, isLoading, fetchBuylists } = useBuylistStore();

    useEffect(() => {
        // Fetch buylists when the component mounts
        fetchBuylists();
    }, [fetchBuylists]);

    return (
        <>
            <BasicBreadcrumbs current={t('buylist.title')} />
            <Box sx={{ mb: 4 }}>
                <Typography variant='h4' component='h1' sx={{ mb: 2, textAlign: 'center' }}>
                    {t('buylist.title')}
                </Typography>
                <Typography variant='body1'>{t('buylist.description')} </Typography>
                <Button variant='contained' sx={{ float: 'right' }} startIcon={<Add />} onClick={() => setShowAddDialog(true)} disabled={isLoading}>
                    {t('buylist.createBuylist')}
                </Button>
                {!isLoading && buylists.length === 0 ? (
                    <Typography variant='body1' sx={{ mt: 2 }}>
                        {t('buylist.noBuylists')}
                    </Typography>
                ) : null}

                {!isLoading && buylists.length > 0 ? (
                    <Typography variant='body2' sx={{ my: 2 }}>
                        {t('buylist.amountOfBuylists', {
                            amount: buylists.length,
                        })}
                    </Typography>
                ) : null}
            </Box>

            {/* Always show the Add button at the top */}
            <Box sx={{ mt: 3, mb: 2 }}></Box>

            {isLoading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {buylists.length > 0
                        ? buylists.map((buylist) => (
                              <Grid size={{ xs: 4 }} key={`buylist-${buylist.id}`}>
                                  <BuylistTile key={buylist.id} buylist={buylist} />
                              </Grid>
                          ))
                        : null}
                </Grid>
            )}

            <BuylistAddDialog show={showAddDialog} setShow={setShowAddDialog} />
        </>
    );
}
