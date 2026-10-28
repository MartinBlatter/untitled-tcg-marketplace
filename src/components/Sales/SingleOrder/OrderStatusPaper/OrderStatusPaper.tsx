import { ORDER_STATUS } from '@/src/constants/status';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { OrderStatusPaperProps } from '../../types';

export const OrderStatusPaper = ({ status, arrivedAt, cancelledAt, onRelistItems }: OrderStatusPaperProps) => {
    const t = useTranslations();

    return (
        <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant='body1'>
                    {t('sales.saleStatus')}: {t(`checkout.doneSingleOrder.orderStatuses.${status}`)}
                </Typography>

                {status === ORDER_STATUS.DELIVERED && <Typography variant='body1'>{arrivedAt ? new Date(arrivedAt).toLocaleDateString() : ''}</Typography>}

                {(status === ORDER_STATUS.CANCELLED_BY_ADMIN || status === ORDER_STATUS.CANCELLED_BY_BUYER || status === ORDER_STATUS.CANCELLED_BY_SELLER) && (
                    <>
                        <Typography variant='body1'>{cancelledAt ? new Date(cancelledAt).toLocaleDateString() : ''}</Typography>
                        {onRelistItems?.()}
                    </>
                )}
            </Box>
        </Paper>
    );
};
