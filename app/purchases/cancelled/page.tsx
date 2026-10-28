'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import CancelledPurchasesFilters from '@/src/components/Purchases/CancelledPurchasesFilters/CancelledPurchasesFilters';
import PurchaseAccordion from '@/src/components/Purchases/PurchaseAccordion/PurchaseAccordion';
import PurchaseNavBar from '@/src/components/Purchases/PurchaseNavBar/PurchaseNavBar';
import PurchasesSummary from '@/src/components/Purchases/PurchasesSummary/PurchaseSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { usePurchasesStore } from '@/src/store/purchases';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function PurchasesCancelled() {
    const t = useTranslations();
    const { cancelledPurchases, loading, refreshCancelledPurchases, cancelledPage, cancelledCount, cancelledLoading, setCancelledPage, cancelledSum } = usePurchasesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        refreshCancelledPurchases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`purchases.cancelled.title`)} previous={[{ text: t(`purchases.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`purchases.cancelled.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <PurchaseNavBar selectedIndex={4} />
                    </Box>
                    <CancelledPurchasesFilters />
                    <PurchasesSummary title={t('purchases.cancelled.title')} count={cancelledCount} sum={cancelledSum} />
                    {cancelledPurchases.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`purchases.cancelled.noPurchases`)}
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Pagination
                                sx={{ mb: 1 }}
                                count={Math.ceil(cancelledCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={cancelledPage}
                                onChange={(e, page) => setCancelledPage(page)}
                                showFirstButton
                                showLastButton
                            />
                            {cancelledLoading ? (
                                <Skeleton variant='rectangular' width={'100%'} height={960} />
                            ) : (
                                <>
                                    {cancelledPurchases.map((purchase, index) => (
                                        <PurchaseAccordion key={purchase.id} purchase={purchase} refresh={refreshCancelledPurchases} expanded={expanded === purchase.id} handleChange={handleChange} />
                                    ))}
                                </>
                            )}
                            <Pagination
                                sx={{ mt: 1 }}
                                count={Math.ceil(cancelledCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={cancelledPage}
                                onChange={(e, page) => setCancelledPage(page)}
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
