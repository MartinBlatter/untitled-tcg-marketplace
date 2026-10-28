import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useBuylistStore } from '@/src/store/buylist';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { BuylistAddDialogProps } from './types';

const BuylistAddDialog: React.FC<BuylistAddDialogProps> = ({ show, setShow }) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const { createBuylist, isLoading, fetchBuylists } = useBuylistStore();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [nameError, setNameError] = useState('');

    const resetForm = () => {
        setName('');
        setDescription('');
        setIsPublic(false);
        setNameError('');
    };

    const handleClose = () => {
        resetForm();
        setShow(false);
    };

    const handleSubmit = async () => {
        // Validate form
        if (!name.trim()) {
            setNameError(t('buylist.nameRequired'));
            return;
        }

        try {
            // Create buylist - calling the store action
            await createBuylist(name, description, isPublic);

            // Show success notification - always show success since the createBuylist only
            // returns successfully if the API call works
            notifications.addSuccessNotification(t('buylist.createSuccess'));

            // Refresh the buylists to show the new one
            fetchBuylists();

            // Reset form and close dialog
            handleClose();
        } catch (error) {
            // Only show error notification if there's actually an error
            notifications.addErrorNotification(t('buylist.createError'));
        }
    };

    return (
        <Dialog open={show} onClose={handleClose} maxWidth='sm' fullWidth>
            <DialogTitle>{t('buylist.createBuylist')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        autoFocus
                        label={t('buylist.name')}
                        fullWidth
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setNameError('');
                        }}
                        error={!!nameError}
                        helperText={nameError}
                        required
                    />
                    <TextField label={t('buylist.description')} fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                    <FormControlLabel control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} color='primary' />} label={t('buylist.makePublic')} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>
                    {t('cancel')}
                </Button>
                <Button onClick={handleSubmit} variant='contained' disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : null}>
                    {t('create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuylistAddDialog;
