import { OrderItem } from '@/app/api/orders/types';
import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { ORDER_TYPES } from '@/src/constants/orders';
import { ORDER_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import { buildProductLink, formatCurrency } from '@/src/utils/helpers';
import { Box, Card, Grid, Link, Skeleton, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender, useGridApiRef } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import React from 'react';
import ReactDOM from 'react-dom';
import CancellationForm from '../../CancellationForm/CancellationForm';
import { AddressBox } from '../CheckoutSingleOrder/AddressBox/AddressBox';
import { DoneOrderSellerBox } from './DoneOrderSellerBox/DoneOrderSellerBox';
import { DoneOrderShippingBox } from './DoneOrderShippingBox/DoneOrderShippingBox';
import OrderStatusPaper from './StatusPapers/OrderStatusPaper';
import PaymentStatusPaper from './StatusPapers/PaymentStatusPaper';
import ShippingStatusPaper from './StatusPapers/ShippingStatusPaper';
import { CheckoutDoneSingleOrderProps } from './types';

const CheckoutDoneSingleOrderGrid = () => {
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

export const CheckoutDoneSingleOrder = ({ order, hideHeader, expanded, refresh }: CheckoutDoneSingleOrderProps) => {
    const t = useTranslations();
    const [userData, setUserData] = React.useState<any>(null);
    const [businessData, setBusinessData] = React.useState<any>(null);
    const [loadingUserData, setLoadingUserData] = React.useState(true);
    const columns = CheckoutDoneSingleOrderGrid();
    const apiRef = useGridApiRef();
    const theme = useTheme();

    React.useEffect(() => {
        if (!expanded) return;
        apiRequest(`${ENDPOINTS.API.PROFILE.PUBLIC_BY_ID}/${encodeURI(order.sellerId as unknown as string)}`).then((data: any) => {
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
        <Card sx={{ mt: hideHeader ? 0 : 4, p: 2, pt: hideHeader ? 0 : 2 }}>
            <Grid container spacing={2}>
                {!hideHeader && (
                    <>
                        <Grid size={6}>
                            <Typography variant='h6' sx={{ mb: 2 }}>
                                {t('checkout.doneSingleOrder.title')} {order.id}
                            </Typography>
                        </Grid>
                        <Grid size={6}>
                            <Typography variant='body1' sx={{ textAlign: 'right' }}>
                                {t('checkout.doneSingleOrder.orderDate')}: {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                            </Typography>
                        </Grid>
                    </>
                )}
            </Grid>
            <Grid container spacing={2} sx={{ display: 'flex' }}>
                <Grid size={4} sx={{ display: 'flex' }}>
                    <OrderStatusPaper
                        status={order.status || null}
                        shippingStatus={order.shippingStatus || null}
                        arrivedAt={order.arrivedAt}
                        cancelledAt={order.cancelledAt}
                        shippedAt={order.shippedAt}
                        orderId={order.id}
                        onSuccess={refresh}
                        orderItems={order.orderItems}
                    />
                </Grid>
                <Grid size={4} sx={{ display: 'flex' }}>
                    <PaymentStatusPaper status={order.paymentStatus || null} paidAt={order.paidAt} orderId={order.id} />
                </Grid>
                <Grid size={4} sx={{ display: 'flex' }}>
                    <ShippingStatusPaper status={order.shippingStatus || null} shippedAt={order.shippedAt} />
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={4}>
                    {loadingUserData ? <Skeleton variant='rounded' height={225} /> : <DoneOrderSellerBox userData={userData} businessData={businessData} type={ORDER_TYPES.PURCHASE} />}
                </Grid>
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
                    {t('checkout.singleOrder.total')} {formatCurrency(order.totalPrice || 0)}
                </Typography>
            </Box>
            {(order.status === ORDER_STATUS.NEW || order.status === ORDER_STATUS.PENDING) && (order.shippingStatus === SHIPPING_STATUS.PENDING || order.shippingStatus === SHIPPING_STATUS.PACKED) && (
                <CancellationForm order={order} userData={userData} />
            )}
        </Card>
    );
};
