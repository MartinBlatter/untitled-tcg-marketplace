import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface SupportTicketDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface SupportTicket {
    category: string;
    subject: string;
    message: string;
    email: string;
}

const SupportTicketDialog = ({ open, setOpen }: SupportTicketDialogProps) => {
    const t = useTranslations();
    const { data: session } = useSession();
    const notifications = useNotifications();
    const [loading, setLoading] = useState(false);
    const [subjectError, setSubjectError] = useState('');
    const [messageError, setMessageError] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [supportTicket, setSupportTicket] = useState<SupportTicket>({
        category: '',
        subject: '',
        message: '',
        email: session?.user?.email || '',
    });

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!supportTicket.category) {
            setCategoryError(t('required'));
        } else {
            setCategoryError('');
        }

        if (!supportTicket.subject) {
            setSubjectError(t('required'));
        } else {
            setSubjectError('');
        }

        if (!supportTicket.message) {
            setMessageError(t('required'));
        } else {
            setMessageError('');
        }

        if (!supportTicket.subject || !supportTicket.message || !supportTicket.category) return;

        setLoading(true);

        apiRequest(ENDPOINTS.API.SUPPORT, 'POST', { values: supportTicket }).then((res: any) => {
            setLoading(false);
            if (res && res.success) {
                notifications.addSuccessNotification(t('support.success'));
                setOpen(false);
                setSupportTicket({
                    category: '',
                    subject: '',
                    message: '',
                    email: session?.user?.email || '',
                });
            } else {
                notifications.addErrorNotification(t('support.error'));
            }
        });
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSupportTicket({ ...supportTicket, category: event.target.value as string });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSupportTicket({ ...supportTicket, [event.target.name]: event.target.value });
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
            <DialogTitle>{t('support.dialogTitle')}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={12}>
                        <TextField
                            label={t('support.category')}
                            name='category'
                            select
                            value={supportTicket.category}
                            onChange={handleCategoryChange}
                            fullWidth
                            error={categoryError !== ''}
                            helperText={categoryError}
                        >
                            <MenuItem value='general'>{t('support.categories.general')}</MenuItem>
                            <MenuItem value='account'>{t('support.categories.account')}</MenuItem>
                            <MenuItem value='orders'>{t('support.categories.orders')}</MenuItem>
                            <MenuItem value='payments'>{t('support.categories.payments')}</MenuItem>
                            <MenuItem value='technical'>{t('support.categories.technical')}</MenuItem>
                            <MenuItem value='other'>{t('support.categories.other')}</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            label={t('support.subject')}
                            name='subject'
                            value={supportTicket.subject}
                            onChange={handleInputChange}
                            fullWidth
                            error={subjectError !== ''}
                            helperText={subjectError}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            label={t('support.message')}
                            name='message'
                            value={supportTicket.message}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                            error={messageError !== ''}
                            helperText={messageError}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField label={t('support.email')} name='email' value={supportTicket.email} onChange={handleInputChange} fullWidth helperText={t('support.emailHelperText')} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color='primary'>
                    {t('cancel')}
                </Button>
                <Button onClick={handleSubmit} loading={loading} variant='contained' color='primary'>
                    {t('submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SupportTicketDialog;
