import { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import { LocalShipping, MarkEmailRead, MarkEmailUnread, QrCode } from '@mui/icons-material';
import { Box, Button, Card, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { TrackingNumberDialog } from '../../TrackingNumberDialog/TrackingNumberDialog';
import { ShippingStatusPaperProps } from '../../types';

export const ShippingStatusPaper = ({ status, orderStatus, paymentStatus, shippedAt, onStatusChange, orderId, orderShipping }: ShippingStatusPaperProps) => {
    const t = useTranslations();
    const [showTrackingDialog, setShowTrackingDialog] = useState(false);
    const hasTracking = orderShipping?.tracking === 1;

    return (
        <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant='body1'>
                    {t('sales.shippingStatus')}: {t(`checkout.doneSingleOrder.shippingStatuses.${status}`)}
                </Typography>
                {(status === SHIPPING_STATUS.SHIPPED || status === SHIPPING_STATUS.DELIVERED) && <Typography variant='body1'>{shippedAt ? new Date(shippedAt).toLocaleDateString() : ''}</Typography>}

                {/* Show tracking number if present */}
                {hasTracking && orderShipping?.trackingNumber && (
                    <Typography variant='body2' sx={{ mt: 1 }}>
                        {t('sales.trackingNumber.number')}: {orderShipping.trackingNumber}
                    </Typography>
                )}
            </Box>

            {(status === SHIPPING_STATUS.PENDING && orderStatus === ORDER_STATUS.PENDING) ||
            (status !== SHIPPING_STATUS.PENDING && orderStatus === ORDER_STATUS.PENDING) ||
            (status === SHIPPING_STATUS.PENDING && paymentStatus !== PAYMENT_STATUS.PENDING) ||
            status === SHIPPING_STATUS.PACKED ||
            (status === SHIPPING_STATUS.SHIPPED && orderStatus === ORDER_STATUS.PENDING) ? (
                <Card sx={{ p: 2, mt: 2 }} elevation={1}>
                    {status === SHIPPING_STATUS.PENDING && orderStatus === ORDER_STATUS.PENDING && (
                        <Button
                            endIcon={<MarkEmailRead />}
                            variant={status === SHIPPING_STATUS.PENDING ? 'contained' : 'outlined'}
                            sx={{ mb: 2 }}
                            fullWidth
                            onClick={() => onStatusChange(SHIPPING_STATUS.PACKED)}
                        >
                            {t('sales.setAsPacked')}
                        </Button>
                    )}
                    {status !== SHIPPING_STATUS.PENDING && orderStatus === ORDER_STATUS.PENDING && (
                        <Button endIcon={<MarkEmailUnread />} variant='outlined' sx={{ mb: 2 }} fullWidth onClick={() => onStatusChange(SHIPPING_STATUS.PENDING)}>
                            {t('sales.setAsNotPacked')}
                        </Button>
                    )}
                    {((status === SHIPPING_STATUS.PENDING && paymentStatus !== PAYMENT_STATUS.PENDING) || status === SHIPPING_STATUS.PACKED) && (
                        <Button
                            endIcon={<LocalShipping />}
                            variant={status === SHIPPING_STATUS.PACKED ? 'contained' : 'outlined'}
                            fullWidth
                            onClick={() => onStatusChange(SHIPPING_STATUS.SHIPPED)}
                            sx={{ mb: hasTracking ? 2 : 0 }}
                        >
                            {t('sales.setAsShipped')}
                        </Button>
                    )}
                    {status === SHIPPING_STATUS.SHIPPED && orderStatus === ORDER_STATUS.PENDING && (
                        <Button endIcon={<LocalShipping />} variant='outlined' fullWidth onClick={() => onStatusChange(SHIPPING_STATUS.PACKED)} sx={{ mb: hasTracking ? 2 : 0 }}>
                            {t('sales.setAsNotShipped')}
                        </Button>
                    )}

                    {/* Tracking number button (only show if shipping has tracking) */}
                    {hasTracking && (
                        <Button endIcon={<QrCode />} variant='outlined' fullWidth onClick={() => setShowTrackingDialog(true)}>
                            {orderShipping?.trackingNumber ? t('sales.trackingNumber.update') : t('sales.trackingNumber.add')}
                        </Button>
                    )}
                </Card>
            ) : null}

            {/* Tracking Number Dialog */}
            {orderId !== undefined && (
                <TrackingNumberDialog
                    open={showTrackingDialog}
                    onClose={() => setShowTrackingDialog(false)}
                    orderId={Number(orderId)}
                    currentTrackingNumber={orderShipping?.trackingNumber}
                    onSuccess={() => onStatusChange(status)} // Just to refresh the data
                />
            )}
        </Paper>
    );
};
