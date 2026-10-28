import { useBuylistStore } from '@/src/store/buylist';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { BuylistEditDialogProps } from './types';

const BuylistEditDialog: React.FC<BuylistEditDialogProps> = ({ show, setShow, buylist }) => {
    const t = useTranslations();
    const { updateBuylist, isLoading } = useBuylistStore();

    const [name, setName] = useState(buylist.name);
    const [description, setDescription] = useState(buylist.description || '');
    const [isPublic, setIsPublic] = useState(buylist.isPublic === 1);
    const [nameError, setNameError] = useState('');

    // Update form when buylist changes
    useEffect(() => {
        if (buylist) {
            setName(buylist.name);
            setDescription(buylist.description || '');
            setIsPublic(buylist.isPublic === 1);
        }
    }, [buylist]);

    const handleClose = () => {
        setNameError('');
        setShow(false);
    };

    const handleSubmit = async () => {
        // Validate form
        if (!name.trim()) {
            setNameError(t('buylist.nameRequired'));
            return;
        }

        // Update buylist
        await updateBuylist(Number(buylist.id), {
            name: name.trim(),
            description: description.trim() || null,
            isPublic,
        });

        // Close dialog on success
        handleClose();
    };

    return (
        <Dialog open={show} onClose={handleClose} maxWidth='sm' fullWidth>
            <DialogTitle>{t('buylist.editBuylist')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    label={t('name')}
                    fullWidth
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setNameError('');
                    }}
                    error={!!nameError}
                    helperText={nameError}
                    required
                    margin='dense'
                />

                <TextField margin='dense' label={t('description')} fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

                <FormControlLabel control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />} label={t('buylist.makePublic')} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('cancel')}</Button>
                <Button onClick={handleSubmit} variant='contained'>
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuylistEditDialog;
