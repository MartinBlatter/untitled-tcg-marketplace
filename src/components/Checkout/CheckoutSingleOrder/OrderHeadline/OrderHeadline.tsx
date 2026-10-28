import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { Box, Link } from '@mui/material';
import { useTranslations } from 'next-intl';
import { OrderHeadlineProps } from '../types';

export const OrderHeadline = ({ userName, country }: OrderHeadlineProps) => {
    const t = useTranslations();

    return (
        <Box sx={{ ml: 1, display: 'inline-block' }}>
            -
            <Link href={INTERNAL_ROUTES.USER.PROFILE(userName)} sx={{ color: 'inherit' }} underline='hover'>
                <Box
                    component='img'
                    sx={{
                        height: 16,
                        mr: 1,
                        ml: 1,
                    }}
                    alt={t(`localeStrings.${country.toLowerCase()}`)}
                    src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${country.toLowerCase()}.gif`}
                />
                {userName}
            </Link>
        </Box>
    );
};
