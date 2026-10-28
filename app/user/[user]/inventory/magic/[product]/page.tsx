'use client';

import { getPublicInventoryAction } from '@/src/actions/inventory';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import InventoryFilters from '@/src/components/Inventory/InventoryFilters/InventoryFilters';
import InventoryList from '@/src/components/Inventory/InventoryList/InventoryList';
import InventoryPagination from '@/src/components/Inventory/InventoryPagination/InventoryPagination';
import InventoryTiles from '@/src/components/Inventory/InventoryTiles/InventoryTiles';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useInventoryStore } from '@/src/store/inventory';
import { LinearProgress, SelectChangeEvent, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React, { ChangeEvent, use } from 'react';

export default function Inventory(props: { params: Promise<{ user: string; product: string }> }) {
    const t = useTranslations();
    const params = use(props.params);
    const user = params.user;
    const product = params.product;
    const [isLoading, setLoading] = React.useState(true);
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const [size, setSize] = React.useState(60);
    const [sortBy, setSortBy] = React.useState('name');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [saleInventory, setSaleInventory] = React.useState([]);
    const [saleInventoryCount, setSaleInventoryCount] = React.useState(0);
    const notifications = useNotifications();
    const { filters } = useInventoryStore();
    const { data: session } = useSession();
    const [viewMode, setViewMode] = React.useState(session?.settings?.find((setting: any) => setting.name === 'inventoryView')?.value || 'list');

    const handleChangePage = (event: ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
        setSize(parseInt(event.target.value, 10));
        setPage(1);
    };

    const setSorting = (column: string) => {
        if (column === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortOrder('asc');
            setSortBy(column);
        }
    };

    const refresh = () => {
        setLoading(true);
        getPublicInventoryAction(user, page, size, sortBy, sortOrder, filters).then((data: any) => {
            if (data.success) {
                setSaleInventory(data.inventory);
                setSaleInventoryCount(data.count);
            } else {
                notifications.addErrorNotification(t('inventory.errorFetch'));
            }
            setLoading(false);
            setIsInitialLoading(false);
        });
    };

    const removeItem = (id: number) => {
        const items = saleInventory.filter((item: any) => item.inventoryId !== id);
        setSaleInventory(items);
    };

    React.useEffect(() => {
        refresh();
    }, [page, size, sortBy, sortOrder]);

    React.useEffect(() => {
        if (session) {
            if (session.settings && session.settings.find((setting: any) => setting.name === 'inventoryView')) {
                const viewMode = session.settings.find((setting: any) => setting.name === 'inventoryView');
                setViewMode(viewMode.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultSort')) {
                const sortBy = session.settings.find((setting: any) => setting.name === 'defaultSort');
                setSortBy(sortBy.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultSortDirection')) {
                const sortOrder = session.settings.find((setting: any) => setting.name === 'defaultSortDirection');
                setSortOrder(sortOrder.value);
            }
        }
    }, [session]);

    return (
        <>
            <BasicBreadcrumbs current={`${t(`inventory.title`)} - ${t(`products.categories.${product}`)}`} previous={[{ text: user, url: `/user/${user}` }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {user} - {t(`inventory.title`)} - {t(`products.categories.${product}`)}
            </Typography>
            {isInitialLoading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : (
                <>
                    {viewMode === 'list' ? (
                        <>
                            <InventoryFilters refresh={refresh} isPublic />
                            <InventoryPagination
                                position='top'
                                page={page}
                                size={size}
                                count={saleInventoryCount}
                                setViewMode={setViewMode}
                                handleChangePage={handleChangePage}
                                handleChangeRowsPerPage={handleChangeRowsPerPage}
                            />
                            <InventoryList
                                inventory={saleInventory}
                                loading={isLoading}
                                triggerRefresh={refresh}
                                setSortBy={setSorting}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                isPublic={true}
                                removeItem={removeItem}
                            />
                            <InventoryPagination
                                position='bottom'
                                page={page}
                                size={size}
                                count={saleInventoryCount}
                                setViewMode={setViewMode}
                                handleChangePage={handleChangePage}
                                handleChangeRowsPerPage={handleChangeRowsPerPage}
                            />
                        </>
                    ) : (
                        <>
                            <InventoryFilters refresh={refresh} isPublic />
                            <InventoryPagination
                                position='top'
                                page={page}
                                size={size}
                                count={saleInventoryCount}
                                setViewMode={setViewMode}
                                handleChangePage={handleChangePage}
                                handleChangeRowsPerPage={handleChangeRowsPerPage}
                            />
                            <InventoryTiles
                                inventory={saleInventory}
                                loading={isLoading}
                                triggerRefresh={refresh}
                                setSortBy={setSorting}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                isPublic={true}
                                removeItem={removeItem}
                            />
                            <InventoryPagination
                                position='bottom'
                                page={page}
                                size={size}
                                count={saleInventoryCount}
                                setViewMode={setViewMode}
                                handleChangePage={handleChangePage}
                                handleChangeRowsPerPage={handleChangeRowsPerPage}
                            />
                        </>
                    )}
                </>
            )}
        </>
    );
}
