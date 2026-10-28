import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import { BuylistTileProps } from './types';

const BuylistTile: React.FC<BuylistTileProps> = ({ buylist }) => {
    const t = useTranslations();
    const router = useRouter();

    const handleClick = () => {
        router.push(INTERNAL_ROUTES.BUYLIST.BY_ID(buylist.id));
    };

    // Calculate the number of items in the buylist
    const itemCount = buylist.items?.length || 0;

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea onClick={handleClick} sx={{ flexGrow: 1 }}>
                <CardContent>
                    <Typography variant='h5' component='div' gutterBottom>
                        {buylist.name}
                    </Typography>
                    <Typography
                        variant='body2'
                        sx={{
                            color: 'text.secondary',
                            mb: 2
                        }}>
                        {buylist.description || t('buylist.noDescription')}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip icon={<FormatListBulletedIcon />} label={t('buylist.itemCount', { count: itemCount })} color={itemCount > 0 ? 'primary' : 'default'} size='small' />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box>
                            <Chip
                                icon={buylist.isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                label={buylist.isPublic ? t('buylist.public') : t('buylist.private')}
                                color={buylist.isPublic ? 'success' : 'default'}
                                size='small'
                                sx={{ mr: 1 }}
                            />
                        </Box>
                        <Typography variant='caption' sx={{
                            color: 'text.secondary'
                        }}>
                            {new Date(buylist.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default BuylistTile;
