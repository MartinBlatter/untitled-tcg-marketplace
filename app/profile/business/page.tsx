'use client';

import { apiRequest } from '@/src/actions/apiRequest';
import { uploadProfileFileAction } from '@/src/actions/user';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import VisuallyHiddenInput from '@/src/components/VisuallyHiddenInput/VisuallyHiddenInput';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Alert, Button, Card, CardContent, CircularProgress, Grid, LinearProgress, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react';
import { BusinessProfileData } from './types';

export default function Profile() {
    const t = useTranslations();
    const notifications = useNotifications();
    const [data, setData] = useState<BusinessProfileData>({
        id: 0,
        name: '',
        email: '',
        description: '',
        UstId: '',
        presale: false,
        avatar: '',
        banner: '',
        taxNumber: '',
        country: '',
        imprint: '',
        terms: '',
        privacy: '',
        revocation: '',
        createdAt: '',
        updatedAt: '',
    });
    const { data: session } = useSession();
    const [isLoading, setLoading] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);

    React.useEffect(() => {
        if (!session) return;
        refresh();
    }, [session]);

    if (!session || !session.roles || !session.roles.includes('Business')) return null;

    const refresh = async () => {
        setLoading(true);
        apiRequest(ENDPOINTS.API.PROFILE.BUSINESS).then((data: any) => {
            setData(data.business as BusinessProfileData);
            setLoading(false);
        });
    };

    const updateBusinessProfile = async (values: BusinessProfileData) => {
        setSubmitting(true);
        apiRequest(ENDPOINTS.API.PROFILE.BUSINESS, 'POST', { values }).then((data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('profile.successUpdate'));
            } else {
                notifications.addErrorNotification(t('profile.errorUpdate'));
            }
            setSubmitting(false);
        });
    };

    const uploadAvatar = async (file: any) => {
        uploadProfileFileAction(file, 'avatar').then((data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('profile.successUpdate'));
                refresh();
            } else {
                notifications.addErrorNotification(t('profile.errorUpdate'));
            }
        });
    };

    const uploadBanner = async (file: any) => {
        uploadProfileFileAction(file, 'banner').then((data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('profile.successUpdate'));
                refresh();
            } else {
                notifications.addErrorNotification(t('profile.errorUpdate'));
            }
        });
    };

    return (
        <>
            <BasicBreadcrumbs current={t(`profile.business.title`)} previous={[{ text: t(`profile.title`), url: INTERNAL_ROUTES.PROFILE.ROOT }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`profile.business.title`)}
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
                                name: data.name ? data.name : '',
                                description: data.description ? data.description : '',
                                imprint: data.imprint ? data.imprint : '',
                                terms: data.terms ? data.terms : '',
                                privacy: data.privacy ? data.privacy : '',
                                revocation: data.revocation ? data.revocation : '',
                            }}
                            validationSchema={null}
                            onSubmit={(values, { setSubmitting }) => {
                                updateBusinessProfile(values as BusinessProfileData);
                            }}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField id='name' label={t('profile.business.form.name')} variant='outlined' value={values.name} onChange={handleChange} onBlur={handleBlur} fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='description'
                                                label={t('profile.business.form.description')}
                                                variant='outlined'
                                                value={values.description}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                fullWidth
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField label={t('profile.business.form.country')} variant='outlined' value={data.country} disabled fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField label={t('profile.business.form.ustId')} variant='outlined' value={data.UstId} disabled fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField label={t('profile.business.form.taxNumber')} variant='outlined' value={data.taxNumber} disabled fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField label={t('profile.business.form.presale')} variant='outlined' value={data.presale ? t('yes') : t('no')} disabled fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='imprint'
                                                label={t('profile.business.form.imprint')}
                                                variant='outlined'
                                                value={values.imprint}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                fullWidth
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='terms'
                                                label={t('profile.business.form.terms')}
                                                variant='outlined'
                                                value={values.terms}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                fullWidth
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='privacy'
                                                label={t('profile.business.form.privacy')}
                                                variant='outlined'
                                                value={values.privacy}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                fullWidth
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='revocation'
                                                label={t('profile.business.form.revocation')}
                                                variant='outlined'
                                                value={values.revocation}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                fullWidth
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button type='submit' disabled={isSubmitting} variant='contained'>
                                                {isSubmitting && <CircularProgress size={12} sx={{ mr: 1 }} />}
                                                {t('profile.form.save')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        </Formik>
                    </Card>
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant='h5'>{t('profile.business.form.avatar')}</Typography>
                                    {data.avatar && (
                                        <div>
                                            <Image src={data.avatar} alt='avatar' width={150} height={150} style={{ width: 'auto', height: 'auto' }} />
                                        </div>
                                    )}
                                    <Button component='label' role={undefined} variant='outlined' tabIndex={-1}>
                                        <CloudUploadIcon color={'action'} sx={{ mr: 1 }} />
                                        {t('upload')}
                                        <form>
                                            <VisuallyHiddenInput
                                                type='file'
                                                accept='image/png, image/gif, image/jpeg'
                                                onChange={(event) => {
                                                    event.target.files && uploadAvatar(event.target.files[0]);
                                                }}
                                            />
                                        </form>
                                    </Button>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant='h5'>{t('profile.business.form.banner')}</Typography>
                                    {data.banner && (
                                        <div>
                                            <Image src={data.banner} alt='banner' width={400} height={0} style={{ width: '100%', height: 'auto' }} />
                                        </div>
                                    )}
                                    <Button component='label' role={undefined} variant='outlined' tabIndex={-1}>
                                        <CloudUploadIcon color={'action'} sx={{ mr: 1 }} />
                                        {t('upload')}
                                        <form>
                                            <VisuallyHiddenInput
                                                type='file'
                                                accept='image/png, image/gif, image/jpeg'
                                                onChange={(event) => {
                                                    event.target.files && uploadBanner(event.target.files[0]);
                                                }}
                                            />
                                        </form>
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </>
            )}
        </>
    );
}
