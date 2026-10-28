import { useBuylistStore } from '@/src/store/buylist';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

// Define props interface
interface BuylistItemDeleteDialogProps {
    show: boolean;
    setShow: (show: boolean) => void;
    buylistId: number;
    itemId: number;
}

const BuylistItemDeleteDialog: React.FC<BuylistItemDeleteDialogProps> = ({ show, setShow, buylistId, itemId }) => {
    const t = useTranslations();
    const { deleteBuylistItem, isLoading } = useBuylistStore();

    const handleClose = () => {
        setShow(false);
    };

    const handleDelete = async () => {
        await deleteBuylistItem(buylistId, itemId);
        setShow(false);
    };

    return (
        <Dialog open={show} onClose={handleClose} maxWidth='sm' fullWidth>
            <DialogTitle>{t('buylist.deleteItem')}</DialogTitle>
            <DialogContent>
                <Typography>{t('buylist.confirmDeleteItem')}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>
                    {t('cancel')}
                </Button>
                <Button onClick={handleDelete} color='error' variant='contained' disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : null}>
                    {t('delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuylistItemDeleteDialog;
