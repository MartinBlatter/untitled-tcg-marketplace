'use client';

import { apiRequest } from '@/src/actions/apiRequest';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import { CheckoutSingleOrder } from '@/src/components/Checkout/CheckoutSingleOrder/CheckoutSingleOrder';
import { OrderSummary } from '@/src/components/Checkout/OrderSummary/OrderSummary';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { Alert, Box, Card, Grid, LinearProgress, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Checkout() {
    const { loading, items, refreshShoppingCartItems } = useShoppingCartStore();
    const t = useTranslations();
    const { data: session } = useSession();
    const [addressData, setAddressData] = useState<any>(null);
    const [loadingAddressData, setLoadingAddressData] = useState(true);

    useEffect(() => {
        refreshShoppingCartItems();
        refresh();
    }, [session]);

    const refresh = async () => {
        if (!session) return;
        if (!session?.user?.email) return;

        const defaultAddress = session.settings.find((setting: any) => setting.name === 'defaultAddress');

        if (!defaultAddress) {
            apiRequest(`${ENDPOINTS.API.PROFILE.GET}/${encodeURI(session?.user?.email as string)}`).then((data: any) => {
                setAddressData(data.user.address);
                setLoadingAddressData(false);
            });
        } else {
            apiRequest(ENDPOINTS.API.PROFILE.ADDRESS).then((data: any) => {
                const address = data.addresses.find((address: any) => Number(address.id) === Number(defaultAddress.value));
                setAddressData(address.address);
                setLoadingAddressData(false);
            });
        }
    };

    return (
        <>
            <BasicBreadcrumbs current={t(`checkout.title`)} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`checkout.title`)}
            </Typography>
            {loading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : items.length > 0 ? (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 9 }}>
                        {items.map((sellerItem, sellerIndex) => (
                            <CheckoutSingleOrder key={`order-${sellerIndex}`} sellerItem={sellerItem} index={sellerIndex} addressData={addressData} loadingAddressData={loadingAddressData} />
                        ))}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <OrderSummary items={items} />
                    </Grid>
                </Grid>
            ) : (
                <Card sx={{ mt: 4, p: 2 }}>
                    <Alert severity='info' variant='filled'>
                        {t(`checkout.empty`)}
                    </Alert>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Image src='/images/empty_cart_fox.png' alt='empty-cart' width={512} height={512} />
                    </Box>
                </Card>
            )}
        </>
    );
}
