'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import NotArrivedPurchasesFilters from '@/src/components/Purchases/NotArrivedPurchasesFilters/NotArrivedPurchasesFilters';
import PurchaseAccordion from '@/src/components/Purchases/PurchaseAccordion/PurchaseAccordion';
import PurchaseNavBar from '@/src/components/Purchases/PurchaseNavBar/PurchaseNavBar';
import PurchasesSummary from '@/src/components/Purchases/PurchasesSummary/PurchaseSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { usePurchasesStore } from '@/src/store/purchases';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function PurchasesNotArrived() {
    const t = useTranslations();
    const { notArrivedPurchases, loading, refreshNotArrivedPurchases, notArrivedPage, setNotArrivedPage, notArrivedCount, notArrivedLoading, notArrivedSum } = usePurchasesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        refreshNotArrivedPurchases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`purchases.notArrived.title`)} previous={[{ text: t(`purchases.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`purchases.notArrived.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <PurchaseNavBar selectedIndex={5} />
                    </Box>
                    <NotArrivedPurchasesFilters />
                    <PurchasesSummary title={t('purchases.notArrived.title')} count={notArrivedCount} sum={notArrivedSum} />
                    {notArrivedPurchases.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`purchases.notArrived.noPurchases`)}
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Pagination
                                sx={{ mb: 1 }}
                                count={Math.ceil(notArrivedCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={notArrivedPage}
                                onChange={(e, page) => setNotArrivedPage(page)}
                                showFirstButton
                                showLastButton
                            />
                            {notArrivedLoading ? (
                                <Skeleton variant='rectangular' width={'100%'} height={960} />
                            ) : (
                                <>
                                    {notArrivedPurchases.map((purchase, index) => (
                                        <PurchaseAccordion key={purchase.id} purchase={purchase} refresh={refreshNotArrivedPurchases} expanded={expanded === purchase.id} handleChange={handleChange} />
                                    ))}
                                </>
                            )}
                            <Pagination
                                sx={{ mt: 1 }}
                                count={Math.ceil(notArrivedCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={notArrivedPage}
                                onChange={(e, page) => setNotArrivedPage(page)}
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
