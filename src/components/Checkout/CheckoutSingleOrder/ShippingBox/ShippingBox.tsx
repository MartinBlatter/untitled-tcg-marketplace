import { ShippingData } from '@/app/api/shipping/[id]/types';
import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { SHIPPING_PACKAGING_COST } from '@/src/constants/shipping';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { formatCurrency } from '@/src/utils/helpers';
import { LocalShipping } from '@mui/icons-material';
import { Box, Button, FormControl, MenuItem, Select, Typography, useTheme } from '@mui/material';
import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import * as yup from 'yup';
import { ShippingBoxProps } from '../types';

const shippingStringMap: { [key: string]: string } = {};
const renderShippingOptions = (shippingData: ShippingData[], requiresTracking: boolean) => {
    if (!requiresTracking) {
        let items: any[] = [];
        shippingData.map((item: ShippingData) => {
            let weight = `${item.weight}g`;
            if (item.weight && item.weight >= 1000) {
                weight = `${(item.weight / 1000).toFixed(1)}kg`;
            }
            if (item.type === 'letter') {
                shippingStringMap[`${item.price?.toFixed(2)}`] = `${item.type} max. ${weight} - ${formatCurrency(item.price ?? 0)}`;
                shippingStringMap[`${((item.price ?? 0) + (item.tracking ?? 0)).toFixed(2)}`] = `${item.type} max. ${weight} + tracking - ${formatCurrency(
                    (item.price ?? 0) + (item.tracking ?? 0)
                )} €`;

                items.push(
                    <MenuItem key={`${item.type}-${weight}`} value={item.price?.toFixed(2)}>
                        {item.type} max. {weight} - {formatCurrency(item.price ?? 0)}
                    </MenuItem>
                );
                items.push(
                    <MenuItem key={`${item.type}-${weight}-tracking`} value={((item.price ?? 0) + (item.tracking ?? 0)).toFixed(2)}>
                        {item.type} max. {weight} + tracking - {formatCurrency((item.price ?? 0) + (item.tracking ?? 0))}
                    </MenuItem>
                );
            } else {
                shippingStringMap[`${item.price?.toFixed(2)}`] = `${item.type} max. ${weight} - ${formatCurrency(item.price ?? 0)}`;
                items.push(
                    <MenuItem key={`${item.type}-${weight}`} value={item.price?.toFixed(2)}>
                        {item.type} max. {weight} - {formatCurrency(item.price ?? 0)}
                    </MenuItem>
                );
            }
        });
        return items;
    } else {
        let items: any[] = [];
        shippingData.map((item: ShippingData) => {
            let weight = `${item.weight}g`;
            if (item.weight && item.weight >= 1000) {
                weight = `${(item.weight / 1000).toFixed(1)}kg`;
            }
            if (item.type === 'letter') {
                shippingStringMap[`${((item.price ?? 0) + (item.tracking ?? 0)).toFixed(2)}`] = `${item.type} max. ${weight} + tracking - ${((item.price ?? 0) + (item.tracking ?? 0)).toFixed(2)} €`;
                items.push(
                    <MenuItem key={`${item.type}-${weight}-tracking`} value={((item.price ?? 0) + (item.tracking ?? 0)).toFixed(2)}>
                        {item.type} max. {weight} + tracking - {((item.price ?? 0) + (item.tracking ?? 0)).toFixed(2)} €
                    </MenuItem>
                );
            } else {
                shippingStringMap[`${item.price?.toFixed(2)}`] = `${item.type} max. ${weight} - ${item.price?.toFixed(2)} €`;
                items.push(
                    <MenuItem key={`${item.type}-${weight}`} value={item.price?.toFixed(2)}>
                        {item.type} max. {weight} - {item.price?.toFixed(2)} €
                    </MenuItem>
                );
            }
        });
        return items;
    }
};

export const ShippingBox = ({ shippingData, requiresTracking, initialPrice, cartId, sellerId }: ShippingBoxProps) => {
    const t = useTranslations();
    const theme = useTheme();
    const isDarkTheme = theme.palette.mode === 'dark';
    const notification = useNotifications();
    const { refreshShoppingCartItems } = useShoppingCartStore();

    const validationSchema = yup.object({
        price: yup.string().required(t('errors.required')),
    });

    const handleSubmitShipping = (price: number) => {
        const displayName = shippingStringMap[price.toFixed(2)];
        apiRequest(ENDPOINTS.API.SHOPPINGCART.UPDATE_SHIPPING, 'POST', {
            cartId: cartId,
            sellerId: sellerId,
            displayName: displayName,
            price: (price + SHIPPING_PACKAGING_COST / 100).toFixed(2),
        }).then((data: any) => {
            if (data.success) {
                notification.addSuccessNotification(t('checkout.singleOrder.shippingChanged'));
                refreshShoppingCartItems();
            } else {
                notification.addErrorNotification(t('checkout.singleOrder.shippingChangeFailed'));
            }
        });
    };

    return (
        <Box sx={{ minHeight: 195, p: 2, backgroundColor: isDarkTheme ? theme.palette.background.default : theme.palette.primary.main, borderRadius: 1 }}>
            <Typography variant='h6' sx={{ mb: 1 }}>
                <LocalShipping sx={{ mr: 1, mb: -0.5 }} />
                {t('checkout.singleOrder.shipping')}
            </Typography>
            <Formik
                initialValues={{
                    price: (Number(initialPrice) - SHIPPING_PACKAGING_COST / 100).toFixed(2),
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    handleSubmitShipping(Number(values.price));
                }}
            >
                {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
                    <form>
                        <FormControl fullWidth>
                            <Select id='price' name='price' value={values.price} onChange={handleChange} onBlur={handleBlur} fullWidth error={touched.price && Boolean(errors.price)}>
                                {renderShippingOptions(shippingData, requiresTracking)}
                            </Select>
                        </FormControl>
                        <Button onClick={() => handleSubmitShipping(Number(values.price))} fullWidth variant='outlined' color='inherit' size='small' sx={{ mt: 1 }}>
                            {t('checkout.singleOrder.changeShipping')}
                        </Button>
                    </form>
                )}
            </Formik>
            <Typography variant='body2' sx={{ mt: 1 }}>
                {t('checkout.singleOrder.packaging', { packagingCost: (SHIPPING_PACKAGING_COST / 100).toFixed(2) })}
            </Typography>
        </Box>
    );
};
