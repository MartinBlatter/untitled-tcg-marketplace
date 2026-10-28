'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import CancelledSalesFilters from '@/src/components/Sales/CancelledSalesFilters/CancelledSalesFilters';
import SalesAccordion from '@/src/components/Sales/SalesAccordion/SalesAccordion';
import SalesNavBar from '@/src/components/Sales/SalesNavBar/SalesNavBar';
import SalesSummary from '@/src/components/Sales/SalesSummary/SalesSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { useSalesStore } from '@/src/store/sales';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function SalesCancelled() {
    const t = useTranslations();
    const { cancelledSales, loading, refreshCancelledSales, cancelledPage, cancelledCount, cancelledSum, setCancelledPage, cancelledLoading } = useSalesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        refreshCancelledSales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`sales.cancelled.title`)} previous={[{ text: t(`sales.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`sales.cancelled.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <SalesNavBar selectedIndex={6} />
                    </Box>
                    <CancelledSalesFilters />
                    <SalesSummary title={t('sales.cancelled.title')} count={cancelledCount} sum={cancelledSum} />
                    {cancelledSales.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`sales.cancelled.noSales`)}
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
                                    {cancelledSales.map((sale) => (
                                        <SalesAccordion key={sale.id} sale={sale} loading={loading} expanded={expanded === sale.id} handleChange={handleChange} refresh={refreshCancelledSales} />
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
