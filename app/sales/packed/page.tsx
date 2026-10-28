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

export default function SalesPacked() {
    const t = useTranslations();
    const { packedSales, loading, refreshPackedSales, setPackedPage, packedPage, packedCount, packedSum, packedLoading } = useSalesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        refreshPackedSales();
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`sales.packed.title`)} previous={[{ text: t(`sales.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`sales.packed.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <SalesNavBar selectedIndex={3} />
                    </Box>
                    <SalesSummary title={t('sales.packed.title')} count={packedCount} sum={packedSum} />
                    {packedSales.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`sales.packed.noSales`)}
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Pagination
                                sx={{ mb: 1 }}
                                count={Math.ceil(packedCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={packedPage}
                                onChange={(e, page) => setPackedPage(page)}
                                showFirstButton
                                showLastButton
                            />
                            {packedLoading ? (
                                <Skeleton variant='rectangular' width={'100%'} height={960} />
                            ) : (
                                <>
                                    {packedSales.map((sale) => (
                                        <SalesAccordion key={sale.id} sale={sale} loading={loading} expanded={expanded === sale.id} handleChange={handleChange} refresh={refreshPackedSales} />
                                    ))}
                                </>
                            )}
                            <Pagination
                                sx={{ mt: 1 }}
                                count={Math.ceil(packedCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={packedPage}
                                onChange={(e, page) => setPackedPage(page)}
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
