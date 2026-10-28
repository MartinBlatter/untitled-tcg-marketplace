import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { BasicBreadcrumbsProps } from './types';

export default function BasicBreadcrumbs({ current, previous = [] }: BasicBreadcrumbsProps) {
    return (
        <div role='presentation'>
            <Breadcrumbs aria-label='breadcrumb' sx={{ mb: '5px' }}>
                <Link key='breadcrumb-home' underline='hover' color='inherit' href={INTERNAL_ROUTES.HOME}>
                    DM
                </Link>
                {previous.map((item) => (
                    <Link key={`breadcrumb-${item.text}`} underline='hover' color='inherit' href={item.url}>
                        {item.text}
                    </Link>
                ))}
                <Typography sx={{ color: 'text.primary' }}>{current}</Typography>
            </Breadcrumbs>
        </div>
    );
}
