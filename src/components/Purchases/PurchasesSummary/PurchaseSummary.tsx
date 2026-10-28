import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { formatCurrency } from '@/src/utils/helpers';
import { Button, Card } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';
import { PurchasesSummaryProps } from '../types';

export default function PurchasesSummary({ title, sum, count, showPayButton, refresh }: PurchasesSummaryProps) {
    const t = useTranslations();
    const notification = useNotifications();
    const { refreshFunds } = useShoppingCartStore();
    const [loading, setLoading] = React.useState(false);

    const handlePayOrder = () => {
        setLoading(true);
        apiRequest(ENDPOINTS.API.ORDERS.PAY, 'POST', {}).then((data: any) => {
            setLoading(false);
            if (data.success) {
                if (data.paid) {
                    notification.addSuccessNotification(t('purchases.successAllPayment'));
                } else {
                    notification.addWarningNotification(t('purchases.successPartialPayment'));
                }
                refreshFunds();
                refresh && refresh();
            } else {
                notification.addErrorNotification(t('purchases.errorPayment'));
            }
        });
    };

    return (
        <Card sx={{ mt: 2, p: 2 }}>
            <div>
                {title}: {count}
            </div>
            <div>
                {t('purchases.total')}: {formatCurrency(sum)}
            </div>
            {showPayButton && (
                <Button variant='contained' size='small' sx={{ mt: 1 }} loading={loading} onClick={() => handlePayOrder()}>
                    {t('purchases.payAll')}
                </Button>
            )}
        </Card>
    );
}
