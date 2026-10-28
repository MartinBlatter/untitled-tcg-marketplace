import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useTranslations } from 'next-intl';
import React from 'react';
import * as yup from 'yup';
import { Dialog, DialogTitle, DialogContent, Grid, DialogActions, Button, CircularProgress, FormControl, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useWishlistsStore } from '@/src/store/wishlists';

const SingleCardListWishlistDialog = ({ show, setShow, wishlistId }: { show: boolean; setShow: (state: boolean) => void; wishlistId: number }) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(false);
    const { addItemsList, refresh } = useWishlistsStore();

    const handleClose = () => {
        setShow(false);
    };

    const submitItemsAdd = (values: any) => {
        setLoading(true);
        addItemsList(wishlistId, values.list).then((res: any) => {
            if (res.success) {
                if (res.addedItems.length > 0) {
                    notifications.addSuccessNotification(
                        t('wishlists.notifications.successAddSingleCardList', {
                            addedItems: res.addedItems.join(', '),
                        })
                    );
                    if (res.notAddedItems.length > 0) {
                        notifications.addErrorNotification(t('wishlists.notifications.errorAddSingleCardListNotFound', { notAddedItems: res.notAddedItems.join(', ') }));
                    }
                    refresh();
                    setLoading(false);
                    handleClose();
                } else {
                    notifications.addErrorNotification(t('wishlists.notifications.errorAddSingleCardListNotFound', { notAddedItems: res.notAddedItems.join(', ') }));
                    setLoading(false);
                }
            } else {
                notifications.addErrorNotification(t('wishlists.notifications.errorAddSingleCardList'));
                setLoading(false);
            }
        });
    };

    const validationSchema = yup.object().shape({
        list: yup.string().required(),
    });

    return (
        <Dialog open={show} onClose={handleClose}>
            <DialogTitle>{t('wishlists.singleCardMassDialog.title')}</DialogTitle>
            <Formik
                initialValues={{
                    list: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    submitItemsAdd(values);
                }}
            >
                {({ values, errors, touched, dirty, handleChange, handleBlur, setFieldValue }) => (
                    <form>
                        <DialogContent>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant='body1'>{t('wishlists.singleCardMassDialog.description')}</Typography>
                                    <ul>
                                        <li>1 A Tale for the Ages (WOE) 34</li>
                                        <li>All That Glitters (CMM)</li>
                                        <li>Angelic Gift</li>
                                    </ul>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type='text'
                                            name='list'
                                            label={t('wishlists.singleCardMassDialog.cards')}
                                            value={values.list}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.list && Boolean(errors.list)}
                                            helperText={touched.list && errors.list}
                                            multiline
                                            rows={6}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>{t('cancel')}</Button>
                            <Button variant='contained' disabled={loading} onClick={() => submitItemsAdd(values)}>
                                {loading ? <CircularProgress size={12} sx={{ marginRight: 1 }} /> : ''} {t('save')}
                            </Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

export default SingleCardListWishlistDialog;
