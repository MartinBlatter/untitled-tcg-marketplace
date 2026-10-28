import { apiRequest } from '@/src/actions/apiRequest';
import ConfirmationDialog from '@/src/components/ConfirmationDialog/ConfirmationDialog';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { ORDER_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Box, Button, Card, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';
import AddToInventoryDialog from '../AddToInventoryDialog/AddToInventoryDialog';
import ConfirmArrivalDialog from '../ConfirmArrivalDialog/ConfirmArrivalDialog';
import { OrderStatusPaperProps } from '../types';

export const OrderStatusPaper = ({ status, shippingStatus, arrivedAt, cancelledAt, shippedAt, orderId, onSuccess, orderItems }: OrderStatusPaperProps & { orderItems?: any[] }) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const [showArrivalDialog, setShowArrivalDialog] = React.useState(false);
    const [showAddToInventoryDialog, setShowAddToInventoryDialog] = React.useState(false);

    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
    };

    const handleNotArrived = () => {
        if (!orderId) return;
        apiRequest(ENDPOINTS.API.ORDERS.SET_NOT_ARRIVED, 'POST', { orderId }).then((data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('checkout.doneSingleOrder.notArrivedSuccess'));
                if (onSuccess) onSuccess();
            } else {
                notifications.addErrorNotification(t('checkout.doneSingleOrder.notArrivedError'));
            }
        });
    };

    const shippedDateObj = shippedAt ? new Date(shippedAt) : null;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const canMarkNotArrived = shippedDateObj && shippedDateObj < fourteenDaysAgo && shippingStatus === SHIPPING_STATUS.SHIPPED;

    if (!status) return null;

    return (
        <>
            <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant='body1' sx={{ textAlign: 'center' }}>
                    {t('checkout.doneSingleOrder.orderStatus')}: {t(`checkout.doneSingleOrder.orderStatuses.${status}`)}
                </Typography>
                {status === ORDER_STATUS.DELIVERED && arrivedAt && (
                    <Typography variant='body1' sx={{ textAlign: 'center' }}>
                        {formatDate(arrivedAt)}
                    </Typography>
                )}
                {(status === ORDER_STATUS.CANCELLED_BY_ADMIN || status === ORDER_STATUS.CANCELLED_BY_BUYER || status === ORDER_STATUS.CANCELLED_BY_SELLER) && cancelledAt && (
                    <Typography variant='body1' sx={{ textAlign: 'center' }}>
                        {formatDate(cancelledAt)}
                    </Typography>
                )}

                {shippingStatus === SHIPPING_STATUS.SHIPPED && orderId && (
                    <Card sx={{ p: 2, mt: 'auto' }} elevation={1}>
                        <Button onClick={() => setShowArrivalDialog(true)} variant='contained' size='large' fullWidth>
                            {t('checkout.singleOrder.confirmArrival')}
                        </Button>
                        <Button onClick={() => setShowAddToInventoryDialog(true)} variant='outlined' size='large' fullWidth sx={{ mt: 2 }}>
                            {t('checkout.singleOrder.addToInventory')}
                        </Button>
                        {canMarkNotArrived ? (
                            <ConfirmationDialog
                                title={t('checkout.singleOrder.notArrivedConfirmTitle')}
                                description={t('checkout.singleOrder.notArrivedConfirmDescription')}
                                response={handleNotArrived}
                            >
                                {(showDialog) => (
                                    <Button onClick={showDialog} variant='outlined' size='large' fullWidth sx={{ mt: 2 }}>
                                        {t('checkout.singleOrder.notArrived')}
                                    </Button>
                                )}
                            </ConfirmationDialog>
                        ) : (
                            <Box>
                                <Button variant='outlined' disabled={true} size='large' fullWidth sx={{ mt: 2 }}>
                                    {t('checkout.singleOrder.notArrived')}
                                </Button>
                                <Typography variant='caption' gutterBottom sx={{ display: 'block', textAlign: 'center' }}>
                                    {t('checkout.singleOrder.notArrivedTooltip')}
                                </Typography>
                            </Box>
                        )}
                    </Card>
                )}
            </Paper>

            {orderId && <ConfirmArrivalDialog open={showArrivalDialog} onClose={() => setShowArrivalDialog(false)} orderId={orderId} onSuccess={onSuccess} />}
            {orderItems && (
                <AddToInventoryDialog
                    open={showAddToInventoryDialog}
                    onClose={() => setShowAddToInventoryDialog(false)}
                    orderItems={orderItems.filter((item) => item.quantity > 0 && item.game !== 'shipping')}
                    onSubmit={async (selected) => {
                        // Call API to add selected items to inventory
                        await apiRequest(ENDPOINTS.API.INVENTORY.ADD_PURCHASED_ITEMS, 'POST', {
                            orderId,
                            items: selected,
                        });
                        notifications.addSuccessNotification(t('checkout.singleOrder.addedToInventory'));
                        setShowAddToInventoryDialog(false);
                        if (onSuccess) onSuccess();
                    }}
                />
            )}
        </>
    );
};

export default OrderStatusPaper;
