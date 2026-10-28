'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import SelectiveOrdersDialog from '@/src/components/PickingList/SelectiveOrdersDialog/SelectiveOrdersDialog';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { usePickingListStore } from '@/src/store/pickinglists';
import { Add, Checklist, Delete } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, Grid, LinearProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PickingListsPage() {
    const t = useTranslations();
    const router = useRouter();
    const notifications = useNotifications();
    const { lists, loading, refresh, createFromPaidOrders, deleteList } = usePickingListStore();
    const [showSelectiveDialog, setShowSelectiveDialog] = useState(false);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleCreateFromPaidOrders = async () => {
        try {
            const result = await createFromPaidOrders();
            if (result.success) {
                notifications.addSuccessNotification(t('pickinglists.createSuccess'));
            } else {
                notifications.addErrorNotification(result.message || t('pickinglists.createError'));
            }
        } catch (error) {
            notifications.addErrorNotification(t('pickinglists.createError'));
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const result = await deleteList(id);
            if (result.success) {
                notifications.addSuccessNotification(t('pickinglists.deleteSuccess'));
            } else {
                notifications.addErrorNotification(result.message || t('pickinglists.deleteError'));
            }
        } catch (error) {
            notifications.addErrorNotification(t('pickinglists.deleteError'));
        }
    };

    const handleStartPicking = (listId: number) => {
        router.push(`/picking-lists/${listId}`);
    };

    const handleOpenSelectiveDialog = () => {
        setShowSelectiveDialog(true);
    };

    const handleCloseSelectiveDialog = () => {
        setShowSelectiveDialog(false);
    };

    return (
        <>
            <BasicBreadcrumbs current={t(`pickinglists.title`)} />
            <Typography variant='h4' component='h1' sx={{ textAlign: 'center' }}>
                {t('pickinglists.title')}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mb: 2 }}>
                <Button variant='contained' color='primary' startIcon={<Add />} onClick={handleCreateFromPaidOrders}>
                    {t('pickinglists.create')}
                </Button>
                <Button variant='outlined' color='primary' startIcon={<Add />} sx={{ ml: 2 }} onClick={handleOpenSelectiveDialog}>
                    {t('pickinglists.createSelective')}
                </Button>
            </Box>

            {loading && <LinearProgress sx={{ mt: 5 }} />}

            {!loading && lists.length === 0 && (
                <Card sx={{ mt: 4, p: 2 }}>
                    <Typography sx={{ textAlign: 'center' }}>{t('pickinglists.noLists')}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Image src='/images/picking_lists_placeholder.png' alt='no lists' height={512} width={512} />
                    </Box>
                </Card>
            )}

            <Grid container spacing={3}>
                {lists.map((list) => (
                    <Grid key={list.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant='h6' component='div'>
                                    {list.name}
                                </Typography>
                                <Typography sx={{
                                    color: 'text.secondary'
                                }}>{new Date(list.createdAt ?? '').toLocaleDateString()}</Typography>
                                <Typography sx={{
                                    color: 'text.secondary'
                                }}>
                                    {list.items.length} {t('pickinglists.items')}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between' }}>
                                <Button variant='outlined' startIcon={<Checklist />} onClick={() => handleStartPicking(list.id)}>
                                    {t('pickinglists.view')}
                                </Button>
                                <Button variant='outlined' startIcon={<Delete />} color='error' onClick={() => handleDelete(list.id)}>
                                    {t('pickinglists.delete')}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <SelectiveOrdersDialog open={showSelectiveDialog} onClose={handleCloseSelectiveDialog} />
        </>
    );
}
