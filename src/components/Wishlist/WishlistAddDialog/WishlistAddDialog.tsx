import { useTranslations } from 'next-intl';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, FormControl, TextField } from '@mui/material';
import { WishlistAddDialogProps } from './types';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useWishlistsStore } from '@/src/store/wishlists';

const WishlistAddDialog = ({ show, setShow }: WishlistAddDialogProps) => {
    const t = useTranslations();
    const { add, refresh } = useWishlistsStore();
    const notifications = useNotifications();

    const handleClose = () => {
        setShow(false);
    };

    const submitWishlistAdd = (values: any) => {
        add(values.name, values.description).then((res: any) => {
            setShow(false);
            if (res.success) {
                notifications.addSuccessNotification(t('wishlists.notifications.successAdd'));
            } else {
                notifications.addErrorNotification(t('wishlists.notifications.errorAdd'));
            }
            refresh();
        });
    };

    const validationSchema = yup.object({
        name: yup.string().required(t('errors.required')),
    });

    return (
        <Dialog open={show} onClose={handleClose}>
            <Formik
                initialValues={{
                    name: '',
                    description: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    submitWishlistAdd(values);
                }}
            >
                {({ values, errors, touched, dirty, handleChange, handleBlur, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <DialogTitle>{t('wishlists.addDialog.title')}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={4} sx={{
                                marginTop: 1
                            }}>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            name='name'
                                            label={t('wishlists.addDialog.name')}
                                            value={values.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.name && Boolean(errors.name)}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            name='description'
                                            label={t('wishlists.addDialog.description')}
                                            value={values.description}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.description && Boolean(errors.description)}
                                            multiline
                                            rows={4}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>{t('wishlists.addDialog.cancel')}</Button>
                            <Button variant='contained' type='submit'>
                                {t('wishlists.addDialog.create')}
                            </Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

export default WishlistAddDialog;
