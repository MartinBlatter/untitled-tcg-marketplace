'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import DeliveredPurchasesFilters from '@/src/components/Purchases/DeliveredPurchasesFilters/DeliveredPurchasesFilters';
import PurchaseAccordion from '@/src/components/Purchases/PurchaseAccordion/PurchaseAccordion';
import PurchaseNavBar from '@/src/components/Purchases/PurchaseNavBar/PurchaseNavBar';
import PurchasesSummary from '@/src/components/Purchases/PurchasesSummary/PurchaseSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { usePurchasesStore } from '@/src/store/purchases';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

export default function PurchasesDelivered() {
    const t = useTranslations();
    const { deliveredPurchases, loading, deliveredLoading, refreshDeliveredPurchases, setDeliveredPage, deliveredPage, deliveredCount, deliveredSum, setDeliveredFilters } = usePurchasesStore();
    const searchParams = useSearchParams();
    const [expanded, setExpanded] = React.useState<number | false>(false);
    const [initialFilterSet, setInitialFilterSet] = React.useState(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    // Read URL parameters and set filters on first load
    useEffect(() => {
        if (initialFilterSet || !searchParams) return;

        const orderId = searchParams.get('orderId');
        const sellerName = searchParams.get('sellerName');
        const itemName = searchParams.get('itemName');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const createdAtStart = searchParams.get('createdAtStart');
        const createdAtEnd = searchParams.get('createdAtEnd');

        const urlFilters: any = {};

        if (orderId) urlFilters.orderId = orderId;
        if (sellerName) urlFilters.sellerName = sellerName;
        if (itemName) urlFilters.itemName = itemName;
        if (minPrice) urlFilters.minPrice = minPrice;
        if (maxPrice) urlFilters.maxPrice = maxPrice;
        if (createdAtStart) urlFilters.createdAtStart = createdAtStart;
        if (createdAtEnd) urlFilters.createdAtEnd = createdAtEnd;

        // Only set filters if at least one parameter is present
        if (Object.keys(urlFilters).length > 0) {
            setDeliveredFilters(urlFilters);
            // Mark that we've processed URL params to avoid re-filtering on rerenders
            setInitialFilterSet(true);
        } else {
            refreshDeliveredPurchases();
        }
    }, [searchParams, setDeliveredFilters, refreshDeliveredPurchases, initialFilterSet]);

    return (
        <>
            <BasicBreadcrumbs current={t(`purchases.delivered.title`)} previous={[{ text: t(`purchases.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`purchases.delivered.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <PurchaseNavBar selectedIndex={3} />
                    </Box>
                    <DeliveredPurchasesFilters />
                    <PurchasesSummary title={t('purchases.delivered.title')} count={deliveredCount} sum={deliveredSum} />
                    {deliveredPurchases.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`purchases.delivered.noPurchases`)}
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Pagination
                                sx={{ mb: 1 }}
                                count={Math.ceil(deliveredCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={deliveredPage}
                                onChange={(e, page) => setDeliveredPage(page)}
                                showFirstButton
                                showLastButton
                            />
                            {deliveredLoading ? (
                                <Skeleton variant='rectangular' width={'100%'} height={960} />
                            ) : (
                                <>
                                    {deliveredPurchases.map((purchase, index) => (
                                        <PurchaseAccordion key={purchase.id} purchase={purchase} refresh={refreshDeliveredPurchases} expanded={expanded === purchase.id} handleChange={handleChange} />
                                    ))}
                                </>
                            )}
                            <Pagination
                                sx={{ mt: 1 }}
                                count={Math.ceil(deliveredCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={deliveredPage}
                                onChange={(e, page) => setDeliveredPage(page)}
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
