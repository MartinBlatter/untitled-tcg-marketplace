'use client';

import { apiRequest } from '@/src/actions/apiRequest';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { defaultUserSettings } from '@/src/constants/userSettings';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { magicSetCodeToNameMapping } from '@/src/lib/mappings/magicSetCodeToNameMapping';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    InputLabel,
    LinearProgress,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Typography,
} from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

export default function ProfileSettings() {
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [userSettings, setUserSettings] = useState<any>([]);
    const notifications = useNotifications();
    const { data: session } = useSession();

    const handleChange = (event: any) => {
        const name = event.target.name;
        const value = !Array.isArray(event.target.value) ? event.target.value : event.target.value.join(',');
        const setting = userSettings.find((setting: any) => setting.name === name);
        apiRequest(`${ENDPOINTS.API.PROFILE.SETTINGS}/${name}`, 'POST', { value: value })
            .then((data: any) => {
                if (data.success) {
                    notifications.addSuccessNotification(t('profile.settings.successUpdate'));
                } else {
                    notifications.addErrorNotification(t('profile.settings.errorUpdate'));
                }
            })
            .catch((error: any) => {
                notifications.addErrorNotification(t('profile.settings.errorUpdate'));
            });
        if (!setting) {
            setUserSettings([...userSettings, { name: name, value: value }]);
            return;
        }
        setting.value = value;
        setUserSettings([...userSettings]);
    };

    React.useEffect(() => {
        if (!session) return;
        setUserSettings(session.settings);
        setLoading(false);
    }, [session]);

    return (
        <>
            <BasicBreadcrumbs current={t(`profile.settings.title`)} previous={[{ text: t(`profile.title`), url: INTERNAL_ROUTES.PROFILE.ROOT }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`profile.settings.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <Grid container spacing={4} style={{ marginTop: '20px' }}>
                    {defaultUserSettings.map((category: any) => (
                        <Grid size={{ xs: 12, md: 6 }} key={category.category}>
                            <Accordion defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${category.category}-content`} id={`${category.category}-header`}>
                                    <Typography variant='h6'>{t(`profile.settings.${category.category}`)}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        {category.items.map((setting: any) => {
                                            if (setting.type === 'radio') {
                                                return (
                                                    <Grid key={setting.name} size={{ xs: 12, sm: 6 }}>
                                                        <FormControl>
                                                            <FormLabel id={`${setting.name}-label`}>{t(`profile.settings.${setting.name}`)}</FormLabel>
                                                            <RadioGroup
                                                                aria-labelledby={setting.name}
                                                                defaultValue={setting.default}
                                                                name={setting.name}
                                                                onChange={handleChange}
                                                                value={(userSettings && userSettings.find((userSetting: any) => userSetting.name === setting.name)?.value) || setting.default}
                                                            >
                                                                {setting.options.map((option: any) => (
                                                                    <FormControlLabel key={option} value={option} control={<Radio />} label={t(`profile.settings.${option}`)} />
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                    </Grid>
                                                );
                                            }
                                            if (setting.type === 'select' || setting.type === 'multi') {
                                                if (!setting.options.includes('')) {
                                                    setting.options.push('');
                                                }
                                                return (
                                                    <Grid key={setting.name} size={{ xs: 12 }}>
                                                        <FormControl size='small' fullWidth>
                                                            <InputLabel id={`${setting.name}-label`}>{t(`profile.settings.${setting.name}`)}</InputLabel>
                                                            <Select
                                                                multiple={setting.type === 'multi'}
                                                                labelId={`${setting.name}-label`}
                                                                id={setting.name}
                                                                label={t(`profile.settings.${setting.name}`)}
                                                                name={setting.name}
                                                                onChange={handleChange}
                                                                value={
                                                                    (userSettings &&
                                                                        Array.isArray(userSettings.find((userSetting: any) => userSetting.name === setting.name)?.value) &&
                                                                        userSettings.find((userSetting: any) => userSetting.name === setting.name)?.value) ||
                                                                    (userSettings &&
                                                                        !Array.isArray(userSettings.find((userSetting: any) => userSetting.name === setting.name)?.value) &&
                                                                        userSettings.find((userSetting: any) => userSetting.name === setting.name)?.value.split(',')) ||
                                                                    setting.default
                                                                }
                                                            >
                                                                {setting.options.map((option: string) =>
                                                                    option === '' ? (
                                                                        <MenuItem key={option} value={option}>
                                                                            {t(`profile.settings.any`)} / {t(`profile.settings.default`)}
                                                                        </MenuItem>
                                                                    ) : (
                                                                        <MenuItem key={option} value={option}>
                                                                            {setting.keySource && setting.keySource === 'magicSetCodeToNameMapping'
                                                                                ? magicSetCodeToNameMapping[option as keyof typeof magicSetCodeToNameMapping]
                                                                                : setting.additionalTranslationNs
                                                                                ? t(`${setting.additionalTranslationNs}.${option}`)
                                                                                : t(`profile.settings.${option}`)}
                                                                        </MenuItem>
                                                                    )
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                );
                                            }
                                        })}
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    ))}
                </Grid>
            )}
        </>
    );
}
