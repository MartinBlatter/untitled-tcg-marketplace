'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import DeliveredSalesFilters from '@/src/components/Sales/DeliveredSalesFilters/DeliveredSalesFilters';
import SalesAccordion from '@/src/components/Sales/SalesAccordion/SalesAccordion';
import SalesNavBar from '@/src/components/Sales/SalesNavBar/SalesNavBar';
import SalesSummary from '@/src/components/Sales/SalesSummary/SalesSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { useSalesStore } from '@/src/store/sales';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

export default function SalesDelivered() {
    const t = useTranslations();
    const { deliveredSales, loading, deliveredLoading, refreshDeliveredSales, setDeliveredPage, deliveredPage, deliveredCount, deliveredSum, setDeliveredFilters } = useSalesStore();
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
        const buyerName = searchParams.get('buyerName');
        const itemName = searchParams.get('itemName');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const createdAtStart = searchParams.get('createdAtStart');
        const createdAtEnd = searchParams.get('createdAtEnd');

        const urlFilters: any = {};

        if (orderId) urlFilters.orderId = orderId;
        if (buyerName) urlFilters.buyerName = buyerName;
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
            refreshDeliveredSales();
        }
    }, [searchParams, setDeliveredFilters, refreshDeliveredSales, initialFilterSet]);

    return (
        <>
            <BasicBreadcrumbs current={t(`sales.delivered.title`)} previous={[{ text: t(`sales.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`sales.delivered.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <SalesNavBar selectedIndex={5} />
                    </Box>
                    <DeliveredSalesFilters />
                    <SalesSummary title={t('sales.delivered.title')} count={deliveredCount} sum={deliveredSum} />
                    {deliveredSales.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`sales.delivered.noSales`)}
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
                                    {deliveredSales.map((sale) => (
                                        <SalesAccordion key={sale.id} sale={sale} loading={loading} expanded={expanded === sale.id} handleChange={handleChange} refresh={refreshDeliveredSales} />
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
