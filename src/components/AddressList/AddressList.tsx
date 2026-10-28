'use client';
import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import { Avatar, Button, IconButton, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

function AddressList(addresses: any) {
    const t = useTranslations();
    const notifications = useNotifications();
    const [defaultAddress, setDefaultAddress] = useState<any>(null);
    const { data: session } = useSession();

    const deleteAddress = (id: number, index: number) => {
        if (!id) return;
        apiRequest(`${ENDPOINTS.API.PROFILE.ADDRESS}/${id}`, 'DELETE').then((data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('profile.addressDeleted'));
                addresses.addresses.splice(index, 1);
            } else {
                notifications.addErrorNotification(t('profile.addressDeleteError'));
            }
        });
    };

    const handleSetDefaultAddress = (id: number) => {
        setDefaultAddress(id);
        apiRequest(`${ENDPOINTS.API.PROFILE.SETTINGS}/defaultAddress`, 'POST', { value: id.toString() })
            .then((data: any) => {
                if (data.success) {
                    notifications.addSuccessNotification(t('profile.settings.successUpdate'));
                } else {
                    notifications.addErrorNotification(t('profile.settings.errorUpdate'));
                }
            })
            .catch((error: any) => {
                notifications.addErrorNotification(t('profile.settings.errorUpdate'));
            });
    };

    useEffect(() => {
        if (session) {
            setDefaultAddress(session.settings.find((setting: any) => setting.name === 'defaultAddress') ? session.settings.find((setting: any) => setting.name === 'defaultAddress').value : null);
        }
    }, [session]);

    return (
        <List>
            {addresses.addresses.map((address: any, index: number) => (
                <ListItem
                    key={`address-${address.id}`}
                    secondaryAction={
                        <>
                            {Number(defaultAddress) !== address.id && (
                                <Button
                                    variant='outlined'
                                    onClick={() => {
                                        handleSetDefaultAddress(address.id);
                                    }}
                                >
                                    {t('profile.setDefaultAddress')}
                                </Button>
                            )}
                            <IconButton
                                edge='end'
                                aria-label={t('profile.deleteAddress')}
                                onClick={() => {
                                    deleteAddress(address.id, index);
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </>
                    }
                    sx={
                        Number(defaultAddress) === address.id
                            ? {
                                  backgroundColor: 'primary.main',
                                  color: 'primary.contrastText',
                              }
                            : {}
                    }
                >
                    <ListItemAvatar>
                        <Avatar>
                            <HomeIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText sx={{ whiteSpace: 'pre-line' }} primary={address.address} />
                </ListItem>
            ))}
        </List>
    );
}

export default AddressList;
