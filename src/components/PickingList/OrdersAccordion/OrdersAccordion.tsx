import { DoneOrderShippingBox } from '@/src/components/Checkout/CheckoutDoneSingleOrder/DoneOrderShippingBox/DoneOrderShippingBox';
import { AddressBox } from '@/src/components/Checkout/CheckoutSingleOrder/AddressBox/AddressBox';
import { PICKING_LIST_ITEM_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import { PickingListItem } from '@/src/store/types';
import { ExpandMore, LocalShipping, MarkEmailRead } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Grid, Tooltip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface OrdersAccordionProps {
    groupedOrders: Record<number, PickingListItem[]>;
    statusLoading: number | null;
    changedStatuses: { [orderId: number]: string };
    handleStatusChange: (orderId: number, status: string, action: string) => void;
}

export default function OrdersAccordion({ groupedOrders, statusLoading, changedStatuses, handleStatusChange }: OrdersAccordionProps) {
    const t = useTranslations();

    return (
        <div style={{ marginTop: 20 }}>
            {Object.entries(groupedOrders).map(([orderId, items]) => (
                <Accordion key={orderId}>
                    <AccordionSummary expandIcon={<ExpandMore />} sx={{ '& .MuiAccordionSummary-content': { display: 'flex', alignItems: 'center', gap: 2 } }}>
                        <Typography sx={{ flex: 1 }}>
                            {t('pickinglists.order')} {orderId} ({items.length} {t('pickinglists.items')})
                        </Typography>

                        {/* Show "Packed" button or checkmark icon based on status */}
                        {items[0].order?.shippingStatus !== SHIPPING_STATUS.PENDING || changedStatuses[Number(orderId)] === SHIPPING_STATUS.PACKED ? (
                            <Tooltip title={t('pickinglists.alreadyPacked')}>
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mr: 2 }}>
                                    <MarkEmailRead />
                                </Box>
                            </Tooltip>
                        ) : (
                            <Button
                                variant='contained'
                                color='primary'
                                size='small'
                                disabled={statusLoading === Number(orderId) || changedStatuses[Number(orderId)] === SHIPPING_STATUS.SHIPPED}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(Number(orderId), SHIPPING_STATUS.PACKED, 'setPacked');
                                }}
                                loading={statusLoading === Number(orderId)}
                                endIcon={<MarkEmailRead />}
                            >
                                {t('pickinglists.setPacked')}
                            </Button>
                        )}

                        {/* Show "Shipped" button or shipped icon based on status */}
                        {(items[0].order?.shippingStatus !== SHIPPING_STATUS.PENDING && items[0].order?.shippingStatus !== SHIPPING_STATUS.PACKED) ||
                        changedStatuses[Number(orderId)] === SHIPPING_STATUS.SHIPPED ? (
                            <Tooltip title={t('pickinglists.alreadyShipped')}>
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mr: 2 }}>
                                    <LocalShipping />
                                </Box>
                            </Tooltip>
                        ) : (
                            <Button
                                variant='contained'
                                sx={{ mr: 2 }}
                                color='success'
                                size='small'
                                disabled={statusLoading === Number(orderId)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(Number(orderId), SHIPPING_STATUS.SHIPPED, 'setShipped');
                                }}
                                loading={statusLoading === Number(orderId)}
                                endIcon={<LocalShipping />}
                            >
                                {t('pickinglists.setShipped')}
                            </Button>
                        )}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}></Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <AddressBox minHeight={225} addressData={items[0].orderAddress?.address ?? ''} country={items[0].buyer?.country ?? ''} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <DoneOrderShippingBox orderShipping={items[0].orderShipping ?? null} />
                            </Grid>
                        </Grid>
                        <Card sx={{ mt: 2, p: 2 }} variant='outlined'>
                            {items.map((item) => (
                                <div key={item.id}>
                                    {item.orderItem?.originalItem?.quantity || 1}x {item.card?.name}
                                    {item.status === PICKING_LIST_ITEM_STATUS.PROBLEM && (
                                        <Typography color='error' component='span' sx={{ ml: 1 }}>
                                            ({t('pickinglists.problem')}: {item.problem})
                                        </Typography>
                                    )}
                                </div>
                            ))}
                        </Card>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
}
