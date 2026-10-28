import { ORDER_TYPES } from '@/src/constants/orders';
import { Person } from '@mui/icons-material';
import { Box, Link, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { DoneOrderSellerBoxProps } from '../types';

export const DoneOrderSellerBox = ({ userData, businessData, type }: DoneOrderSellerBoxProps) => {
    const t = useTranslations();
    const theme = useTheme();
    const isDarkTheme = theme.palette.mode === 'dark';

    return (
        <Box sx={{ minHeight: 225, p: 2, backgroundColor: isDarkTheme ? theme.palette.background.default : theme.palette.primary.main, borderRadius: 1 }}>
            <Typography variant='h6' sx={{ mb: 1 }}>
                <Person sx={{ mr: 1, mb: -0.5 }} />
                {type === ORDER_TYPES.PURCHASE ? t('checkout.singleOrder.seller') : t('checkout.singleOrder.buyer')}
            </Typography>
            <Link href={`/user/${userData.userName}`} sx={{ color: 'inherit' }} underline='hover'>
                <Box
                    component='img'
                    sx={{
                        height: 16,
                        mr: 1,
                    }}
                    alt={t(`localeStrings.${userData.country.toLowerCase()}`)}
                    src={`/images/flags/${userData.country.toLowerCase()}.gif`}
                />
                {userData.userName}
            </Link>
            <Typography variant='body1'>
                {userData.firstName} {userData.lastName}
            </Typography>
            <Typography variant='body1'>{businessData && businessData.name ? `${t('profile.type.business')}: ${businessData.name}` : t('profile.type.private')}</Typography>
            <Typography variant='body1' sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                {businessData && businessData.address ? `${businessData.address}` : `${userData.address}`}
            </Typography>
        </Box>
    );
};
