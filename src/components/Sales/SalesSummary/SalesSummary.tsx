import { formatCurrency } from '@/src/utils/helpers';
import { Card } from '@mui/material';
import { useTranslations } from 'next-intl';
import { SalesSummaryProps } from '../types';

export default function SalesSummary({ title, count, sum }: SalesSummaryProps) {
    const t = useTranslations();

    return (
        <Card sx={{ mt: 2, p: 2 }}>
            <div>
                {title}: {count}
            </div>
            <div>
                {t('purchases.total')}: {formatCurrency(sum)}
            </div>
        </Card>
    );
}
