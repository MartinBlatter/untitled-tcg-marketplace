import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useWishlistsStore } from '@/src/store/wishlists';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';
import { WishlistRenameDialogProps } from './types';

export default function WishlistRenameDialog({ show, setShow, name, id }: WishlistRenameDialogProps) {
    const t = useTranslations();
    const notifications = useNotifications();
    const [newName, setNewName] = React.useState<string>(name);
    const [loading, setLoading] = React.useState(false);
    const wishlistsStore = useWishlistsStore();
    const { refresh } = wishlistsStore;

    const handleRename = () => {
        if (newName !== name) {
            setLoading(true);
            apiRequest(ENDPOINTS.API.WISHLISTS.RENAME, 'POST', { id: id, name: newName }).then((res: any) => {
                setLoading(false);
                if (res.success) {
                    notifications.addSuccessNotification(t('wishlists.notifications.successRename'));
                    refresh();
                } else {
                    notifications.addErrorNotification(t('wishlists.notifications.errorRename'));
                }
            });
        }
        setShow(false);
    };

    return (
        <Dialog open={show} onClose={() => setShow(false)} aria-labelledby='rename-dialog-title' aria-describedby='rename-dialog-title' sx={{ minWidth: '400px' }}>
            <DialogTitle id='rename-dialog-title'>{t('renameDialog.rename')}</DialogTitle>
            <DialogContent sx={{ minWidth: '400px' }}>
                <TextField
                    fullWidth
                    autoFocus
                    inputRef={(input) => input && input.focus()}
                    onFocus={(event) => {
                        event.target.select();
                    }}
                    onChange={(event) => setNewName(event.target.value)}
                    onBlur={(event) => setNewName(event.target.value)}
                    id='name'
                    value={newName}
                    variant='outlined'
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShow(false)}>{t('close')}</Button>
                <Button variant='contained' onClick={() => handleRename()} disabled={loading}>
                    {loading && <span className='loading'></span>}
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
