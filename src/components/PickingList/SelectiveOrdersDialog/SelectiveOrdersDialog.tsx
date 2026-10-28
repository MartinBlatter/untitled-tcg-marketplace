import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { usePickingListStore } from '@/src/store/pickinglists';
import { useSalesStore } from '@/src/store/sales';
import { Close } from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface SelectiveOrdersDialogProps {
    open: boolean;
    onClose: () => void;
}

const SelectiveOrdersDialog = ({ open, onClose }: SelectiveOrdersDialogProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const { createFromSelectedOrders } = usePickingListStore();
    const { paidLoading, paidSales, refreshPaidSales } = useSalesStore();
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (open) {
            refreshPaidSales();
        }
    }, [open]);

    const handleToggleOrder = (orderId: number) => {
        setSelectedOrders((prevSelected) => {
            if (prevSelected.includes(orderId)) {
                return prevSelected.filter((id) => id !== orderId);
            } else {
                return [...prevSelected, orderId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedOrders.length === paidSales.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(paidSales.map((order) => order.id as number));
        }
    };

    const handleCreate = async () => {
        if (selectedOrders.length === 0) {
            notifications.addErrorNotification(t('pickinglists.noOrdersSelected'));
            return;
        }

        setCreating(true);
        try {
            const result = await createFromSelectedOrders(selectedOrders);

            if (result.success) {
                notifications.addSuccessNotification(t('pickinglists.createSuccess'));
                onClose();
            } else {
                notifications.addErrorNotification(result.message || t('pickinglists.createError'));
            }
        } catch (error) {
            console.error('Error creating picking list:', error);
            notifications.addErrorNotification(t('pickinglists.createError'));
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onClose={!creating ? onClose : undefined} fullWidth maxWidth='md'>
            <DialogTitle>
                {t('pickinglists.selectOrders')}
                {!creating && (
                    <IconButton
                        aria-label='close'
                        onClick={onClose}
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
                {paidLoading ? (
                    <LinearProgress sx={{ my: 4 }} />
                ) : paidSales.length === 0 ? (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>{t('pickinglists.noPaidOrders')}</Typography>
                ) : (
                    <>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedOrders.length > 0 && selectedOrders.length === paidSales.length}
                                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < paidSales.length}
                                    onChange={handleSelectAll}
                                />
                            }
                            label={t('pickinglists.selectAll')}
                        />
                        <Divider sx={{ my: 1 }} />
                        <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                            {paidSales.map((order) => (
                                <ListItem key={order.id} disablePadding>
                                    <ListItemButton dense onClick={() => handleToggleOrder(order.id as number)}>
                                        <Checkbox edge='start' checked={selectedOrders.includes(order.id as number)} tabIndex={-1} disableRipple />
                                        <ListItemText
                                            primary={`${t('pickinglists.order')} #${order.id}`}
                                            secondary={
                                                <Box>
                                                    <Typography variant='body2' component='span'>
                                                        {t('pickinglists.buyer')}: {order.buyerId || '-'} |{t('pickinglists.items')}: {order.orderItems?.length || 0} |{t('pickinglists.date')}:{' '}
                                                        {new Date(order.createdAt || '').toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={creating}>
                    {t('cancel')}
                </Button>
                <Button onClick={handleCreate} variant='contained' color='primary' disabled={creating || selectedOrders.length === 0 || paidLoading} loading={creating || paidLoading}>
                    {t('pickinglists.create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SelectiveOrdersDialog;
