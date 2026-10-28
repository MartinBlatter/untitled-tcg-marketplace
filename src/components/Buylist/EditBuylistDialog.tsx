import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useBuylistStore } from '@/src/store/buylist';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { EditBuylistDialogProps } from './types';

const EditBuylistDialog: React.FC<EditBuylistDialogProps> = ({ show, setShow, buylist }) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const { updateBuylist, isLoading, fetchBuylistById } = useBuylistStore();

    // Use null as initial state to track if values have been loaded
    const [name, setName] = useState<string | null>(buylist.name || null);
    const [description, setDescription] = useState<string | null>(buylist.description || null);
    const [isPublic, setIsPublic] = useState<boolean>(buylist.isPublic === 1 ? true : false);
    const [nameError, setNameError] = useState('');

    const handleClose = () => {
        setNameError('');
        setShow(false);
    };

    const handleSubmit = async () => {
        // Validate form
        if (!name?.trim()) {
            setNameError(t('buylist.nameRequired'));
            return;
        }

        try {
            // Update buylist
            await updateBuylist(buylist.id, {
                name,
                description: description || null,
                isPublic: isPublic,
            });

            // Show success notification
            notifications.addSuccessNotification(t('buylist.updateSuccess') || 'Buylist updated successfully');

            // Refresh buylist data to reflect changes
            fetchBuylistById(buylist.id);

            // Close dialog
            setShow(false);
        } catch (error) {
            notifications.addErrorNotification(t('buylist.updateError') || 'Failed to update buylist');
        }
    };

    return (
        <Dialog open={show} onClose={handleClose} maxWidth='sm' fullWidth>
            <DialogTitle>{t('buylist.editBuylist')}</DialogTitle>
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
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditBuylistDialog;
