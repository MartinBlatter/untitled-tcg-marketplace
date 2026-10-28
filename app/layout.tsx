import CookieConsentBanner from '@/src/components/CookieConsentBanner/CookieConsentBanner';
import Footer from '@/src/components/Footer/Footer';
import ProfileRedirect from '@/src/components/ProfileRedirect/ProfileRedirect';
import SideNav from '@/src/components/SideNav/SideNav';
import ToastNotifications from '@/src/components/ToastNotifications/ToastNotifications';
import LocaleSwitcher from '@/src/components/TopBar/LocaleSwitcher/LocaleSwitcher';
import SearchField from '@/src/components/TopBar/SearchField/SearchField';
import { getUserTheme } from '@/src/components/TopBar/ThemeSwitcher/themeCookie';
import UserMenu from '@/src/components/TopBar/UserMenu/UserMenu';
import ClientProviders from '@/src/lib/context';
import ClientLocalizationProvider from '@/src/lib/context/DatePickerProvider';
import { AuthProvider } from '@/src/lib/context/AuthProvider';
import { getServerSession } from '@/src/lib/auth/session';
import { darkTheme, lightTheme } from '@/src/theme/theme';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AppBar, Box, Container, CssBaseline, Grid, Link, Toolbar } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Roboto } from 'next/font/google';
import React from 'react';
import './globals.css';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
});

export const metadata: Metadata = {
    title: 'Dibbimarket',
    description: 'Welcome',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();
    const theme = await getUserTheme();
    const session = await getServerSession();

    return (
        <html lang={locale}>
            <head>
                <link rel='preconnect' href='https://fonts.googleapis.com' />
                <link rel='preconnect' href='https://fonts.gstatic.com' />
                <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' />
            </head>
            <body className={`${roboto.variable} ${theme}`}>
                <AuthProvider initialSession={session}>
                    <ClientProviders>
                        <ClientLocalizationProvider>
                            <NextIntlClientProvider locale={locale}>
                                <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                                    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme} disableTransitionOnChange>
                                        <CssBaseline />
                                        <ProfileRedirect />
                                        <Box component={'main'} style={{ marginBottom: '80px' }}>
                                            <Box sx={{ width: '100%' }}>
                                                <AppBar
                                                    position='sticky'
                                                    sx={{
                                                        backgroundColor: 'primary.main',
                                                        color: 'primary.contrastText',
                                                    }}
                                                >
                                                    <Toolbar>
                                                        <Grid
                                                            container
                                                            sx={{
                                                                justifyContent: 'start',
                                                                alignItems: 'center',
                                                                width: '100%'
                                                            }}>
                                                            <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3 }}>
                                                                <SideNav />
                                                                <Link href='/' underline='none' variant='h6' sx={{ color: 'primary.contrastText' }}>
                                                                    {(messages.navigation as any)['home']}
                                                                </Link>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 12, md: 5, lg: 6 }}>
                                                                <SearchField />
                                                            </Grid>
                                                        </Grid>
                                                        <Box sx={{ position: 'absolute', right: '12px', top: '10px' }}>
                                                            <UserMenu />
                                                            <LocaleSwitcher />
                                                        </Box>
                                                    </Toolbar>
                                                </AppBar>
                                                <Container sx={{ paddingTop: '20px' }}>{children}</Container>
                                            </Box>
                                        </Box>
                                        <Footer />
                                        <ToastNotifications />
                                        <CookieConsentBanner />
                                    </ThemeProvider>
                                </AppRouterCacheProvider>
                            </NextIntlClientProvider>
                        </ClientLocalizationProvider>
                    </ClientProviders>
                </AuthProvider>
            </body>
        </html>
    );
}
