'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import SalesAccordion from '@/src/components/Sales/SalesAccordion/SalesAccordion';
import SalesNavBar from '@/src/components/Sales/SalesNavBar/SalesNavBar';
import SalesSummary from '@/src/components/Sales/SalesSummary/SalesSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { useSalesStore } from '@/src/store/sales';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function SalesShipped() {
    const t = useTranslations();
    const { shippedSales, loading, refreshShippedSales, setShippedPage, shippedPage, shippedCount, shippedSum, shippedLoading } = useSalesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        refreshShippedSales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`sales.shipped.title`)} previous={[{ text: t(`sales.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`sales.shipped.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <SalesNavBar selectedIndex={4} />
                    </Box>
                    <SalesSummary title={t('sales.shipped.title')} count={shippedCount} sum={shippedSum} />
                    {shippedSales.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`sales.shipped.noSales`)}
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
                                    {shippedSales.map((sale) => (
                                        <SalesAccordion key={sale.id} sale={sale} loading={loading} expanded={expanded === sale.id} handleChange={handleChange} refresh={refreshShippedSales} />
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
