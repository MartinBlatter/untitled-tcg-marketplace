'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import { CheckoutDoneSingleOrder } from '@/src/components/Checkout/CheckoutDoneSingleOrder/CheckoutDoneSingleOrder';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { usePurchasesStore } from '@/src/store/purchases';
import { ArrowForward, CheckCircle } from '@mui/icons-material';
import { Alert, Box, Card, LinearProgress, Link, List, ListItem, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

export default function CheckoutDone() {
    const t = useTranslations();
    const { newPurchases, loading, refreshNewPurchases } = usePurchasesStore();

    React.useEffect(() => {
        refreshNewPurchases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`checkout.done.title`)} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`checkout.done.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    {newPurchases.length === 0 ? (
                        <Card sx={{ mt: 4, p: 2 }}>
                            <Alert severity='info' variant='filled'>
                                {t(`checkout.done.noPurchases`)}
                                <List>
                                    <ListItem>
                                        <Link color='inherit' href={INTERNAL_ROUTES.PURCHASES.UNPAID}>
                                            <ArrowForward sx={{ mb: -1 }} /> {t(`purchases.unpaid.title`)}
                                        </Link>
                                    </ListItem>
                                    <ListItem>
                                        <Link color='inherit' href={INTERNAL_ROUTES.PURCHASES.PAID}>
                                            <ArrowForward sx={{ mb: -1 }} /> {t(`purchases.paid.title`)}
                                        </Link>
                                    </ListItem>
                                </List>
                            </Alert>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Image src='/images/empty_cart_fox.png' alt='empty-cart' width={512} height={512} />
                            </Box>
                        </Card>
                    ) : (
                        <>
                            <Typography variant='h5' component={'h2'} sx={{ textAlign: 'center' }}>
                                <CheckCircle sx={{ color: 'success.main', mr: 1, mb: -0.5 }} />
                                {t('checkout.done.success')}
                            </Typography>
                            {newPurchases.map((purchase) => (
                                <CheckoutDoneSingleOrder key={purchase.id} order={purchase} expanded={true} />
                            ))}
                        </>
                    )}
                </>
            )}
        </>
    );
}
