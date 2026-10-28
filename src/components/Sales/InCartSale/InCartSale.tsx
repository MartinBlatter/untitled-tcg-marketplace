import { apiRequest } from '@/src/actions/apiRequest';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useSalesStore } from '@/src/store/sales';
import { ShoppingCartItem } from '@/src/store/types';
import { buildProductLink, formatCurrency } from '@/src/utils/helpers';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Link } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender, useGridApiRef } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import React from 'react';
import ReactDOM from 'react-dom';
import { OrderHeadline } from '../../Checkout/CheckoutSingleOrder/OrderHeadline/OrderHeadline';
import { InCartSaleProps } from '../types';

const InCartSaleColumns = () => {
    const t = useTranslations();

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
            renderCell: () => {
                return null;
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

export const InCartSale = ({ cart, expanded, handleChange, index }: InCartSaleProps) => {
    const t = useTranslations();
    const apiRef = useGridApiRef();
    const [userData, setUserData] = React.useState<any>(null);
    const { refreshInCartSales } = useSalesStore();
    const notifications = useNotifications();

    const removeCart = (id: number) => {
        apiRequest(ENDPOINTS.API.SHOPPINGCART.REMOVE_AS_SELLER, 'DELETE', { cartId: id }).then((data: any) => {
            if (data.success) {
                notifications.addSuccessNotification(t('sales.inCart.removeCartSuccess'));

                refreshInCartSales();
            } else {
                notifications.addErrorNotification(t('sales.inCart.removeCartError'));
            }
        });
    };

    React.useEffect(() => {
        apiRequest(`${ENDPOINTS.API.PROFILE.PUBLIC_BY_ID}/${encodeURI(cart.userId as unknown as string)}`).then((data: any) => {
            setUserData(data.user);
            const timeoutId = setTimeout(() => {
                ReactDOM.flushSync(() => {
                    apiRef.current?.autosizeColumns(autoSizeOptions);
                });
            }, 1);
            return () => {
                clearTimeout(timeoutId);
            };
        });
        const timeoutId = setTimeout(() => {
            ReactDOM.flushSync(() => {
                apiRef.current?.autosizeColumns(autoSizeOptions);
            });
        }, 1);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [expanded]);

    return (
        <Accordion key={`${cart.id}`} expanded={expanded} onChange={handleChange(cart.id)}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`sale-${cart.id}-content`} id={`sale-${cart.id}-header`}>
                <Grid container spacing={2} sx={{ width: '100%', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <Grid size={3}>
                        {t(`sales.sale`)} {index + 1}
                        {userData && <OrderHeadline userName={userData.userName} country={userData.country} />}
                    </Grid>
                    <Grid size={2} sx={{ textAlign: 'center' }}>
                        {cart.items.length - 1} {t('sales.inCart.item')}
                    </Grid>
                    <Grid size={1} sx={{ textAlign: 'center' }}>
                        {formatCurrency(cart.items.reduce((total, item) => total + Number(item.price), 0))}
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'center', pr: 2 }}>
                        {t(`games.${cart.items[0].game}`)}
                    </Grid>
                    <Grid size={3} sx={{ textAlign: 'right', pr: 2 }}>
                        {cart.createdAt ? new Date(cart.createdAt).toLocaleString() : ''}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <DataGrid
                    rows={cart.items}
                    columns={InCartSaleColumns()}
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
                <Button variant='outlined' color='error' sx={{ mt: 2, mb: 2, float: 'right' }} onClick={() => removeCart(cart.id)}>
                    {t('sales.removeCart')}
                </Button>
            </AccordionDetails>
        </Accordion>
    );
};
