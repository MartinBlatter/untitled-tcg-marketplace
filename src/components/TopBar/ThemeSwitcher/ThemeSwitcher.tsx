'use client';
import { FormControlLabel, Switch, useMediaQuery } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { getUserTheme, setUserTheme } from './themeCookie';

export default function ThemeSwitcher() {
    const [checked, setChecked] = React.useState(false);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const t = useTranslations();

    useEffect(() => {
        getUserTheme().then((theme) => {
            if (theme === undefined) {
                theme = prefersDarkMode ? 'dark' : 'light';
                setUserTheme(theme);
            }
            if (theme === 'dark') {
                setChecked(true);
            } else {
                setChecked(false);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setChecked(true);
            setUserTheme('dark');
        } else {
            setChecked(false);
            setUserTheme('light');
        }
    };

    return <FormControlLabel checked={checked} control={<Switch onChange={handleChange} />} label={t('appBar.userMenu.darkmode')} sx={{ ml: 1 }} />;
}
