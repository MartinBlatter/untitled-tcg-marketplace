'use client';

import { BottomNavigation, BottomNavigationAction, Box, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import BugReportDialog from './BugReportDialog/BugReportDialog';
import SupportTicketDialog from './SupportTicketDialog/SupportTicketDialog';

export default function Footer() {
    const t = useTranslations();
    const { status } = useSession();
    const isLoggedIn = status === 'authenticated';
    const [openBugDialog, setOpenBugDialog] = React.useState(false);
    const [openSupportDialog, setOpenSupportDialog] = React.useState(false);
    const router = useRouter();

    const handleHelpCenterClick = () => {
        router.push('/help-center');
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
                boxShadow: '0px 0px 5px 1px #BABABA',
                zIndex: 1000,
            }}
        >
            <BottomNavigation showLabels>
                {isLoggedIn && <BottomNavigationAction label={t('footer.nav.support')} onClick={() => setOpenSupportDialog(true)} />}
                <BottomNavigationAction label={t('footer.nav.helpCenter')} onClick={handleHelpCenterClick} />
                <BottomNavigationAction label={t('footer.nav.termsAndConditions')} />
                <BottomNavigationAction label={t('footer.nav.aboutUs ')} />
                <BottomNavigationAction label={t('footer.nav.dataPolicy')} />
                <BottomNavigationAction label={t('footer.nav.bugReport')} onClick={() => setOpenBugDialog(true)} />
            </BottomNavigation>
            <Typography
                variant='button'
                sx={{
                    position: 'absolute',
                    display: 'inline',
                    pr: 2,
                    right: 2,
                    bottom: 14,
                    color: 'text.secondary',
                }}
            >
                &copy; {new Date().getFullYear()}
            </Typography>
            <BugReportDialog open={openBugDialog} setOpen={setOpenBugDialog} />
            <SupportTicketDialog open={openSupportDialog} setOpen={setOpenSupportDialog} />
        </Box>
    );
}
