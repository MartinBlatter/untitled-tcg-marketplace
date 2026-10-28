import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { buildProductLink, formatCurrency } from '@/src/utils/helpers';
import { Cancel, ShoppingCart } from '@mui/icons-material';
import { Box, Button, CircularProgress, ClickAwayListener, Divider, Grow, IconButton, Link, List, ListItem, ListItemText, Paper, Popper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function ShoppingCartMenu() {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const t = useTranslations();
    const { removing, getShoppingCartPrice, items, removeShoppingCartItem } = useShoppingCartStore();
    const shoppingCartPrice = getShoppingCartPrice();

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current!.focus();
        }

        prevOpen.current = open;
    }, [open]);

    return (
        <>
            <IconButton
                size='large'
                aria-label='link to shopping cart'
                color='inherit'
                ref={anchorRef}
                id='shopping-cart-button'
                aria-controls={open ? 'shopping-cart-button' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup='true'
                onClick={(event) => {
                    event.preventDefault();
                    handleToggle();
                }}
                sx={{ py: '4px' }}
            >
                <Box sx={{ display: 'grid', alignItems: 'center' }}>
                    <ShoppingCart sx={{ margin: '0 auto' }} />
                    <Typography variant='body2' component={'div'} sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(shoppingCartPrice)}
                    </Typography>
                </Box>
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
                            sx={{
                                position: 'absolute',
                                top: 10,
                                right: -70,
                                width: 260,
                                zIndex: 9999,
                                pb: 1,
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <List dense>
                                    {items.length === 0 && (
                                        <Typography variant='body2' component={'div'} sx={{ pt: 2, textAlign: 'center' }}>
                                            {t('appBar.userMenu.shoppingCartempty')}
                                        </Typography>
                                    )}
                                    {items.map((sellerItems, sellerIndex) => (
                                        <React.Fragment key={`seller-${sellerIndex}`}>
                                            <ListItem>
                                                <ListItemText>
                                                    {t('appBar.userMenu.shoppingCart.seller')}{' '}
                                                    <Link href={INTERNAL_ROUTES.USER.PROFILE(sellerItems[0].sellerName as string)}>{sellerItems[0].sellerName}</Link>
                                                </ListItemText>
                                            </ListItem>
                                            <List dense component={'div'} disablePadding>
                                                {sellerItems.map((item, itemIndex) => (
                                                    <React.Fragment key={`item-${itemIndex}`}>
                                                        <ListItem
                                                            secondaryAction={
                                                                <>
                                                                    {item.game !== 'shipping' ? (
                                                                        removing ? (
                                                                            <CircularProgress size={20} disableShrink />
                                                                        ) : (
                                                                            <IconButton edge='end' aria-label='delete'>
                                                                                <Cancel onClick={() => removeShoppingCartItem(item.id as number)} />
                                                                            </IconButton>
                                                                        )
                                                                    ) : null}
                                                                </>
                                                            }
                                                        >
                                                            <ListItemText secondary={`${item.quantity} x ${formatCurrency(item.price as unknown as number)}`}>
                                                                {item.game === 'shipping' ? (
                                                                    t('appBar.userMenu.shoppingCart.shipping')
                                                                ) : (
                                                                    <Link
                                                                        href={buildProductLink(
                                                                            'magic',
                                                                            item.card?.setCode as string,
                                                                            item.type as string,
                                                                            item.displayName as string,
                                                                            item.card?.uuid as string
                                                                        )}
                                                                    >
                                                                        {item.displayName}
                                                                    </Link>
                                                                )}
                                                            </ListItemText>
                                                        </ListItem>
                                                        <Divider component={'li'} />
                                                    </React.Fragment>
                                                ))}
                                                <ListItem>
                                                    <ListItemText
                                                        primary={
                                                            t('appBar.userMenu.shoppingCart.total') + formatCurrency(sellerItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0))
                                                        }
                                                        sx={{ textAlign: 'right' }}
                                                    />
                                                </ListItem>
                                            </List>
                                        </React.Fragment>
                                    ))}
                                    {items.length !== 0 && (
                                        <ListItem>
                                            <Link href='/checkout' sx={{ width: '100%' }}>
                                                <Button variant='contained' color='primary' fullWidth>
                                                    {t('appBar.userMenu.shoppingCart.checkout')}
                                                </Button>
                                            </Link>
                                        </ListItem>
                                    )}
                                </List>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}
