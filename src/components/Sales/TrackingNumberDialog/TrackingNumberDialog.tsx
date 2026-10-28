import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Close } from '@mui/icons-material';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface TrackingNumberDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: number;
    currentTrackingNumber?: string | null;
    onSuccess?: () => void;
}

export const TrackingNumberDialog = ({ open, onClose, orderId, currentTrackingNumber = null, onSuccess }: TrackingNumberDialogProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await apiRequest(ENDPOINTS.API.ORDERS.UPDATE_TRACKING, 'POST', {
                orderId,
                trackingNumber,
            }).then((response: any) => {
                if (response.success) {
                    notifications.addSuccessNotification(t('sales.trackingNumber.updateSuccess'));
                    if (onSuccess) onSuccess();
                    onClose();
                } else {
                    notifications.addErrorNotification(response.message || t('sales.trackingNumber.updateError'));
                }
            });
        } catch (error) {
            notifications.addErrorNotification(t('sales.trackingNumber.updateError'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setTrackingNumber(currentTrackingNumber || '');
        onClose();
    };

    return (
        <Dialog open={open} onClose={!loading ? handleCancel : undefined} fullWidth maxWidth='sm'>
            <DialogTitle>
                {t('sales.trackingNumber.title')}
                {!loading && (
                    <IconButton
                        aria-label='close'
                        onClick={handleCancel}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <Close />
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent>
                <Typography variant='body1' sx={{ mb: 2 }}>
                    {t('sales.trackingNumber.description')}
                </Typography>
                <TextField
                    autoFocus
                    margin='dense'
                    label={t('sales.trackingNumber.label')}
                    type='text'
                    fullWidth
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    disabled={loading}
                    variant='outlined'
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} disabled={loading}>
                    {t('cancel')}
                </Button>
                <Button onClick={handleSubmit} variant='contained' disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
