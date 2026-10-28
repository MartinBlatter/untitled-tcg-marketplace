import { OrderCancellation } from '@/app/api/orders/types';
import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { CANCELLATION_STATUS } from '@/src/constants/status';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Alert, Box, Button, FormControl, Grid, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import React from 'react';
import * as yup from 'yup';
import { CancellationFormProps } from './types';

const CancellationForm = ({ order, userData }: CancellationFormProps) => {
    const notifications = useNotifications();
    const t = useTranslations();
    const [cancellation, setCancellation] = React.useState(order.orderCancellation);

    const validationSchema = yup.object({
        message: yup.string().required(t('errors.required')),
    });

    const requestCancellation = (orderId: number, message: string) => {
        apiRequest(ENDPOINTS.API.ORDERS.REQUEST_CANCELLATION, 'POST', { orderId: orderId, message: message }).then((res) => {
            if (res) {
                notifications.addSuccessNotification(t('checkout.doneSingleOrder.requestCancellationSuccess'));
                window.location.reload();
            } else {
                notifications.addErrorNotification(t('checkout.doneSingleOrder.requestCancellationError'));
            }
        });
    };

    const cancelCancellation = (orderId: number) => {
        apiRequest(ENDPOINTS.API.ORDERS.CANCEL_CANCELLATION, 'POST', { orderId: orderId }).then((res) => {
            if (res) {
                setCancellation(null);
                notifications.addSuccessNotification(t('checkout.doneSingleOrder.cancelCancellationSuccess'));
            } else {
                notifications.addErrorNotification(t('checkout.doneSingleOrder.cancelCancellationError'));
            }
        });
    };

    const acceptCancellation = (orderId: number) => {
        apiRequest(ENDPOINTS.API.ORDERS.ACCEPT_CANCELLATION, 'POST', { orderId: orderId }).then((res) => {
            if (res) {
                const newCancellation = { ...cancellation, status: CANCELLATION_STATUS.ACCEPTED, acceptedAt: new Date() };
                setCancellation(newCancellation as OrderCancellation);
                notifications.addSuccessNotification(t('checkout.doneSingleOrder.acceptCancellationSuccess'));
            } else {
                notifications.addErrorNotification(t('checkout.doneSingleOrder.acceptCancellationError'));
            }
        });
    };

    return (
        <Box sx={{ mt: 2 }}>
            {!cancellation ? (
                <>
                    <Typography variant='h6'>{t('checkout.doneSingleOrder.requestCancellation')}</Typography>
                    <Formik
                        initialValues={{
                            message: '',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            requestCancellation(order.id as number, values.message);
                        }}
                    >
                        {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
                            <form>
                                <Grid container spacing={1}>
                                    <Grid size={12}>
                                        <FormControl fullWidth>
                                            <TextField
                                                id='message'
                                                name='message'
                                                label={t('checkout.doneSingleOrder.requestCancellationMessage')}
                                                fullWidth
                                                multiline
                                                rows={2}
                                                variant='outlined'
                                                value={values.message}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.message && Boolean(errors.message)}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={12}>
                                        <Button sx={{ float: 'right' }} variant='outlined' disabled={!dirty || !values.message} onClick={() => requestCancellation(order.id as number, values.message)}>
                                            {t('checkout.doneSingleOrder.requestCancellation')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        )}
                    </Formik>
                </>
            ) : (
                <>
                    <Typography variant='h6' color='error'>
                        {t('checkout.doneSingleOrder.cancellationRequested')}
                    </Typography>
                    <Alert severity='error'>
                        {new Date(cancellation.createdAt as Date).toLocaleString()} - {cancellation.message}
                    </Alert>
                    {userData && cancellation.requestedByUserId === userData.id ? (
                        <>
                            {cancellation.status === CANCELLATION_STATUS.ACCEPTED ? (
                                <>
                                    <Alert severity='success'>
                                        {new Date(cancellation.acceptedAt as Date).toLocaleString()}- {t('checkout.doneSingleOrder.cancellationAccepted')}
                                    </Alert>
                                </>
                            ) : (
                                <Button sx={{ float: 'right', mt: 1 }} variant='outlined' color='error' onClick={() => acceptCancellation(order.id as number)}>
                                    {t('checkout.doneSingleOrder.acceptCancellation')}
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            {cancellation.status === CANCELLATION_STATUS.ACCEPTED ? (
                                <>
                                    <Alert severity='success'>
                                        {new Date(cancellation.acceptedAt as Date).toLocaleString()}- {t('checkout.doneSingleOrder.cancellationAccepted')}
                                    </Alert>
                                </>
                            ) : (
                                <Button sx={{ float: 'right', mt: 1 }} variant='outlined' color='error' onClick={() => cancelCancellation(order.id as number)}>
                                    {t('checkout.doneSingleOrder.cancelCancellation')}
                                </Button>
                            )}
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export default CancellationForm;
