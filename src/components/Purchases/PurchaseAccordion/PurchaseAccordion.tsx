import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { formatCurrency } from '@/src/utils/helpers';
import { ExpandMore, LocationOn } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';
import { CheckoutDoneSingleOrder } from '../../Checkout/CheckoutDoneSingleOrder/CheckoutDoneSingleOrder';
import { PurchaseAccordionProps } from '../types';

export default function PurchaseAccordion({ purchase, expanded, handleChange, refresh, showPayButton = false }: PurchaseAccordionProps) {
    const t = useTranslations();
    const notification = useNotifications();
    const { funds, refreshFunds } = useShoppingCartStore();
    const [loading, setLoading] = React.useState(false);

    const handlePayOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setLoading(true);
        apiRequest(ENDPOINTS.API.ORDERS.PAY, 'POST', {
            orderId: purchase.id,
        }).then((data: any) => {
            setLoading(false);
            if (data.success) {
                notification.addSuccessNotification(t('purchases.successPayment'));
                refreshFunds();
                refresh();
            } else {
                notification.addErrorNotification(t('purchases.errorPayment'));
            }
        });
    };

    return (
        <Accordion key={`${purchase.id}`} expanded={expanded} onChange={handleChange(purchase.id)}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`purchase-${purchase.id}-content`} id={`purchase-${purchase.id}-header`} component='div'>
                <Grid container spacing={2} sx={{ width: '100%', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <Grid size={3}>
                        {t(`purchases.purchase`)} {purchase.id}
                        {purchase.orderShipping?.tracking === 1 && <LocationOn sx={{ ml: 1, mb: -0.5 }} color='success' fontSize='small' />}
                        {showPayButton && funds >= purchase.totalPrice && (
                            <Button variant='contained' size='small' sx={{ ml: 1 }} loading={loading} onClick={(e) => handlePayOrder(e)}>
                                {t('purchases.pay')}
                            </Button>
                        )}
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'center' }}>
                        {formatCurrency(purchase.totalPrice)}
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'center', pr: 2 }}>
                        {t(`games.${purchase.game}`)}
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'right', pr: 2 }}>
                        {purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : ''}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <CheckoutDoneSingleOrder key={purchase.id} order={purchase} hideHeader={true} expanded={expanded} refresh={refresh} />
            </AccordionDetails>
        </Accordion>
    );
}
