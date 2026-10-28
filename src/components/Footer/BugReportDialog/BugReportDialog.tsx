import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

const BugReportDialog = ({ open, setOpen }: BugReportDialogProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const [loading, setLoading] = useState(false);
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [bugReport, setBugReport] = useState<BugReport>({
        category: '',
        title: '',
        description: '',
        email: '',
    });

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!bugReport.category) {
            setCategoryError(t('required'));
        } else {
            setCategoryError('');
        }

        if (!bugReport.title) {
            setTitleError(t('required'));
        } else {
            setTitleError('');
        }

        if (!bugReport.description) {
            setDescriptionError(t('required'));
        } else {
            setDescriptionError('');
        }

        if (!bugReport.title || !bugReport.description || !bugReport.category) return;

        setLoading(true);

        apiRequest(ENDPOINTS.API.BUGREPORT, 'POST', { values: bugReport }).then((res: any) => {
            setLoading(false);
            if (res) {
                notifications.addSuccessNotification(t('bugReport.success'));
                setOpen(false);
                setBugReport({ category: '', title: '', description: '', email: '' });
            } else {
                notifications.addErrorNotification(t('bugReport.error'));
            }
        });

        setLoading(false);
    };

    const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setBugReport({ ...bugReport, category: event.target.value as string });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBugReport({ ...bugReport, [event.target.name]: event.target.value });
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{t('bugReportDialog.dialogTitle')}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <TextField
                            label={t('bugReportDialog.category')}
                            name='category'
                            select
                            value={bugReport.category}
                            onChange={(event) => handleCategoryChange(event)}
                            fullWidth
                            error={categoryError !== ''}
                            helperText={categoryError}
                        >
                            <MenuItem value='general'>{t('bugReportDialog.general')}</MenuItem>
                            <MenuItem value='cardErrors'>{t('bugReportDialog.cardErrors')}</MenuItem>
                            <MenuItem value='ui'>{t('bugReportDialog.ui')}</MenuItem>
                            <MenuItem value='performance'>{t('bugReportDialog.performance')}</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={12}>
                        <TextField label={t('bugReportDialog.title')} name='title' value={bugReport.title} onChange={handleInputChange} fullWidth error={titleError !== ''} helperText={titleError} />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            label={t('bugReportDialog.description')}
                            name='description'
                            value={bugReport.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                            error={descriptionError !== ''}
                            helperText={descriptionError}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField label={t('bugReportDialog.email')} name='email' value={bugReport.email} onChange={handleInputChange} fullWidth helperText={t('bugReportDialog.emailHelperText')} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color='primary'>
                    {t('cancel')}
                </Button>
                <Button onClick={handleSubmit} loading={loading} variant='contained' color='primary'>
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BugReportDialog;
function setLoading(arg0: boolean) {
    throw new Error('Function not implemented.');
}
