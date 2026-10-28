'use client';

import { Alert, Button, Card, Grid, Link, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { register } from '@/src/lib/auth/actions';
import { PASSWORD_MIN_LENGTH, registerSchema } from '@/src/lib/auth/schemas';
import { useSession } from '@/src/lib/context/AuthProvider';

export default function Register() {
    const t = useTranslations();
    const router = useRouter();
    const { update } = useSession();
    const [error, setError] = useState<string | null>(null);

    return (
        <>
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center', mt: 4 }}>
                {t('auth.register.title')}
            </Typography>
            <Card sx={{ marginTop: '20px', paddingX: 2, paddingY: 4, maxWidth: 480, mx: 'auto' }}>
                {error && (
                    <Alert severity='error' sx={{ marginBottom: 3 }}>
                        {t(error)}
                    </Alert>
                )}
                <Formik
                    initialValues={{ email: '', password: '', confirmPassword: '' }}
                    validationSchema={registerSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        setError(null);
                        const result = await register(values);

                        if (!result.success) {
                            setError(result.error);
                            setSubmitting(false);
                            return;
                        }

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
                                        autoComplete='new-password'
                                        label={t('appBar.userMenu.password')}
                                        variant='outlined'
                                        fullWidth
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={
                                            touched.password && errors.password
                                                ? t(errors.password, { min: PASSWORD_MIN_LENGTH })
                                                : t('auth.register.passwordHint', { min: PASSWORD_MIN_LENGTH })
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        id='confirmPassword'
                                        name='confirmPassword'
                                        type='password'
                                        autoComplete='new-password'
                                        label={t('auth.register.confirmPassword')}
                                        variant='outlined'
                                        fullWidth
                                        value={values.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                        helperText={
                                            touched.confirmPassword && errors.confirmPassword
                                                ? t(errors.confirmPassword)
                                                : ' '
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}>
                                        {t('appBar.userMenu.register')}
                                    </Button>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant='body2' sx={{ textAlign: 'center' }}>
                                        {t('auth.register.haveAccount')}{' '}
                                        <Link href={INTERNAL_ROUTES.LOGIN}>{t('appBar.userMenu.signin')}</Link>
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
