import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { Button, ButtonGroup, Link } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PurchaseNavBarProps } from '../types';

export default function PurchaseNavBar({ selectedIndex }: PurchaseNavBarProps) {
    const t = useTranslations();

    return (
        <ButtonGroup variant='outlined' aria-label='Basic button group' sx={{ mt: 2, width: '100%' }}>
            <Link href={INTERNAL_ROUTES.PURCHASES.UNPAID} style={{ textDecoration: 'none', color: 'inherit', width: 'calc(100% / 6)' }}>
                <Button variant={selectedIndex === 0 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`purchases.navbar.unpaid`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.PURCHASES.PAID} style={{ textDecoration: 'none', color: 'inherit', width: 'calc(100% / 6)' }}>
                <Button variant={selectedIndex === 1 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`purchases.navbar.paid`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.PURCHASES.SHIPPED} style={{ textDecoration: 'none', color: 'inherit', width: 'calc(100% / 6)' }}>
                <Button variant={selectedIndex === 2 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`purchases.navbar.shipped`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.PURCHASES.DELIVERED} style={{ textDecoration: 'none', color: 'inherit', width: 'calc(100% / 6)' }}>
                <Button variant={selectedIndex === 3 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`purchases.navbar.delivered`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.PURCHASES.CANCELLED} style={{ textDecoration: 'none', color: 'inherit', width: 'calc(100% / 6)' }}>
                <Button variant={selectedIndex === 4 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`purchases.navbar.cancelled`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.PURCHASES.NOT_ARRIVED} style={{ textDecoration: 'none', color: 'inherit', width: 'calc(100% / 6)' }}>
                <Button variant={selectedIndex === 5 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`purchases.navbar.notArrived`)}
                </Button>
            </Link>
        </ButtonGroup>
    );
}
