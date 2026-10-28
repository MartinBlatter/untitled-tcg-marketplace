import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { ShoppingCartItem } from '@/src/store/types';
import { buildProductLink, formatCurrency } from '@/src/utils/helpers';
import { Delete, Favorite, Inventory2 } from '@mui/icons-material';
import { Box, Button, Card, Grid, IconButton, Link, Skeleton, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender, useGridApiRef } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import React from 'react';
import ReactDOM from 'react-dom';
import ConfirmationDialog from '../../ConfirmationDialog/ConfirmationDialog';
import { AddressBox } from './AddressBox/AddressBox';
import { OrderHeadline } from './OrderHeadline/OrderHeadline';
import { SellerBox } from './SellerBox/SellerBox';
import { ShippingBox } from './ShippingBox/ShippingBox';
import { CheckoutSingleOrderProps } from './types';

const CheckoutSingleOrderGrid = () => {
    const t = useTranslations();
    const { removeShoppingCartItem } = useShoppingCartStore();

    const columns: GridColDef<ShoppingCartItem>[] = [
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
            renderCell: (props: GridRenderCellParams<ShoppingCartItem, any, any, GridTreeNodeWithRender>) => {
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
            valueGetter: (value, row) => `${formatCurrency(row.quantity * Number(row.price))}`,
        },
        {
            field: 'actions',
            headerName: '',
            editable: false,
            width: 40,
            renderCell: (props: GridRenderCellParams<ShoppingCartItem, any, any, GridTreeNodeWithRender>) => {
                if (props.row.game === 'shipping') {
                    return null;
                }

                return (
                    <IconButton onClick={() => removeShoppingCartItem(Number(props.row.id))}>
                        <Delete />
                    </IconButton>
                );
            },
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

export const CheckoutSingleOrder = ({ sellerItem, index, addressData, loadingAddressData }: CheckoutSingleOrderProps) => {
    const t = useTranslations();
    const theme = useTheme();
    const { refreshShoppingCartItems, removeShoppingCartItem } = useShoppingCartStore();
    const [loadingUserData, setLoadingUserData] = React.useState(true);
    const [loadingShippingData, setLoadingShippingData] = React.useState(true);
    const [userData, setUserData] = React.useState<any>(null);
    const [businessData, setBusinessData] = React.useState<any>(null);
    const [shippingData, setShippingData] = React.useState<any>(null);
    const [requiresTracking, setRequiresTracking] = React.useState(false);
    const apiRef = useGridApiRef();
    const columns = CheckoutSingleOrderGrid();

    const refreshData = () => {
        setLoadingUserData(true);
        setLoadingShippingData(true);
        apiRequest(`${ENDPOINTS.API.PROFILE.PUBLIC_BY_ID}/${encodeURI(sellerItem[0].sellerId as unknown as string)}`).then((data: any) => {
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
        apiRequest(`${ENDPOINTS.API.SHIPPING.BY_ID}/${encodeURI(sellerItem[0].sellerId as unknown as string)}`).then((data: any) => {
            setRequiresTracking(data.requiresTracking);
            setShippingData(data.shippingData);
            setLoadingShippingData(false);
        });
    };

    React.useEffect(() => {
        refreshData();
    }, []);

    const handleRemoveOrder = (cartId: string, sellerId: string) => {
        apiRequest(ENDPOINTS.API.SHOPPINGCART.REMOVE, 'POST', { cartId: cartId, sellerId: sellerId }).then((data: any) => {
            if (data.success) {
                refreshShoppingCartItems();
            }
        });
    };

    return (
        <Card sx={{ mt: 4, p: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
                {t('checkout.singleOrder.title')} {index + 1}
                {userData && <OrderHeadline userName={userData.userName} country={userData.country} />}
                <ConfirmationDialog
                    title={t('delete')}
                    description={t('confirmation.delete')}
                    response={() => handleRemoveOrder(sellerItem[0].cartId as unknown as string, sellerItem[0].sellerId as unknown as string)}
                >
                    {(showDialog) => (
                        <Button startIcon={<Delete />} variant='outlined' color='error' sx={{ float: 'right' }} onClick={showDialog}>
                            {t('checkout.singleOrder.deleteOrder')}
                        </Button>
                    )}
                </ConfirmationDialog>
            </Typography>
            <Grid container spacing={2}>
                <Grid size={4}>{loadingUserData ? <Skeleton variant='rounded' height={195} /> : <SellerBox userData={userData} businessData={businessData} />}</Grid>
                <Grid size={4}>{loadingAddressData || loadingUserData ? <Skeleton variant='rounded' height={195} /> : <AddressBox addressData={addressData} country={userData.country} />}</Grid>
                <Grid size={4}>
                    {loadingShippingData ? (
                        <Skeleton variant='rounded' height={195} />
                    ) : (
                        <ShippingBox
                            shippingData={shippingData}
                            requiresTracking={requiresTracking}
                            initialPrice={Number(sellerItem.filter((item) => item.game === 'shipping')[0].price)}
                            cartId={sellerItem[0].cartId as unknown as string}
                            sellerId={sellerItem[0].sellerId as unknown as string}
                        />
                    )}
                </Grid>
            </Grid>
            {loadingUserData ? (
                <Skeleton variant='rounded' height={120} sx={{ mt: 2 }} />
            ) : (
                <DataGrid
                    rows={sellerItem}
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
            )}
            <Box sx={{ p: 2, backgroundColor: theme.palette.primary.dark, textAlign: 'right' }}>
                {!loadingUserData && (
                    <>
                        <Link href={`/user/${userData.userName}`} sx={{ float: 'left', color: 'inherit' }} underline='hover'>
                            <Button variant='outlined' color='inherit' size='small' startIcon={<Inventory2 />}>
                                {t('checkout.singleOrder.userInventory')}
                            </Button>
                        </Link>
                        <Link href='#' sx={{ float: 'left', color: 'inherit', ml: 2 }} underline='hover'>
                            <Button variant='outlined' color='inherit' size='small' startIcon={<Favorite />}>
                                {t('checkout.singleOrder.userInventoryWishlist')}
                            </Button>
                        </Link>
                    </>
                )}
                <Typography variant='h6'>
                    {t('checkout.singleOrder.total')} {formatCurrency(sellerItem.reduce((acc, item) => acc + item.quantity * Number(item.price), 0))}
                </Typography>
            </Box>
        </Card>
    );
};
