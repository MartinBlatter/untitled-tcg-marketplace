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

export default function PurchasesUnpaid() {
    const t = useTranslations();
    const { unpaidPurchases, unpaidCount, unpaidPage, setUnpaidPage, unpaidLoading, loading, refreshUnpaidPurchases, unpaidSum } = usePurchasesStore();
    const [expanded, setExpanded] = React.useState<number | false>(false);

    const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        refreshUnpaidPurchases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <BasicBreadcrumbs current={t(`purchases.unpaid.title`)} previous={[{ text: t(`purchases.title`), url: '' }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`purchases.unpaid.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        <PurchaseNavBar selectedIndex={0} />
                    </Box>
                    <PurchasesSummary title={t('purchases.unpaid.title')} sum={unpaidSum} count={unpaidCount} showPayButton refresh={refreshUnpaidPurchases} />
                    {unpaidPurchases.length === 0 ? (
                        <Alert variant='filled' severity='info' sx={{ mt: 2 }}>
                            {t(`purchases.unpaid.noPurchases`)}
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Pagination
                                sx={{ mb: 1 }}
                                count={Math.ceil(unpaidCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={unpaidPage}
                                onChange={(e, page) => setUnpaidPage(page)}
                                showFirstButton
                                showLastButton
                            />
                            {unpaidLoading ? (
                                <Skeleton variant='rectangular' width={'100%'} height={960} />
                            ) : (
                                <>
                                    {unpaidPurchases.map((purchase, index) => (
                                        <PurchaseAccordion
                                            key={purchase.id}
                                            purchase={purchase}
                                            refresh={refreshUnpaidPurchases}
                                            expanded={expanded === purchase.id}
                                            handleChange={handleChange}
                                            showPayButton
                                        />
                                    ))}
                                </>
                            )}
                            <Pagination
                                sx={{ mt: 1 }}
                                count={Math.ceil(unpaidCount / ORDER_TABLE_ROWS_PER_PAGE)}
                                page={unpaidPage}
                                onChange={(e, page) => setUnpaidPage(page)}
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
