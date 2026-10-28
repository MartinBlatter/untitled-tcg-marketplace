import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useBuylistStore } from '@/src/store/buylist';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';

// Define props interface
interface DeleteBuylistDialogProps {
    show: boolean;
    setShow: (show: boolean) => void;
    buylistId: number;
}

const DeleteBuylistDialog: React.FC<DeleteBuylistDialogProps> = ({ show, setShow, buylistId }) => {
    const t = useTranslations();
    const router = useRouter();
    const { deleteBuylist, isLoading } = useBuylistStore();

    const handleClose = () => {
        setShow(false);
    };

    const handleDelete = async () => {
        await deleteBuylist(buylistId);
        setShow(false);
        router.push(INTERNAL_ROUTES.BUYLIST.ROOT);
    };

    return (
        <Dialog open={show} onClose={handleClose} maxWidth='sm' fullWidth>
            <DialogTitle>{t('buylist.delete')}</DialogTitle>
            <DialogContent>
                <Typography>{t('buylist.confirmDelete')}</Typography>
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

export default DeleteBuylistDialog;
