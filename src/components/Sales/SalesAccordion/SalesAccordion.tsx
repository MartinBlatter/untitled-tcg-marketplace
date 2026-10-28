import { formatCurrency } from '@/src/utils/helpers';
import { ExpandMore, LocationOn, Warning } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';
import { SalesSingleOrder } from '../SingleOrder/SingleOrder';
import { SalesAccordionProps } from '../types';

export default function SalesAccordion({ sale, loading, expanded, handleChange, refresh }: SalesAccordionProps) {
    const t = useTranslations();

    return (
        <Accordion key={`${sale.id}`} expanded={expanded} onChange={handleChange(Number(sale.id))}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`sale-${sale.id}-content`} id={`sale-${sale.id}-header`}>
                <Grid container spacing={2} sx={{ width: '100%', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <Grid size={3}>
                        {t(`sales.sale`)} {sale.id}
                        {sale.orderCancellation && <Warning color='error' sx={{ ml: 1, mb: -0.5 }} fontSize='small' />}
                        {sale.orderShipping?.tracking === 1 && <LocationOn sx={{ ml: 1, mb: -0.5 }} color='success' fontSize='small' />}
                    </Grid>
                    <Grid size={2} sx={{ textAlign: 'center' }}>
                        {sale.orderItems.length - 1} {t('sales.inCart.item')}
                    </Grid>
                    <Grid size={1} sx={{ textAlign: 'center' }}>
                        {formatCurrency(Number(sale.totalPrice))}
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'center', pr: 2 }}>
                        {t(`games.${sale.game}`)}
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'right', pr: 2 }}>
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleString() : ''}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <SalesSingleOrder key={sale.id} order={sale} expanded={expanded} refresh={refresh} />
            </AccordionDetails>
        </Accordion>
    );
}
