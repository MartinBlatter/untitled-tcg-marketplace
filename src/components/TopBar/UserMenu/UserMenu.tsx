'use client';

import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { AccountCircle, Apartment, Settings } from '@mui/icons-material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { Box, Button, ClickAwayListener, Divider, Grow, IconButton, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Popper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { logout } from '@/src/lib/auth/actions';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React from 'react';
import Funds from '../Funds/Funds';
import ShoppingCartMenu from '../ShoppingCart/ShoppingCart';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';

export default function UserMenu() {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const t = useTranslations();
    const { data: session, update } = useSession();
    const router = useRouter();
    const { refreshShoppingCartItems } = useShoppingCartStore();

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    const handleSignOut = async () => {
        await logout();
        await update();
        setOpen(false);
        router.push(INTERNAL_ROUTES.HOME);
    };

    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current!.focus();
        }

        prevOpen.current = open;
    }, [open]);

    React.useEffect(() => {
        if (session) {
            refreshShoppingCartItems();
        }
    }, [session]);

    return (
        <>
            <ShoppingCartMenu />
            <Funds />
            <IconButton
                size='large'
                aria-label='account of current user'
                color='inherit'
                sx={{ py: '4px' }}
                ref={anchorRef}
                id='account-menu-button'
                aria-controls={open ? 'account-menu-button' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup='true'
                onClick={(event) => {
                    event.preventDefault();
                    handleToggle();
                }}
            >
                <AccountCircle />
            </IconButton>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} placement='bottom-start' transition disablePortal>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                        }}
                    >
                        <Paper
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            sx={{
                                position: 'absolute',
                                top: '20px',
                                right: -80,
                                width: 260,
                                zIndex: 9999,
                                pb: 1,
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <Box>
                                    <Box sx={{ p: 2, pt: 2 }}>
                                        {!session && (
                                            <>
                                                <Typography variant='h6' component={'div'}>
                                                    {t('appBar.userMenu.notLoggedIn')}
                                                </Typography>
                                                <Button sx={{ mt: 1 }} variant='contained' onClick={() => router.push(INTERNAL_ROUTES.LOGIN)} fullWidth>
                                                    {t('appBar.userMenu.signin')}
                                                </Button>
                                                <Button sx={{ mt: 1 }} variant='contained' onClick={() => router.push(INTERNAL_ROUTES.REGISTER)} fullWidth>
                                                    {t('appBar.userMenu.register')}
                                                </Button>
                                            </>
                                        )}
                                        {session && (
                                            <>
                                                <Typography variant='h6'>{t('appBar.userMenu.userText', { user: session.userName || session.user?.name || '' })}</Typography>
                                                <Divider sx={{ mt: 2 }} />
                                                <List>
                                                    <ListItem key={'user-menu-profile-link'} disablePadding>
                                                        <Link underline='none' href={`/profile`} sx={{ width: '100%' }}>
                                                            <ListItemButton>
                                                                <ListItemIcon>
                                                                    <AccountBoxIcon />
                                                                </ListItemIcon>
                                                                <ListItemText primary={t(`appBar.userMenu.profile`)} />
                                                            </ListItemButton>
                                                        </Link>
                                                    </ListItem>
                                                    {session.roles?.includes('Business') && (
                                                        <ListItem key={'user-menu-businessprofile-link'} disablePadding>
                                                            <Link underline='none' href={`/profile/business`} sx={{ width: '100%' }}>
                                                                <ListItemButton>
                                                                    <ListItemIcon>
                                                                        <Apartment />
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={t(`appBar.userMenu.businessProfile`)} />
                                                                </ListItemButton>
                                                            </Link>
                                                        </ListItem>
                                                    )}
                                                    <ListItem key={'user-menu-settings-link'} disablePadding>
                                                        <Link underline='none' href={`/profile/settings`} sx={{ width: '100%' }}>
                                                            <ListItemButton>
                                                                <ListItemIcon>
                                                                    <Settings />
                                                                </ListItemIcon>
                                                                <ListItemText primary={t(`appBar.userMenu.settings`)} />
                                                            </ListItemButton>
                                                        </Link>
                                                    </ListItem>
                                                </List>
                                                <Divider />
                                                <Button sx={{ mt: 3 }} variant='contained' onClick={handleSignOut} fullWidth>
                                                    {t('appBar.userMenu.signout')}
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <ThemeSwitcher />
                                </Box>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}
