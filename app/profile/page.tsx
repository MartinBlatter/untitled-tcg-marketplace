'use client';

import { apiRequest } from '@/src/actions/apiRequest';
import AddressList from '@/src/components/AddressList/AddressList';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import { countriesEnum } from '@/src/constants/countries';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { Alert, Button, Card, CircularProgress, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React, { useRef, useState } from 'react';
import * as yup from 'yup';
import { UserProfileData } from './types';

export default function Profile() {
    const t = useTranslations();
    const [data, setData] = useState<UserProfileData>();
    const [addressData, setAddressData] = useState<any>([]);
    const [isLoading, setLoading] = useState(true);
    const [isAddressLoading, setAddressLoading] = useState(true);
    const [userNameExists, setUserNameExists] = useState();
    const { data: session, update } = useSession();
    const notifications = useNotifications();
    const timer = useRef(setTimeout(() => null, 0));

    React.useEffect(() => {
        if (!session) return;
        refresh();
    }, [session]);

    const refresh = async () => {
        setLoading(true);
        if (!session) return;
        if (!session?.user?.email) return;

        apiRequest(`${ENDPOINTS.API.PROFILE.GET}/${encodeURI(session?.user?.email as string)}`).then((data: any) => {
            setData(data.user as UserProfileData);
            setLoading(false);
        });

        apiRequest(ENDPOINTS.API.PROFILE.ADDRESS).then((data: any) => {
            setAddressData(data.addresses);
            setAddressLoading(false);
        });
    };

    const updateProfile = async (user: UserProfileData, setSubmitting: (isSubmitting: boolean) => void) => {
        const firstSet = (session as any)?.userName ? false : true;
        const data = { ...user, firstSet: firstSet };

        apiRequest(ENDPOINTS.API.PROFILE.UPDATE, 'POST', data).then(async (data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('profile.successUpdate'));
                // Claiming a userName re-issues the session cookie server-side;
                // pull it in so the onboarding redirect stops firing.
                if (firstSet) await update();
                refresh();
            } else {
                notifications.addErrorNotification(t('profile.errorUpdate'));
            }
            setSubmitting(false);
        });
    };

    const checkUsername = async (username: string) => {
        if (!username) return;
        if (username.length < 3) return;

        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            apiRequest(ENDPOINTS.API.PROFILE.CHECK_USERNAME, 'POST', { userName: username }).then((data: any) => {
                setUserNameExists(data.exists);
            });
        }, 500);
    };

    const addAddress = async (address: string, setSubmitting: (isSubmitting: boolean) => void) => {
        if (!address) return;

        apiRequest(ENDPOINTS.API.PROFILE.ADDRESS, 'POST', { address }).then((data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('profile.successUpdate'));
                refresh();
            } else {
                notifications.addErrorNotification(t('profile.errorUpdate'));
            }
            setSubmitting(false);
        });
    };

    const validationSchema = yup.object({
        firstName: yup.string().required(t('errors.required')),
        lastName: yup.string().required(t('errors.required')),
        userName: yup
            .string()
            .required(t('errors.required'))
            .min(3, t('profile.form.userNameLengthError'))
            .test('username-exists', t('profile.form.userNameExistsError'), (value) => {
                if ((session as any)?.userName) return true;
                checkUsername(value);
                return !Boolean(userNameExists);
            }),
        address: yup.string().required(t('errors.required')),
        country: yup.string().required(t('errors.required')),
    });

    return (
        <>
            <BasicBreadcrumbs current={t(`profile.title`)} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`profile.title`)}
            </Typography>
            {isLoading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    <Card sx={{ marginTop: '20px', paddingX: 2, paddingY: 4 }}>
                        {!(session as any)?.userName && (
                            <Alert severity='info' sx={{ marginBottom: 4 }}>
                                {t('profile.profileHint')}
                            </Alert>
                        )}
                        <Formik
                            initialValues={{
                                firstName: data?.firstName || '',
                                lastName: data?.lastName || '',
                                userName: data?.userName || '',
                                company: data?.company || '',
                                address: data?.address || '',
                                eMail: session?.user?.email as string,
                                country: data?.country || '',
                            }}
                            validationSchema={validationSchema}
                            onSubmit={(values, { setSubmitting }) => {
                                updateProfile(values as UserProfileData, setSubmitting);
                            }}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='userName'
                                                label={t('profile.form.userName')}
                                                variant='outlined'
                                                value={values.userName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                disabled={(session as any)?.userName ? true : false}
                                                error={touched.userName && Boolean(errors.userName)}
                                                helperText={(touched.userName && errors.userName) || t('errors.required')}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField id='eMail' label={t('profile.form.email')} variant='outlined' value={values.eMail} disabled fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                id='firstName'
                                                label={t('profile.form.firstName')}
                                                variant='outlined'
                                                value={values.firstName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.firstName && Boolean(errors.firstName)}
                                                helperText={(touched.firstName && errors.firstName) || t('errors.required')}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                id='lastName'
                                                label={t('profile.form.lastName')}
                                                variant='outlined'
                                                value={values.lastName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.lastName && Boolean(errors.lastName)}
                                                helperText={(touched.lastName && errors.lastName) || t('errors.required')}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='company'
                                                label={t('profile.form.company')}
                                                variant='outlined'
                                                value={values.company}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.company && Boolean(errors.company)}
                                                helperText={touched.company && errors.company}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <FormControl fullWidth>
                                                <InputLabel id='country-label'>{t('profile.form.country')}</InputLabel>
                                                <Select
                                                    labelId='country-label'
                                                    id='country'
                                                    name='country'
                                                    value={values.country}
                                                    label={t('profile.form.country')}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                >
                                                    {countriesEnum.map((country) => (
                                                        <MenuItem key={country} value={country}>
                                                            {t(`countries.${country}`)}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='address'
                                                label={t('profile.form.address')}
                                                variant='outlined'
                                                value={values.address}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.address && Boolean(errors.address)}
                                                helperText={(touched.address && errors.address) || t('errors.required')}
                                                fullWidth
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button type='submit' disabled={isSubmitting || userNameExists} variant='contained'>
                                                {isSubmitting && <CircularProgress size={12} sx={{ mr: 1 }} />}
                                                {t('profile.form.save')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        </Formik>
                    </Card>
                    <Typography variant='h4' sx={{ textAlign: 'center', mt: 4 }}>
                        {t(`profile.additionalShippingAddress`)}
                    </Typography>
                    <Typography variant='subtitle1' sx={{ textAlign: 'center', mt: 2 }}>
                        {t(`profile.additionalShippingAddressDescription`)}
                    </Typography>
                    <Card sx={{ marginTop: '20px', paddingX: 2, paddingY: 4 }}>
                        <Formik
                            initialValues={{
                                newShippingAddress: '',
                            }}
                            onSubmit={(values, { setSubmitting }) => {
                                addAddress(values.newShippingAddress, setSubmitting);
                            }}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 10 }}>
                                            <TextField
                                                id='newShippingAddress'
                                                label={t('profile.form.address')}
                                                variant='outlined'
                                                name='newShippingAddress'
                                                value={values.newShippingAddress}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                fullWidth
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 2 }}>
                                            <Button fullWidth type='submit' disabled={isSubmitting} variant='contained'>
                                                {isSubmitting && <CircularProgress size={12} sx={{ mr: 1 }} />}
                                                {t('profile.form.add')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        </Formik>
                        {isAddressLoading ? <LinearProgress sx={{ mt: 4 }} /> : <AddressList addresses={addressData} />}
                    </Card>
                </>
            )}
        </>
    );
}
