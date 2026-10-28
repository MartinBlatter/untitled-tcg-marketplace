'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import PurchaseAccordion from '@/src/components/Purchases/PurchaseAccordion/PurchaseAccordion';
import PurchaseNavBar from '@/src/components/Purchases/PurchaseNavBar/PurchaseNavBar';
import PurchasesSummary from '@/src/components/Purchases/PurchasesSummary/PurchaseSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { usePurchasesStore } from '@/src/store/purchases';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function PurchasesShipped() {
    const t = useTranslations();
    const { shippedPurchases, loading, refreshShippedPurchases, shippedPage, setShippedPage, shippedCount, shippedLoading, shippedSum } = usePurchasesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        refreshShippedPurchases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`purchases.shipped.title`)} previous={[{ text: t(`purchases.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`purchases.shipped.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <PurchaseNavBar selectedIndex={2} />
                    </Box>
                    <PurchasesSummary title={t('purchases.shipped.title')} count={shippedCount} sum={shippedSum} />
                    {shippedPurchases.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`purchases.shipped.noPurchases`)}
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Pagination
                                sx={{ mb: 1 }}
                                count={Math.ceil(shippedCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={shippedPage}
                                onChange={(e, page) => setShippedPage(page)}
                                showFirstButton
                                showLastButton
                            />
                            {shippedLoading ? (
                                <Skeleton variant='rectangular' width={'100%'} height={960} />
                            ) : (
                                <>
                                    {shippedPurchases.map((purchase, index) => (
                                        <PurchaseAccordion key={purchase.id} purchase={purchase} refresh={refreshShippedPurchases} expanded={expanded === purchase.id} handleChange={handleChange} />
                                    ))}
                                </>
                            )}
                            <Pagination
                                sx={{ mt: 1 }}
                                count={Math.ceil(shippedCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={shippedPage}
                                onChange={(e, page) => setShippedPage(page)}
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            )}
        </>
    );
}
