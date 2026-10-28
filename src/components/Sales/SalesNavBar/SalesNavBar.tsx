import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { ShoppingCart } from '@mui/icons-material';
import { Button, ButtonGroup, Link, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { SalesNavBarProps } from '../types';
export default function SalesNavBar({ selectedIndex }: SalesNavBarProps) {
    const t = useTranslations();

    return (
        <ButtonGroup variant='outlined' aria-label='Basic button group' sx={{ mt: 2, width: '100%' }}>
            <Link href={INTERNAL_ROUTES.SALES.IN_CART} style={{ textDecoration: 'none', color: 'inherit', width: '5%' }}>
                <Button variant={selectedIndex === 0 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    <Tooltip title={t(`sales.navbar.inCart`)}>
                        <ShoppingCart />
                    </Tooltip>
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.SALES.UNPAID} style={{ textDecoration: 'none', color: 'inherit', width: '12.5%' }}>
                <Button variant={selectedIndex === 1 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`sales.navbar.unpaid`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.SALES.PAID} style={{ textDecoration: 'none', color: 'inherit', width: '12.5%' }}>
                <Button variant={selectedIndex === 2 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`sales.navbar.paid`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.SALES.PACKED} style={{ textDecoration: 'none', color: 'inherit', width: '12.5%' }}>
                <Button variant={selectedIndex === 3 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`sales.navbar.packed`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.SALES.SHIPPED} style={{ textDecoration: 'none', color: 'inherit', width: '12.5%' }}>
                <Button variant={selectedIndex === 4 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`sales.navbar.shipped`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.SALES.DELIVERED} style={{ textDecoration: 'none', color: 'inherit', width: '12.5%' }}>
                <Button variant={selectedIndex === 5 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`sales.navbar.delivered`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.SALES.CANCELLED} style={{ textDecoration: 'none', color: 'inherit', width: '12.5%' }}>
                <Button variant={selectedIndex === 6 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`sales.navbar.cancelled`)}
                </Button>
            </Link>
            <Link href={INTERNAL_ROUTES.SALES.NOT_ARRIVED} style={{ textDecoration: 'none', color: 'inherit', width: '20%' }}>
                <Button variant={selectedIndex === 7 ? 'contained' : 'outlined'} sx={{ width: '100%' }}>
                    {t(`sales.navbar.notArrived`)}
                </Button>
            </Link>
        </ButtonGroup>
    );
}
