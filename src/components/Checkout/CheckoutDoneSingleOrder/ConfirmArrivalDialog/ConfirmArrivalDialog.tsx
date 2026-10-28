import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import React from 'react';
import { ConfirmArrivalDialogProps } from '../types';

export const ConfirmArrivalDialog = ({ open, onClose, orderId, onSuccess }: ConfirmArrivalDialogProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const [arrivalDate, setArrivalDate] = React.useState<Dayjs | null>(null);
    const [addToInventory, setAddToInventory] = React.useState(true);

    const handleSubmit = () => {
        if (!arrivalDate) return;
        apiRequest(ENDPOINTS.API.ORDERS.SET_ARRIVED, 'POST', {
            orderId: orderId,
            date: arrivalDate.format('YYYY-MM-DD HH:mm:ss'),
            addToInventory: addToInventory,
        }).then((data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('checkout.doneSingleOrder.arrivedSuccess'));
                if (onSuccess) onSuccess();
            } else {
                notifications.addErrorNotification(t('checkout.doneSingleOrder.arrivedError'));
            }
            onClose();
        });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('checkout.singleOrder.confirmArrival')}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid>
                        <DatePicker value={arrivalDate} onChange={(newValue) => setArrivalDate(newValue)} />
                    </Grid>
                    <Grid size={12}>
                        <FormControlLabel control={<Checkbox checked={addToInventory} onChange={(e) => setAddToInventory(e.target.checked)} />} label={t('checkout.singleOrder.addToInventory')} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleSubmit} variant='contained' disabled={!arrivalDate}>
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmArrivalDialog;
