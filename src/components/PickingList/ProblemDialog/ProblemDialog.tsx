import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

interface ProblemDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (problem: string) => void;
}

export default function ProblemDialog({ open, onClose, onSave }: ProblemDialogProps) {
    const t = useTranslations();
    const [newProblem, setNewProblem] = React.useState('');

    const handleSave = () => {
        onSave(newProblem);
        setNewProblem('');
    };

    const handleClose = () => {
        setNewProblem('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
            <DialogTitle>{t('pickinglists.problem')}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <TextField
                        name='problem'
                        id='problem'
                        label={t('pickinglists.problem')}
                        fullWidth
                        multiline
                        rows={4}
                        value={newProblem}
                        onChange={(e) => setNewProblem(e.target.value)}
                        variant='outlined'
                    />
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ pr: 3, pb: 2 }}>
                <Button variant='outlined' onClick={handleClose}>
                    {t('cancel')}
                </Button>
                <Button variant='contained' color='primary' onClick={handleSave}>
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
