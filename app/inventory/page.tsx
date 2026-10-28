'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import CustomTabPanel from '@/src/components/CustomTabPanel/CustomTabPanel';
import ExportDialog from '@/src/components/Inventory/ExportDialog';
import ImportDialog from '@/src/components/Inventory/ImportDialog';
import InventoryFilters from '@/src/components/Inventory/InventoryFilters/InventoryFilters';
import InventoryList from '@/src/components/Inventory/InventoryList/InventoryList';
import InventoryPagination from '@/src/components/Inventory/InventoryPagination/InventoryPagination';
import InventoryTiles from '@/src/components/Inventory/InventoryTiles/InventoryTiles';
import { useInventoryStore } from '@/src/store/inventory';
import { FileDownload, FileUpload } from '@mui/icons-material';
import { Box, Button, LinearProgress, SelectChangeEvent, Tab, Tabs, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import React, { ChangeEvent, useState } from 'react';

export default function Inventory() {
    const t = useTranslations();
    const {
        loading,
        setLoading,
        viewMode,
        setViewMode,
        fullInventory,
        fullInventoryCount,
        privateInventory,
        privateInventoryCount,
        forSaleInventory,
        forSaleInventoryCount,
        page,
        setPage,
        size,
        setSize,
        privatePage,
        setPrivatePage,
        privateSize,
        setPrivateSize,
        forSalePage,
        setForSalePage,
        forSaleSize,
        setForSaleSize,
        sortBy,
        sortOrder,
        setSortBy,
        setSortOrder,
        setSorting,
        refreshFullInventory,
        refreshPrivateInventory,
        refreshSaleInventory,
    } = useInventoryStore();
    const [isInitialLoading, setInitialLoading] = useState(true);
    const { data: session } = useSession();
    const [tab, setTab] = React.useState(0);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    console.log(fullInventoryCount, privateInventoryCount, forSaleInventoryCount);
    const handleChange = (event: React.SyntheticEvent, newTab: number) => {
        setTab(newTab);
    };

    const handleChangePage = (event: ChangeEvent<unknown>, newPage: number) => {
        if (tab === 0) {
            setPage(newPage);
        } else if (tab === 1) {
            setPrivatePage(newPage);
        } else if (tab === 2) {
            setForSalePage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
        if (tab === 0) {
            setSize(parseInt(event.target.value, 10));
            setPage(1);
        } else if (tab === 1) {
            setPrivateSize(parseInt(event.target.value, 10));
            setPrivatePage(1);
        } else if (tab === 2) {
            setForSaleSize(parseInt(event.target.value, 10));
            setForSalePage(1);
        }
    };

    React.useEffect(() => {
        if (!session) return;
        refresh();
    }, [page, size, privatePage, privateSize, forSalePage, forSaleSize, tab, sortBy, sortOrder, session]);

    function refresh() {
        setLoading(true);

        if (tab === 0) {
            refreshFullInventory();
        } else if (tab === 1) {
            refreshPrivateInventory();
        } else if (tab === 2) {
            refreshSaleInventory();
        }
        if (isInitialLoading) setInitialLoading(false);
    }

    function a11yProps(index: number) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    React.useEffect(() => {
        if (session) {
            if (session.settings && session.settings.find((setting: any) => setting.name === 'inventoryView')) {
                const viewMode = session.settings.find((setting: any) => setting.name === 'inventoryView');
                setViewMode(viewMode.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultInventorySort')) {
                const sortBy = session.settings.find((setting: any) => setting.name === 'defaultInventorySort');
                setSortBy(sortBy.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultInventorySortDirection')) {
                const sortOrder = session.settings.find((setting: any) => setting.name === 'defaultInventorySortDirection');
                setSortOrder(sortOrder.value);
            }
        }
    }, [session]);

    const handleImportComplete = () => {
        // Refresh the inventory data after import is complete
        refresh();
    };

    return (
        <>
            <BasicBreadcrumbs current={t(`inventory.title`)} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center', flex: 1 }}>
                {t(`inventory.title`)}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
                <Button variant='outlined' color='primary' startIcon={<FileDownload />} onClick={() => setExportDialogOpen(true)}>
                    {t('inventory.export.exportButton')}
                </Button>
                <Button variant='contained' color='primary' startIcon={<FileUpload />} onClick={() => setImportDialogOpen(true)}>
                    {t('import')}
                </Button>
            </Box>
            <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={handleChange} aria-label='basic tabs example'>
                        <Tab label={t(`inventory.tabs.complete`)} {...a11yProps(0)} />
                        <Tab label={t(`inventory.tabs.private`)} {...a11yProps(1)} />
                        <Tab label={t(`inventory.tabs.forSale`)} {...a11yProps(2)} />
                    </Tabs>
                </Box>
                {isInitialLoading ? (
                    <LinearProgress sx={{ mt: 5 }} />
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <>
                                <CustomTabPanel value={tab} index={0}>
                                    <InventoryFilters refresh={refresh} />
                                    <InventoryPagination
                                        position='top'
                                        page={page}
                                        size={size}
                                        count={fullInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                    <InventoryList inventory={fullInventory} loading={loading} triggerRefresh={refresh} setSortBy={setSorting} sortBy={sortBy} sortOrder={sortOrder} />
                                    <InventoryPagination
                                        position='bottom'
                                        page={page}
                                        size={size}
                                        count={fullInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                </CustomTabPanel>
                                <CustomTabPanel value={tab} index={1}>
                                    <InventoryFilters refresh={refresh} />
                                    <InventoryPagination
                                        position='top'
                                        page={privatePage}
                                        size={privateSize}
                                        count={privateInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                    <InventoryList inventory={privateInventory} loading={loading} triggerRefresh={refresh} setSortBy={setSorting} sortBy={sortBy} sortOrder={sortOrder} />
                                    <InventoryPagination
                                        position='bottom'
                                        page={privatePage}
                                        size={privateSize}
                                        count={privateInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                </CustomTabPanel>
                                <CustomTabPanel value={tab} index={2}>
                                    <InventoryFilters refresh={refresh} />
                                    <InventoryPagination
                                        position='top'
                                        page={forSalePage}
                                        size={forSaleSize}
                                        count={forSaleInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                    <InventoryList inventory={forSaleInventory} loading={loading} triggerRefresh={refresh} setSortBy={setSorting} sortBy={sortBy} sortOrder={sortOrder} />
                                    <InventoryPagination
                                        position='bottom'
                                        page={forSalePage}
                                        size={forSaleSize}
                                        count={forSaleInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                </CustomTabPanel>
                            </>
                        ) : (
                            <>
                                <CustomTabPanel value={tab} index={0}>
                                    <InventoryFilters refresh={refresh} />
                                    <InventoryPagination
                                        position='top'
                                        page={page}
                                        size={size}
                                        count={fullInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                    <InventoryTiles inventory={fullInventory} loading={loading} triggerRefresh={refresh} setSortBy={setSorting} sortBy={sortBy} sortOrder={sortOrder} />
                                    <InventoryPagination
                                        position='bottom'
                                        page={page}
                                        size={size}
                                        count={fullInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                </CustomTabPanel>
                                <CustomTabPanel value={tab} index={1}>
                                    <InventoryFilters refresh={refresh} />
                                    <InventoryPagination
                                        position='top'
                                        page={privatePage}
                                        size={privateSize}
                                        count={privateInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                    <InventoryTiles inventory={privateInventory} loading={loading} triggerRefresh={refresh} setSortBy={setSorting} sortBy={sortBy} sortOrder={sortOrder} />
                                    <InventoryPagination
                                        position='bottom'
                                        page={privatePage}
                                        size={privateSize}
                                        count={privateInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                </CustomTabPanel>
                                <CustomTabPanel value={tab} index={2}>
                                    <InventoryFilters refresh={refresh} />
                                    <InventoryPagination
                                        position='top'
                                        page={forSalePage}
                                        size={forSaleSize}
                                        count={forSaleInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                    <InventoryTiles inventory={forSaleInventory} loading={loading} triggerRefresh={refresh} setSortBy={setSorting} sortBy={sortBy} sortOrder={sortOrder} />
                                    <InventoryPagination
                                        position='bottom'
                                        page={forSalePage}
                                        size={forSaleSize}
                                        count={forSaleInventoryCount}
                                        setViewMode={setViewMode}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                </CustomTabPanel>
                            </>
                        )}
                    </>
                )}
            </>

            <ImportDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} onImportComplete={handleImportComplete} />
            <ExportDialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} currentTab={tab} />
        </>
    );
}
