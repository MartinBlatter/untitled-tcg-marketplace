import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ConfirmationDialogProps } from './types';

function ConfirmationDialog(props: ConfirmationDialogProps) {
    const t = useTranslations();
    const [open, setOpen] = useState(false);

    const showDialog = () => {
        setOpen(true);
    };

    const hideDialog = () => {
        setOpen(false);
    };

    const confirmRequest = () => {
        props.response();
        hideDialog();
    };

    return (
        <>
            {props.children(showDialog)}
            {open && (
                <Dialog open={open} onClose={hideDialog} aria-labelledby='confirmation-dialog-title' aria-describedby='confirmation-dialog-description'>
                    <DialogTitle id='confirmation-dialog-title'>{props.title}</DialogTitle>
                    <DialogContent sx={{ minWidth: '400px' }}>
                        <DialogContentText id='confirmation-dialog-description'>{props.description}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={confirmRequest} variant={'outlined'} color='primary' sx={{ width: '50%' }}>
                            {t('yes')}
                        </Button>
                        <Button onClick={hideDialog} variant={'outlined'} color='primary' sx={{ width: '50%' }}>
                            {t('no')}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}

export default ConfirmationDialog;
