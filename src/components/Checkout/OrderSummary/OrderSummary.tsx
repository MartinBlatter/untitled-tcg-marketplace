'use client';

import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { formatCurrency } from '@/src/utils/helpers';
import { Button, Card, Divider, Grid, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import { OrderSummaryProps } from './types';

export const OrderSummary = ({ items }: OrderSummaryProps) => {
    const t = useTranslations();
    const notification = useNotifications();
    const router = useRouter();
    const { refreshShoppingCartItems } = useShoppingCartStore();
    const [loading, setLoading] = React.useState(false);

    const handleBuy = () => {
        setLoading(true);
        apiRequest(ENDPOINTS.API.ORDERS.PLACE).then((data: any) => {
            if (data.success) {
                setLoading(false);
                router.push(`/checkout/done`);
            } else {
                if (data.message === 'item_not_available') {
                    notification.addErrorNotification(t('checkout.orderSummary.itemNotAvailable'));
                    refreshShoppingCartItems();
                } else {
                    notification.addErrorNotification(t('checkout.orderSummary.error'));
                }
            }
        });
    };

    return (
        <Card sx={{ mt: 4, p: 2 }}>
            <Typography variant='h6' sx={{ mb: 1 }}>
                {t('checkout.orderSummary.title')}
            </Typography>
            {items.map((sellerItems, index) => (
                <Grid container key={`subtotal-${index}`} sx={{ mb: 0.5 }}>
                    <Grid sx={{
                        flex: 1
                    }}>
                        <Typography variant='body1'>{t('checkout.orderSummary.orderSubtotal', { order: index + 1 })}:</Typography>
                    </Grid>
                    <Grid>
                        <Typography variant='body1' sx={{ textAlign: 'right', minWidth: '80px' }}>
                            {formatCurrency(sellerItems.reduce((acc, item) => acc + item.quantity * Number(item.price), 0))}
                        </Typography>
                    </Grid>
                </Grid>
            ))}
            <Divider sx={{ my: 1 }} />
            <Grid container sx={{ mb: 2 }}>
                <Grid sx={{
                    flex: 1
                }}>
                    <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                        {t('checkout.orderSummary.total')}:
                    </Typography>
                </Grid>
                <Grid>
                    <Typography variant='body1' sx={{ fontWeight: 'bold', textAlign: 'right', minWidth: '80px' }}>
                        {formatCurrency(items.reduce((acc, sellerItems) => acc + sellerItems.reduce((acc2, item) => acc2 + item.quantity * Number(item.price), 0), 0))}
                    </Typography>
                </Grid>
            </Grid>
            <Button
                variant='contained'
                loading={loading}
                fullWidth
                onClick={() => {
                    handleBuy();
                }}
            >
                {t('checkout.orderSummary.buy')}
            </Button>
        </Card>
    );
};
