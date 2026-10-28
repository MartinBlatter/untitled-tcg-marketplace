import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { formatCurrency } from '@/src/utils/helpers';
import { Savings } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import React from 'react';

export default function Funds() {
    const { data: session } = useSession();
    const { funds, refreshFunds } = useShoppingCartStore();

    React.useEffect(() => {
        if (session) {
            refreshFunds();
        }
    }, [session]);

    return (
        <IconButton size='large' aria-label='link fnds' aria-controls='menu-appbar' aria-haspopup='false' color='inherit' sx={{ py: '4px' }}>
            <Box sx={{ display: 'grid', alignItems: 'center' }}>
                <Savings sx={{ margin: '0 auto' }} />
                <Typography variant='body2' component={'div'} sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(funds)}
                </Typography>
            </Box>
        </IconButton>
    );
}
