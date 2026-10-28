import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField } from '@mui/material';
import { WishlistShareDialogProps } from './types';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useWishlistsStore } from '@/src/store/wishlists';
import { ContentCopy } from '@mui/icons-material';

export default function WishlistShareDialog({ show, setShow, shareLink }: WishlistShareDialogProps) {
    const t = useTranslations();
    const notifications = useNotifications();

    return (
        <Dialog open={show} onClose={() => setShow(false)} aria-labelledby='share-dialog-title' aria-describedby='share-dialog-title' sx={{ minWidth: '400px' }}>
            <DialogTitle id='share-dialog-title'>{t('shareDialog.share')}</DialogTitle>
            <DialogContent sx={{ minWidth: '400px' }}>
                <TextField
                    fullWidth
                    autoFocus
                    inputRef={(input) => input && input.focus()}
                    onFocus={(event) => {
                        event.target.select();
                    }}
                    id='share-link'
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton
                                        onClick={() => {
                                            navigator.clipboard.writeText(shareLink);
                                            notifications.addSuccessNotification(t('copiedToClipboard'));
                                        }}
                                    >
                                        <ContentCopy />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    value={shareLink}
                    variant='outlined'
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShow(false)}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
