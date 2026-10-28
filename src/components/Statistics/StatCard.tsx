'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StatCardProps } from './types';

export default function StatCard({ title, value, icon, sx }: StatCardProps) {
    const t = useTranslations();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1
                    }}>
                    <Typography variant='subtitle1' sx={{
                        color: 'text.secondary'
                    }}>
                        {title}
                    </Typography>
                    {icon && <Box sx={{ color: 'primary.main' }}>{icon}</Box>}
                </Box>
                <Typography variant='h4' component='div'>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}
