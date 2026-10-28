'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import CardImageBadge from '@/src/components/CardImageBadge/CardImageBadge';
import CardImageTooltip from '@/src/components/CardImageTooltip/CardImageTooltip';
import OrdersAccordion from '@/src/components/PickingList/OrdersAccordion/OrdersAccordion';
import PickedItemsGrid from '@/src/components/PickingList/PickedItemsGrid/PickedItemsGrid';
import PickingListGrid from '@/src/components/PickingList/PickingListGrid/PickingListGrid';
import ProblemDialog from '@/src/components/PickingList/ProblemDialog/ProblemDialog';
import ProblemItemsGrid from '@/src/components/PickingList/ProblemItemsGrid/ProblemItemsGrid';
import { PICKING_LIST_ITEM_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { usePickingListStore } from '@/src/store/pickinglists';
import { useSalesStore } from '@/src/store/sales';
import { PickingListItem } from '@/src/store/types';
import { CardSet } from '@/src/types/AllMTGJSONTypes';
import { InsertPhoto, List, ViewModule } from '@mui/icons-material';
import { Button, ButtonGroup, LinearProgress, Tooltip, Typography } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function PickingListPage() {
    const t = useTranslations();
    const params = useParams();
    const router = useRouter();
    const { loading, list, getListById, orderIndexList, pickedItems, setItemToPicked, setItemToUnpicked, setItemStatus, setItemProblem, deleteList } = usePickingListStore();
    const { setShippingStatus } = useSalesStore();
    const [showProblemDialog, setShowProblemDialog] = React.useState(false);
    const [isPickingComplete, setIsPickingComplete] = React.useState(false);
    const [problemItemId, setProblemItemId] = React.useState<number | null>(null);
    const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
    const [showOrders, setShowOrders] = React.useState(false);
    const [statusLoading, setStatusLoading] = React.useState<number | null>(null);
    const [changedStatuses, setChangedStatuses] = React.useState<{ [orderId: number]: string }>({});
    const notifications = useNotifications();

    const handleShippingStatusChange = (orderId: number, status: string) => {
        setChangedStatuses((prev) => ({ ...prev, [orderId]: status }));
        setShippingStatus(orderId, status)
            .then((data: any) => {
                setStatusLoading(null);
                if (data.success) {
                    notifications.addSuccessNotification(t('sales.singleOrder.shippingStatusChangeSuccess'));
                } else {
                    notifications.addErrorNotification(t('sales.singleOrder.shippingStatusChangeError'));
                }
            })
            .catch(() => {
                notifications.addErrorNotification(t('sales.singleOrder.shippingStatusChangeError'));
            });
    };

    const problemColumns: GridColDef<PickingListItem>[] = [
        {
            field: 'status',
            headerName: t('pickinglists.status'),
            minWidth: 200,
            align: 'center',
            renderCell: (params: GridRenderCellParams<PickingListItem, any, any, GridTreeNodeWithRender>) => {
                const isPicked = pickedItems.some((item) => item.id === params.row.id);
                const isFound = params.row.status === PICKING_LIST_ITEM_STATUS.FOUND;
                const isProblem = params.row.status === PICKING_LIST_ITEM_STATUS.PROBLEM;

                if (isPicked) {
                    return (
                        <Button
                            variant='outlined'
                            color='error'
                            size='small'
                            onClick={() => {
                                setIsPickingComplete(false);
                                setItemToUnpicked({ ...params.row, status: '' });
                            }}
                        >
                            {t('pickingLists.backToPicking')}
                        </Button>
                    );
                }

                if (isFound) {
                    return (
                        <Button variant='contained' color='success' size='small' onClick={() => setItemToPicked(params.row)}>
                            {t('pickingLists.putInEnvelope')} {orderIndexList.indexOf(params.row.orderItem?.orderId as number) + 1}
                        </Button>
                    );
                }

                if (isProblem) {
                    return (
                        <Button variant='outlined' color='error' size='small' onClick={() => setItemStatus(params.row, '')}>
                            {t('pickingLists.backToPicking')}
                        </Button>
                    );
                }

                return (
                    <React.Fragment key={params.row.id}>
                        <Button variant='contained' color='primary' size='small' onClick={() => setItemStatus(params.row, PICKING_LIST_ITEM_STATUS.FOUND)}>
                            {params.row.orderItem?.originalItem?.quantity || 1} {t('pickinglists.markAsFound')}
                        </Button>
                        <Button variant='outlined' color='error' size='small' onClick={() => setItemStatus(params.row, 'problem')} sx={{ ml: 1 }}>
                            {t('pickinglists.problem')}
                        </Button>
                    </React.Fragment>
                );
            },
        },
        {
            field: 'image',
            headerName: '',
            renderCell: (props: GridRenderCellParams<PickingListItem, any, any, GridTreeNodeWithRender>) => {
                return (
                    <>
                        <CardImageTooltip card={props.row.card as unknown as CardSet} />
                        {props.row.orderItem?.originalItem?.imagePath && (
                            <Tooltip
                                title={
                                    <React.Fragment>
                                        <CardImageBadge card={props.row.card as unknown as CardSet} imagePath={props.row.orderItem.originalItem.imagePath} />
                                    </React.Fragment>
                                }
                            >
                                <InsertPhoto
                                    sx={{
                                        cursor: 'pointer',
                                    }}
                                />
                            </Tooltip>
                        )}
                    </>
                );
            },
        },
        {
            field: 'quantity',
            headerName: '',
            editable: false,
            width: 60,
            align: 'right',
            valueGetter: (value, row) => `${row.orderItem?.originalItem?.quantity || 1} x `,
        },
        { field: 'name', headerName: t('pickinglists.cardName'), flex: 1, minWidth: 200, valueGetter: (value, row) => row.card?.name },
        { field: 'problem', headerName: t('pickinglists.problem'), flex: 1, minWidth: 200, valueGetter: (value, row) => row.problem || '' },
    ];

    const handleProblemSave = (problem: string) => {
        const item = list.items.find((item) => item.id === problemItemId);
        if (item) {
            setItemStatus(item, PICKING_LIST_ITEM_STATUS.PROBLEM);
            setItemProblem(item, problem);
        }
        setShowProblemDialog(false);
    };

    const handleEnvelopeClick = () => {
        const newIsPickingComplete = () => {
            if (!list?.items) return false;
            return list.items.every((item) => pickedItems.some((picked) => picked.id === item.id) || item.status === PICKING_LIST_ITEM_STATUS.PROBLEM);
        };
        setIsPickingComplete(newIsPickingComplete());
    };

    const handleProblemClick = (itemId: number) => {
        setProblemItemId(itemId);
        setShowProblemDialog(true);
    };

    const handleStatusChange = async (orderId: number, status: string, action: string) => {
        setStatusLoading(orderId);
        handleShippingStatusChange(orderId, status);
    };

    useEffect(() => {
        getListById(params?.id as unknown as number);
    }, [params?.id, getListById]);

    useEffect(() => {
        const newIsPickingComplete = () => {
            if (!list?.items) return false;
            return list.items.every((item) => pickedItems.some((picked) => picked.id === item.id) || item.status === PICKING_LIST_ITEM_STATUS.PROBLEM);
        };
        setIsPickingComplete(newIsPickingComplete());
    }, [list?.items]);

    const groupedOrders = React.useMemo(() => {
        if (!list?.items) return {};
        const acc: Record<number, PickingListItem[]> = {};

        // Group list items
        list.items.forEach((item) => {
            const orderId = item.orderItem?.orderId;
            if (!orderId) return;
            if (!acc[orderId]) acc[orderId] = [];
            acc[orderId].push(item);
        });

        // Add picked items
        pickedItems.forEach((item) => {
            const orderId = item.orderItem?.orderId;
            if (!orderId) return;
            if (!acc[orderId]) acc[orderId] = [];
            // Only add if not already in the array
            if (!acc[orderId].some((existing) => existing.id === item.id)) {
                acc[orderId].push(item);
            }
        });

        return acc;
    }, [list?.items, pickedItems]);

    const handleDeletePickingList = async () => {
        try {
            const result = await deleteList(params?.id as unknown as number);
            if (result.success) {
                notifications.addSuccessNotification(t('pickinglists.deleteSuccess'));
                router.push('/sales/shipped');
            } else {
                notifications.addErrorNotification(result.message || t('pickinglists.deleteError'));
            }
        } catch (error) {
            notifications.addErrorNotification(t('pickinglists.deleteError'));
        }
    };

    // Check if all orders are packed or shipped
    const areAllOrdersProcessed = React.useMemo(() => {
        if (!list?.items || Object.keys(groupedOrders).length === 0) return false;

        return Object.entries(groupedOrders).every(
            ([orderId, items]) =>
                items[0].order?.shippingStatus === SHIPPING_STATUS.PACKED ||
                items[0].order?.shippingStatus === SHIPPING_STATUS.SHIPPED ||
                changedStatuses[Number(orderId)] === SHIPPING_STATUS.PACKED ||
                changedStatuses[Number(orderId)] === SHIPPING_STATUS.SHIPPED
        );
    }, [groupedOrders, changedStatuses, list?.items]);

    if (loading) {
        return <LinearProgress sx={{ mt: 5 }} />;
    }

    if (!list) {
        return <Typography>{t('pickinglists.notFound')}</Typography>;
    }

    return (
        <>
            <BasicBreadcrumbs current={list.name} previous={[{ text: t('pickinglists.title'), url: '/picking-lists' }]} />
            <Typography variant='h4' component='h1' sx={{ textAlign: 'center', mb: 3 }}>
                {list.name}
                <ButtonGroup variant='outlined' aria-label='view mode' sx={{ float: 'right' }}>
                    <Button onClick={() => setViewMode('list')} variant={viewMode === 'list' ? 'contained' : 'outlined'}>
                        <List />
                    </Button>
                    <Button onClick={() => setViewMode('grid')} variant={viewMode === 'grid' ? 'contained' : 'outlined'}>
                        <ViewModule />
                    </Button>
                </ButtonGroup>
            </Typography>

            {isPickingComplete && !showOrders && (
                <Button variant='contained' color='success' fullWidth sx={{ mt: 2 }} onClick={() => setShowOrders(true)}>
                    {t('pickinglists.finishAndShowOrders')}
                </Button>
            )}

            {showOrders && <OrdersAccordion groupedOrders={groupedOrders} changedStatuses={changedStatuses} statusLoading={statusLoading} handleStatusChange={handleStatusChange} />}

            {areAllOrdersProcessed && (
                <Button variant='contained' color='error' fullWidth sx={{ mt: 2 }} onClick={handleDeletePickingList}>
                    {t('pickinglists.deletePickingList')}
                </Button>
            )}

            {list.items && list.items.length > 0 && (
                <>
                    {!isPickingComplete && (
                        <PickingListGrid
                            items={list.items.filter((item) => item.status !== PICKING_LIST_ITEM_STATUS.PROBLEM)}
                            pickedItems={pickedItems}
                            orderIndexList={orderIndexList}
                            onSetItemToPicked={setItemToPicked}
                            onSetItemToUnpicked={setItemToUnpicked}
                            onSetItemStatus={setItemStatus}
                            onProblemClick={handleProblemClick}
                            onEnvelopeClick={handleEnvelopeClick}
                            viewMode={viewMode}
                        />
                    )}
                    <PickedItemsGrid items={pickedItems} columns={problemColumns} viewMode={viewMode} />
                    <ProblemItemsGrid items={list.items} problemColumns={problemColumns} viewMode={viewMode} />
                </>
            )}

            <ProblemDialog open={showProblemDialog} onClose={() => setShowProblemDialog(false)} onSave={handleProblemSave} />
        </>
    );
}
