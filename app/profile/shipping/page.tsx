'use client';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import ShippingRatesTableCustom from '@/src/components/Shipping/ShippingRatesTableCustom/ShippingRatesTableCustom';
import ShippingRatesTableDefault from '@/src/components/Shipping/ShippingRatesTableDefault/ShippingRatesTableDefault';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useShippingStore } from '@/src/store/shipping';
import { InfoOutlined } from '@mui/icons-material';
import { FormControlLabel, Grid, LinearProgress, Switch, Tooltip, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function Shipping() {
    const t = useTranslations();
    const { data: session } = useSession();
    const { loading, refresh, insuredShippingMandatory, setInsuredShippingMandatory, usesCustom, setUsesCustom } = useShippingStore();

    React.useEffect(() => {
        if (!session) return;
        refresh(session.user?.email as string);
    }, [session]);

    return (
        <>
            <BasicBreadcrumbs current={t(`shipping.title`)} previous={[{ text: t(`profile.title`), url: INTERNAL_ROUTES.PROFILE.ROOT }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`shipping.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <Grid container spacing={4} style={{ marginTop: '20px', justifyContent: 'center' }}>
                    <Grid size={12}>
                        <FormControlLabel
                            sx={{ display: 'block' }}
                            control={<Switch checked={insuredShippingMandatory} onChange={(e) => setInsuredShippingMandatory(e.target.checked)} />}
                            label={t(`shipping.insuredShippingMandatory`)}
                        />
                        <FormControlLabel
                            sx={{ display: 'block' }}
                            control={<Switch checked={usesCustom} onChange={(e) => setUsesCustom(e.target.checked)} />}
                            label={
                                <>
                                    {t(`shipping.useCustom`)}
                                    <Tooltip title={t(`shipping.useCustomTooltip`)}>
                                        <InfoOutlined sx={{ ml: 1, mb: -1 }} />
                                    </Tooltip>
                                </>
                            }
                        />
                    </Grid>
                    <Grid size={6}>
                        <ShippingRatesTableDefault />
                    </Grid>
                    <Grid size={6}>
                        <ShippingRatesTableCustom />
                    </Grid>
                </Grid>
            )}
        </>
    );
}
