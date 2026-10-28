import { OrderItem } from '@/app/api/orders/types';
import { apiRequest } from '@/src/actions/apiRequest';
import ConfirmationDialog from '@/src/components/ConfirmationDialog/ConfirmationDialog';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { ORDER_TYPES } from '@/src/constants/orders';
import { ORDER_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useSalesStore } from '@/src/store/sales';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { buildProductLink, formatCurrency } from '@/src/utils/helpers';
import { Box, Button, Card, Grid, Link, Skeleton, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender, useGridApiRef } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import React from 'react';
import ReactDOM from 'react-dom';
import CancellationForm from '../../CancellationForm/CancellationForm';
import { DoneOrderSellerBox } from '../../Checkout/CheckoutDoneSingleOrder/DoneOrderSellerBox/DoneOrderSellerBox';
import { DoneOrderShippingBox } from '../../Checkout/CheckoutDoneSingleOrder/DoneOrderShippingBox/DoneOrderShippingBox';
import { AddressBox } from '../../Checkout/CheckoutSingleOrder/AddressBox/AddressBox';
import { SalesSingleOrderProps } from '../types';
import { OrderStatusPaper } from './OrderStatusPaper/OrderStatusPaper';
import { PaymentStatusPaper } from './PaymentStatusPaper/PaymentStatusPaper';
import { ShippingStatusPaper } from './ShippingStatusPaper/ShippingStatusPaper';

const SalesSingleOrderGrid = () => {
    const t = useTranslations();

    const columns: GridColDef<OrderItem>[] = [
        { field: 'image', headerName: '', width: 40, disableColumnMenu: true, sortable: false },
        {
            field: 'quantity',
            headerName: '',
            editable: false,
            width: 60,
            align: 'right',
            valueGetter: (value, row) => `${row.quantity} x `,
        },
        {
            field: 'displayName',
            headerName: t('checkout.singleOrder.name'),
            editable: false,
            align: 'left',
            headerAlign: 'center',
            renderCell: (props: GridRenderCellParams<OrderItem, any, any, GridTreeNodeWithRender>) => {
                if (props.row.game === 'shipping') {
                    return props.row.displayName;
                }

                return (
                    <Link href={buildProductLink('magic', props.row.card?.setCode as string, 'single', props.row.displayName as string, props.row.card?.uuid as string)}>{props.row.displayName}</Link>
                );
            },
        },
        {
            field: 'price',
            headerName: t('checkout.singleOrder.price'),
            editable: false,
            align: 'right',
            headerAlign: 'center',
            valueGetter: (value, row) => `${formatCurrency(Number(row.price))}`,
        },
        {
            field: 'total',
            headerName: t('checkout.singleOrder.subtotal'),
            editable: false,
            headerAlign: 'center',
            align: 'right',
            valueGetter: (value, row) => `${formatCurrency(Number(row.quantity) * Number(row.price))}`,
        },
        {
            field: 'actions',
            headerName: '',
            editable: false,
            width: 40,
            renderCell: (params) => null,
        },
    ];

    return columns;
};

const autoSizeOptions = {
    columns: ['displayName', 'price', 'total'],
    includeOutliers: false,
    includeHeaders: true,
    expand: true,
};

export const SalesSingleOrder = ({ order, expanded, refresh }: SalesSingleOrderProps) => {
    const t = useTranslations();
    const [userData, setUserData] = React.useState<any>(null);
    const [businessData, setBusinessData] = React.useState<any>(null);
    const [loadingUserData, setLoadingUserData] = React.useState(true);
    const columns = SalesSingleOrderGrid();
    const apiRef = useGridApiRef();
    const theme = useTheme();
    const notifications = useNotifications();
    const { refreshFunds } = useShoppingCartStore();
    const { setShippingStatus } = useSalesStore();

    const handleShippingStatusChange = (status: string) => {
        setShippingStatus(order.id as number, status)
            .then((data: any) => {
                if (data.success) {
                    notifications.addSuccessNotification(t('sales.singleOrder.shippingStatusChangeSuccess'));
                    refreshFunds();
                    refresh();
                } else {
                    notifications.addErrorNotification(t('sales.singleOrder.shippingStatusChangeError'));
                }
            })
            .catch(() => {
                notifications.addErrorNotification(t('sales.singleOrder.shippingStatusChangeError'));
            });
    };

    const relistItems = () => {
        return (
            <ConfirmationDialog
                title={t('sales.singleOrder.relistItemsConfirmTitle')}
                description={
                    <Box>
                        <Typography>{t('sales.singleOrder.relistItemsConfirmDescription')}</Typography>
                        <Box sx={{ mt: 2 }}>
                            {order.orderItems
                                .filter((item) => item.game !== 'shipping')
                                .map((item, index) => (
                                    <Typography key={index}>
                                        {item.quantity} x {item.displayName} - {formatCurrency(Number(item.price))}
                                    </Typography>
                                ))}
                        </Box>
                    </Box>
                }
                response={() => {
                    apiRequest(ENDPOINTS.API.ORDERS.RELIST_ITEMS, 'POST', { orderId: order.id }).then((data: any) => {
                        if (data.success) {
                            notifications.addSuccessNotification(t('sales.singleOrder.relistItemsSuccess'));
                        } else {
                            notifications.addErrorNotification(t('sales.singleOrder.relistItemsError'));
                        }
                    });
                }}
            >
                {(showDialog) => (
                    <Button variant='contained' onClick={showDialog}>
                        {t('sales.relistItems')}
                    </Button>
                )}
            </ConfirmationDialog>
        );
    };

    React.useEffect(() => {
        apiRequest(`${ENDPOINTS.API.PROFILE.PUBLIC_BY_ID}/${encodeURI(order.buyerId as unknown as string)}`).then((data: any) => {
            setUserData(data.user);
            setBusinessData(data.company);
            setLoadingUserData(false);
            const timeoutId = setTimeout(() => {
                ReactDOM.flushSync(() => {
                    apiRef.current?.autosizeColumns(autoSizeOptions);
                });
            }, 1);
            return () => {
                clearTimeout(timeoutId);
            };
        });
    }, [expanded]);

    return (
        <Card sx={{ p: 2, pt: 0 }}>
            <Grid container spacing={2} direction='row'>
                <Grid size={4} sx={{ display: 'flex' }}>
                    <OrderStatusPaper
                        status={order.status || ''}
                        arrivedAt={order.arrivedAt ? new Date(order.arrivedAt).toDateString() : ''}
                        cancelledAt={order.cancelledAt ? new Date(order.cancelledAt).toDateString() : ''}
                        onRelistItems={relistItems}
                    />
                </Grid>
                <Grid size={4} sx={{ display: 'flex' }}>
                    <PaymentStatusPaper
                        status={order.paymentStatus || ''}
                        paidAt={order.paidAt ? new Date(order.paidAt).toDateString() : ''}
                        orderId={order.id || 0}
                        totalPrice={order.totalPrice || 0}
                    />
                </Grid>
                <Grid size={4} sx={{ display: 'flex' }}>
                    <ShippingStatusPaper
                        status={order.shippingStatus || ''}
                        paymentStatus={order.paymentStatus || ''}
                        orderStatus={order.status || ''}
                        shippedAt={order.shippedAt ? new Date(order.shippedAt).toDateString() : ''}
                        onStatusChange={handleShippingStatusChange}
                        orderId={order.id}
                        orderShipping={order.orderShipping ?? order.orderShipping}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={4}>{loadingUserData ? <Skeleton variant='rounded' height={225} /> : <DoneOrderSellerBox userData={userData} businessData={businessData} type={ORDER_TYPES.SALE} />}</Grid>
                <Grid size={4}>
                    {loadingUserData ? <Skeleton variant='rounded' height={225} /> : <AddressBox minHeight={225} addressData={order.orderAddress?.address ?? ''} country={userData.country} />}
                </Grid>
                <Grid size={4}>
                    <DoneOrderShippingBox orderShipping={order.orderShipping ?? null} />
                </Grid>
            </Grid>
            <DataGrid
                rows={order.orderItems}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 20,
                        },
                    },
                }}
                autosizeOptions={autoSizeOptions}
                pageSizeOptions={[20]}
                autosizeOnMount
                sx={{
                    mt: 2,
                }}
                apiRef={apiRef}
            />
            <Box sx={{ p: 2, backgroundColor: theme.palette.primary.dark, textAlign: 'right' }}>
                <Typography variant='h6'>
                    {t('sales.total')} {formatCurrency(order.totalPrice || 0)}
                </Typography>
            </Box>
            {(order.status === ORDER_STATUS.NEW || order.status === ORDER_STATUS.PENDING) && (order.shippingStatus === SHIPPING_STATUS.PENDING || order.shippingStatus === SHIPPING_STATUS.PACKED) && (
                <CancellationForm order={order} userData={userData} />
            )}
        </Card>
    );
};
