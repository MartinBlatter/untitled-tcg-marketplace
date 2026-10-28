import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useWishlistsStore } from '@/src/store/wishlists';
import { MoreVert } from '@mui/icons-material';
import { Avatar, Box, Card, CardActionArea, CardMedia, ClickAwayListener, Grow, IconButton, MenuItem, MenuList, Paper, Popper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';
import { stringAvatar } from '../../../utils/avatar.helper';
import WishlistRenameDialog from '../WishlistRenameDialog/WishlistRenameDialog';
import { WishlistTileProps } from './types';

const WishlistTile = ({ wishlist, count = 0 }: WishlistTileProps) => {
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const [showRenameDialog, setShowRenameDialog] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const notifications = useNotifications();
    const wishlistsStore = useWishlistsStore();
    const { refresh } = wishlistsStore;

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    function handleListKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    const handleDeleteList = () => {
        apiRequest(`${ENDPOINTS.API.WISHLISTS.DELETE}/${wishlist.id}`).then((res: any) => {
            if (res.success) {
                notifications.addSuccessNotification(t('wishlists.notifications.successDelete'));
                refresh();
            } else {
                notifications.addErrorNotification(t('wishlists.notifications.errorDelete'));
            }
        });
    };

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current!.focus();
        }

        prevOpen.current = open;
    }, [open]);

    return (
        <>
            <Card
                sx={{
                    mt: 2,
                    width: {
                        xs: '100%',
                        sm: '45%',
                        md: '30%',
                        lg: '264px',
                    },
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                }}
                component='a'
                href={`/wishlists/${wishlist.id}`}
            >
                <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                    <IconButton
                        ref={anchorRef}
                        aria-label='more'
                        id='menu-button'
                        aria-controls={open ? 'menu-button' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup='true'
                        onClick={(event) => {
                            event.preventDefault();
                            handleToggle();
                        }}
                    >
                        <MoreVert />
                    </IconButton>
                    <Popper open={open} anchorEl={anchorRef.current} role={undefined} placement='bottom-start' transition disablePortal>
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList autoFocusItem={open} id='composition-menu' aria-labelledby='composition-button' onKeyDown={handleListKeyDown}>
                                            <MenuItem
                                                key='rename'
                                                onClick={(event) => {
                                                    event?.preventDefault();
                                                    setShowRenameDialog(true);
                                                }}
                                            >
                                                {t('rename')}
                                            </MenuItem>
                                            <MenuItem
                                                key='delete'
                                                onClick={(event) => {
                                                    event?.preventDefault();
                                                    handleDeleteList();
                                                }}
                                            >
                                                {t('delete')}
                                            </MenuItem>
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </Box>
                <CardActionArea sx={{ p: 2 }}>
                    <CardMedia>
                        <Avatar {...stringAvatar(wishlist.name)} />
                    </CardMedia>
                    <Typography variant='h6'>{wishlist.name}</Typography>
                    <Typography variant='body1'>{t(`wishlists.count`, { count })}</Typography>
                    <Typography variant='body1'>{wishlist.description}</Typography>
                </CardActionArea>
            </Card>
            <WishlistRenameDialog show={showRenameDialog} setShow={setShowRenameDialog} name={wishlist.name} id={wishlist.id} />
        </>
    );
};

export default WishlistTile;
