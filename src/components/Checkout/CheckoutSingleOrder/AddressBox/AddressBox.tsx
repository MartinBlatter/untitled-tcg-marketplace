import { Apartment, ContentCopy } from '@mui/icons-material';
import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { AddressBoxProps } from '../types';

export const AddressBox = ({ addressData, minHeight, country }: AddressBoxProps) => {
    const t = useTranslations();
    const theme = useTheme();
    const isDarkTheme = theme.palette.mode === 'dark';

    return (
        <Box sx={{ minHeight: minHeight || 195, p: 2, backgroundColor: isDarkTheme ? theme.palette.background.default : theme.palette.primary.main, borderRadius: 1 }}>
            <Typography variant='h6' sx={{ mb: 1 }}>
                <Apartment sx={{ mr: 1, mb: -0.5 }} />
                {t('checkout.singleOrder.address')}
                <Tooltip title={t('copy')}>
                    <ContentCopy sx={{ ml: 1, mb: -0.5, cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(addressData)} />
                </Tooltip>
            </Typography>
            <Typography variant='body1' sx={{ whiteSpace: 'pre-line' }}>
                {addressData}
            </Typography>
            <Typography variant='body1'>{country}</Typography>
        </Box>
    );
};
