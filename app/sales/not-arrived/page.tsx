'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import NotArrivedSalesFilters from '@/src/components/Sales/NotArrivedSalesFilters/Nor ArrivedSalesFilters';
import SalesAccordion from '@/src/components/Sales/SalesAccordion/SalesAccordion';
import SalesNavBar from '@/src/components/Sales/SalesNavBar/SalesNavBar';
import SalesSummary from '@/src/components/Sales/SalesSummary/SalesSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { useSalesStore } from '@/src/store/sales';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function SalesNotArrived() {
    const t = useTranslations();
    const { notArrivedSales, loading, refreshNotArrivedSales, setNotArrivedPage, notArrivedPage, notArrivedCount, notArrivedSum, notArrivedLoading } = useSalesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        refreshNotArrivedSales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`sales.notArrived.title`)} previous={[{ text: t(`sales.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`sales.notArrived.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <SalesNavBar selectedIndex={7} />
                    </Box>
                    <NotArrivedSalesFilters />
                    <SalesSummary title={t('sales.notArrived.title')} count={notArrivedCount} sum={notArrivedSum} />
                    {notArrivedSales.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`sales.notArrived.noSales`)}
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
                                    {notArrivedSales.map((sale) => (
                                        <SalesAccordion key={sale.id} sale={sale} loading={loading} expanded={expanded === sale.id} handleChange={handleChange} refresh={refreshNotArrivedSales} />
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
