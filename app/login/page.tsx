'use client';

import { Alert, Button, Card, Grid, Link, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { login } from '@/src/lib/auth/actions';
import { loginSchema } from '@/src/lib/auth/schemas';
import { useSession } from '@/src/lib/context/AuthProvider';

export default function Login() {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { update } = useSession();
    const [error, setError] = useState<string | null>(null);

    const next = searchParams?.get('next') ?? undefined;

    return (
        <>
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center', mt: 4 }}>
                {t('auth.login.title')}
            </Typography>
            <Card sx={{ marginTop: '20px', paddingX: 2, paddingY: 4, maxWidth: 480, mx: 'auto' }}>
                {error && (
                    <Alert severity='error' sx={{ marginBottom: 3 }}>
                        {t(error)}
                    </Alert>
                )}
                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={loginSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        setError(null);
                        const result = await login({ ...values, next });

                        if (!result.success) {
                            setError(result.error);
                            setSubmitting(false);
                            return;
                        }

                        // Pull the fresh session (and its settings) before
                        // navigating, so the destination renders signed in.
                        await update();
                        router.push(result.redirectTo);
                    }}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        id='email'
                                        name='email'
                                        type='email'
                                        autoComplete='email'
                                        label={t('appBar.userMenu.email')}
                                        variant='outlined'
                                        fullWidth
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email ? t(errors.email) : ' '}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        id='password'
                                        name='password'
                                        type='password'
                                        autoComplete='current-password'
                                        label={t('appBar.userMenu.password')}
                                        variant='outlined'
                                        fullWidth
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={touched.password && errors.password ? t(errors.password) : ' '}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}>
                                        {t('appBar.userMenu.signin')}
                                    </Button>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant='body2' sx={{ textAlign: 'center' }}>
                                        {t('auth.login.noAccount')}{' '}
                                        <Link href={INTERNAL_ROUTES.REGISTER}>{t('appBar.userMenu.register')}</Link>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </Formik>
            </Card>
        </>
    );
}
