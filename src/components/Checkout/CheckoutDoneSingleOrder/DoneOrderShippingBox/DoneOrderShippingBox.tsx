import { SHIPPING_PACKAGING_COST } from '@/src/constants/shipping';
import { formatCurrency } from '@/src/utils/helpers';
import { LocalShipping, LocationOn } from '@mui/icons-material';
import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { DoneOrderShippingBoxProps } from '../types';

export const DoneOrderShippingBox = ({ orderShipping }: DoneOrderShippingBoxProps) => {
    const t = useTranslations();
    const theme = useTheme();
    const isDarkTheme = theme.palette.mode === 'dark';

    const shippingStringParts = orderShipping?.displayName?.split(' - ');
    const hasTracking = orderShipping?.tracking === 1;

    return (
        <Box sx={{ minHeight: 225, p: 2, backgroundColor: isDarkTheme ? theme.palette.background.default : theme.palette.primary.main, borderRadius: 1 }}>
            <Typography variant='h6' sx={{ mb: 1 }}>
                <LocalShipping sx={{ mr: 1, mb: -0.5 }} />
                {t('checkout.singleOrder.shipping')}
                {hasTracking && (
                    <Tooltip title={orderShipping?.trackingNumber ? `${t('sales.trackingNumber.number')}: ${orderShipping.trackingNumber}` : t('sales.trackingNumber.notAvailableYet')}>
                        <LocationOn sx={{ ml: 1, mb: -0.5 }} color='success' />
                    </Tooltip>
                )}
            </Typography>
            {orderShipping && (
                <>
                    <Typography variant='body1' sx={{ whiteSpace: 'pre-line' }}>
                        {shippingStringParts && shippingStringParts.length > 0 && t(`shippingRange.${shippingStringParts[0]}`)}
                        {shippingStringParts && shippingStringParts.length > 1 && ` - ${t(`shippingType.${shippingStringParts[1].replaceAll(' ', '_')}`)}`}
                        {shippingStringParts &&
                            shippingStringParts.length > 2 &&
                            ` - ${formatCurrency(Number(shippingStringParts[2].substring(0, shippingStringParts[2].length - 1)) - SHIPPING_PACKAGING_COST / 100)}`}
                    </Typography>

                    {/* Display tracking number when available */}
                    {hasTracking && orderShipping.trackingNumber && (
                        <Typography variant='body2' sx={{ mt: 2, fontWeight: 'medium' }}>
                            {t('sales.trackingNumber.number')}: {orderShipping.trackingNumber}
                        </Typography>
                    )}

                    {/* Show a note when tracking is enabled but no tracking number is set */}
                    {hasTracking && !orderShipping.trackingNumber && (
                        <Typography variant='body2' sx={{ mt: 2, fontStyle: 'italic', color: theme.palette.text.secondary }}>
                            {t('sales.trackingNumber.notAvailableYet')}
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
};
