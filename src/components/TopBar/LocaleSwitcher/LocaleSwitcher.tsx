'use client';

import { locales } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import { Box, Button, ClickAwayListener, Grow, Paper, Popper } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';

export default function LocaleSwitcher() {
    const currentLocale = useLocale();
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

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
        <Box sx={{ float: 'right', pr: '20px' }}>
            <Button
                id='locale-menu-button'
                variant='text'
                key='current-locale'
                onClick={() => handleToggle()}
                sx={{ width: 20 }}
                ref={anchorRef}
                aria-controls={open ? 'locale-menu-button' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup='true'
            >
                <Box
                    component='img'
                    sx={{
                        height: 20,
                        mt: '8px',
                    }}
                    alt={t(`localeStrings.${currentLocale}`)}
                    src={`/images/flags/${currentLocale}.gif`}
                />
            </Button>
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
                                top: 20,
                                right: -83,
                                pt: '5px',
                                zIndex: 9999,
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <Box>
                                    {locales.map((locale) => (
                                        <Button variant='text' key={locale} onClick={() => setUserLocale(locale).then(() => handleToggle())} sx={{ width: 100, display: 'block', pl: 0, pr: 0 }}>
                                            <Box
                                                component='img'
                                                sx={{
                                                    height: 20,
                                                    pl: '8px',
                                                    pr: '8px',
                                                }}
                                                alt={t(`localeStrings.${locale}`)}
                                                src={`/images/flags/${locale}.gif`}
                                            />
                                            <div>{t(`localeStrings.${locale}`)}</div>
                                        </Button>
                                    ))}
                                </Box>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    );
}
