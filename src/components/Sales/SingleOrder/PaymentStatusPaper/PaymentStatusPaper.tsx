import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { PAYMENT_STATUS } from '@/src/constants/status';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Paper, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PaymentStatusPaperProps, RefundResponse } from '../../types';

export const PaymentStatusPaper = ({ status, paidAt, orderId, totalPrice }: PaymentStatusPaperProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const [openRefundDialog, setOpenRefundDialog] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRefund = () => {
        const amount = Number(refundAmount);
        if (!amount || amount <= 0 || amount > totalPrice) {
            notifications.addErrorNotification(t('sales.invalidRefundAmount'));
            return;
        }

        setLoading(true);
        apiRequest(ENDPOINTS.API.ORDERS.REFUND, 'POST', {
            orderId,
            amount,
        }).then((response) => {
            setLoading(false);
            const typedResponse = response as RefundResponse;
            if (typedResponse.success) {
                notifications.addSuccessNotification(t('sales.refundSuccess'));
                setOpenRefundDialog(false);
                setRefundAmount('');
            } else {
                notifications.addErrorNotification(typedResponse.message ? t(`errors.${typedResponse.message}`) : t('sales.refundError'));
            }
        });
    };

    return (
        <>
            <Paper elevation={2} sx={{ p: 2, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='body1'>
                        {t('sales.paymentStatus')}: {t(`checkout.doneSingleOrder.paymentStatuses.${status}`)}
                    </Typography>
                    {status !== PAYMENT_STATUS.PENDING && <Typography variant='body1'>{paidAt ? new Date(paidAt).toLocaleDateString() : ''}</Typography>}
                </Box>
                {status === PAYMENT_STATUS.PAID && (
                    <Card sx={{ p: 2, mt: 'auto' }} elevation={1}>
                        <Button fullWidth variant='outlined' color='primary' onClick={() => setOpenRefundDialog(true)}>
                            {t('sales.refund')}
                        </Button>
                    </Card>
                )}
            </Paper>

            <Dialog open={openRefundDialog} onClose={() => !loading && setOpenRefundDialog(false)}>
                <DialogTitle>{t('sales.refundDialogTitle')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin='dense'
                        label={t('sales.refundAmount')}
                        type='number'
                        fullWidth
                        variant='outlined'
                        value={refundAmount}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            if (value <= totalPrice) {
                                setRefundAmount(e.target.value);
                            }
                        }}
                        slotProps={{
                            htmlInput: {
                                min: 0,
                                max: totalPrice,
                                step: 0.01,
                            },
                        }}
                        disabled={loading}
                        helperText={t('sales.refundMaxAmount', { amount: totalPrice })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={() => setOpenRefundDialog(false)} disabled={loading}>
                        {t('cancel')}
                    </Button>
                    <Button variant='contained' onClick={handleRefund} disabled={loading || !refundAmount || Number(refundAmount) <= 0 || Number(refundAmount) > totalPrice} loading={loading}>
                        {t('confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
