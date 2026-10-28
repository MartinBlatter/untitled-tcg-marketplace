import { SHIPPING_STATUS } from '@/src/constants/status';
import { Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ShippingStatusPaperProps } from '../types';

export const ShippingStatusPaper = ({ status, shippedAt }: ShippingStatusPaperProps) => {
    const t = useTranslations();

    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
    };

    if (!status) return null;

    return (
        <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant='body1' sx={{ textAlign: 'center' }}>
                {t('checkout.doneSingleOrder.shippingStatus')}: {t(`checkout.doneSingleOrder.shippingStatuses.${status}`)}
            </Typography>
            {(status === SHIPPING_STATUS.SHIPPED || status === SHIPPING_STATUS.DELIVERED) && shippedAt && (
                <Typography variant='body1' sx={{ textAlign: 'center' }}>
                    {formatDate(shippedAt)}
                </Typography>
            )}
        </Paper>
    );
};

export default ShippingStatusPaper;
