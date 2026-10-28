'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import { InCartSale } from '@/src/components/Sales/InCartSale/InCartSale';
import SalesNavBar from '@/src/components/Sales/SalesNavBar/SalesNavBar';
import SalesSummary from '@/src/components/Sales/SalesSummary/SalesSummary';
import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { useSalesStore } from '@/src/store/sales';
import { Alert, Box, LinearProgress, Pagination, Skeleton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function SalesInCart() {
    const t = useTranslations();
    const { inCartSales, loading, refreshInCartSales, inCartPage, inCartCount, inCartSum, inCartLoading, setInCartPage } = useSalesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        refreshInCartSales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`sales.inCart.title`)} previous={[{ text: t(`sales.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`sales.inCart.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <SalesNavBar selectedIndex={0} />
                    </Box>
                    <SalesSummary title={t('sales.unpaid.title')} count={inCartCount} sum={inCartSum} />
                    {inCartSales.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`sales.inCart.noSales`)}
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Pagination
                                sx={{ mb: 1 }}
                                count={Math.ceil(inCartCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={inCartPage}
                                onChange={(e, page) => setInCartPage(page)}
                                showFirstButton
                                showLastButton
                            />
                            {inCartLoading ? (
                                <Skeleton variant='rectangular' width={'100%'} height={960} />
                            ) : (
                                <>
                                    {inCartSales.map((cart, index) => (
                                        <InCartSale key={cart.id} cart={cart} index={index} loading={loading} expanded={expanded === cart.id} handleChange={handleChange} />
                                    ))}
                                </>
                            )}
                            <Pagination
                                sx={{ mt: 1 }}
                                count={Math.ceil(inCartCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={inCartPage}
                                onChange={(e, page) => setInCartPage(page)}
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
