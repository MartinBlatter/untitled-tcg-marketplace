import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { PAYMENT_STATUS } from '@/src/constants/status';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Paper, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ExtraPaymentResponse, PaymentStatusPaperProps } from '../types';

export const PaymentStatusPaper = ({ status, paidAt, orderId }: PaymentStatusPaperProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const [openDialog, setOpenDialog] = useState(false);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
    };

    const handleExtraPayment = () => {
        if (!amount || Number(amount) <= 0) {
            notifications.addErrorNotification(t('checkout.doneSingleOrder.invalidAmount'));
            return;
        }

        setLoading(true);
        apiRequest(ENDPOINTS.API.ORDERS.PAY_EXTRA, 'POST', {
            orderId: orderId,
            amount: Number(amount),
        }).then((response) => {
            setLoading(false);
            const typedResponse = response as ExtraPaymentResponse;
            if (typedResponse.success) {
                notifications.addSuccessNotification(t('checkout.doneSingleOrder.extraPaymentSuccess'));
                setOpenDialog(false);
                setAmount('');
            } else {
                notifications.addErrorNotification(typedResponse.message ? t(`errors.${typedResponse.message}`) : t('checkout.doneSingleOrder.extraPaymentError'));
            }
        });
    };

    if (!status) return null;

    return (
        <>
            <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant='body1' sx={{ textAlign: 'center' }}>
                    {t('checkout.doneSingleOrder.paymentStatus')}: {t(`checkout.doneSingleOrder.paymentStatuses.${status}`)}
                </Typography>
                {status !== PAYMENT_STATUS.PENDING && paidAt && (
                    <Typography variant='body1' sx={{ textAlign: 'center' }}>
                        {formatDate(paidAt)}
                    </Typography>
                )}
                {orderId && status !== PAYMENT_STATUS.PENDING && (
                    <Card sx={{ p: 2, mt: 'auto' }} elevation={1}>
                        <Button variant='outlined' size='large' fullWidth onClick={() => setOpenDialog(true)}>
                            {t('checkout.doneSingleOrder.sendExtraPayment')}
                        </Button>
                    </Card>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={() => !loading && setOpenDialog(false)}>
                <DialogTitle>{t('checkout.doneSingleOrder.extraPaymentTitle')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin='dense'
                        label={t('checkout.doneSingleOrder.amount')}
                        type='number'
                        fullWidth
                        variant='outlined'
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={() => setOpenDialog(false)} disabled={loading}>
                        {t('cancel')}
                    </Button>
                    <Button variant='contained' onClick={handleExtraPayment} disabled={loading || !amount || Number(amount) <= 0} loading={loading}>
                        {t('confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PaymentStatusPaper;
