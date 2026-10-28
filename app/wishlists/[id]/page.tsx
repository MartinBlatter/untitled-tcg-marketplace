'use client';

import { apiRequest } from '@/src/actions/apiRequest';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import SingleCardListWishlistDialog from '@/src/components/SingleCard/SingleCardListWishlistDialog/SingleCardWishlistDialog';
import SingleCardWishlistDialog from '@/src/components/SingleCard/SingleCardWishlistDialog/SingleCardWishlistDialog';
import WishlistImportDialog from '@/src/components/Wishlist/WishlistImportDialog/WishlistImportDialog';
import WishlistItemsList from '@/src/components/Wishlist/WishlistItemsList/WishlistItemsList';
import WishlistItemsTiles from '@/src/components/Wishlist/WishlistItemsTiles/WishlistItemsTiles';
import WishlistMassEditPanel from '@/src/components/Wishlist/WishlistMassEditPanel/WishlistMassEditPanel';
import WishlistPreviewItemsList from '@/src/components/Wishlist/WishlistPreviewItemsList/WishlistPreviewItemsList';
import WishlistPreviewItemsTiles from '@/src/components/Wishlist/WishlistPreviewItemsTiles/WishlistPreviewItemsTiles';
import WishlistRenameDialog from '@/src/components/Wishlist/WishlistRenameDialog/WishlistRenameDialog';
import WishlistShareDialog from '@/src/components/Wishlist/WishlistShareDialog/WishlistShareDialog';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { WishlistItem } from '@/src/store/types';
import { useWishlistsStore } from '@/src/store/wishlists';
import { Add, Delete, Edit, FileDownload, FileUpload, Share } from '@mui/icons-material';
import List from '@mui/icons-material/List';
import ViewModule from '@mui/icons-material/ViewModule';
import { Box, Button, ButtonGroup, IconButton, LinearProgress, Tooltip, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { use } from 'react';

export default function Wishlist(props: { params: Promise<{ id: string }> }) {
    const t = useTranslations();
    const notifications = useNotifications();
    const params = use(props.params);
    const id = parseInt(params.id, 10);
    const wishlistsStore = useWishlistsStore();
    const { refresh, loading, wishlists, deleteItem, MassEditItems, setCurrentWishlistId, currentWishlist, sortItems, previewItems, importErrors } = wishlistsStore;
    const [sortBy, setSortBy] = React.useState('');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [selectedItems, setSelectedItems] = React.useState<number[]>([]);
    const [showWantsDialog, setShowWantsDialog] = React.useState(false);
    const [wantsDialogItem, setWantsDialogItem] = React.useState<WishlistItem | null | undefined>(null);
    const [showListDialog, setShowListDialog] = React.useState(false);
    const [showShareDialog, setShowShareDialog] = React.useState(false);
    const [showImportDialog, setShowImportDialog] = React.useState(false);
    const [showRenameDialog, setShowRenameDialog] = React.useState(false);
    const { data: session } = useSession();
    const [viewMode, setViewMode] = React.useState(session?.settings?.find((setting: any) => setting.name === 'wishlistView')?.value || 'list');
    const [shareLink, setShareLink] = React.useState('');
    const router = useRouter();

    React.useEffect(() => {
        setCurrentWishlistId(id);
        refresh();

        if (session) {
            if (session.settings && session.settings.find((setting: any) => setting.name === 'wishlistView')) {
                const viewMode = session.settings.find((setting: any) => setting.name === 'wishlistView');
                setViewMode(viewMode.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultWishlistSort')) {
                const sortBy = session.settings.find((setting: any) => setting.name === 'defaultWishlistSort');
                setSortBy(sortBy.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultWishlistSortDirection')) {
                const sortOrder = session.settings.find((setting: any) => setting.name === 'defaultWishlistSortDirection');
                setSortOrder(sortOrder.value);
            }
        }
        setShareLink(
            window.location.origin +
                '/shared/wishlist/' +
                btoa(`THIS_1S_A_S4L7_TO_HIDE_TH3_ID_J|_|ST_IN_C^SE_${currentWishlist && currentWishlist['mtg.wishlist'] && currentWishlist['mtg.wishlist'].id}`)
        );
    }, [session]);

    if (!id) return null;

    if (wishlists === undefined) return null;

    const setSort = (column: string) => {
        let newSortorder = 'asc';
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            newSortorder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            setSortOrder('asc');
        }
        setSortBy(column);
        sortItems(column, newSortorder);
    };

    const sort = () => {
        sortItems(sortBy, sortOrder);
    };

    const handleDelete = (id: number) => {
        deleteItem(id).then(() => {
            handleCheckboxChange(id, false);
            refresh();
            sort();
        });
    };

    const handleSelectAllToggle = (checked: boolean) => {
        if (checked) {
            setSelectedItems(currentWishlist && currentWishlist.items ? currentWishlist.items?.map((i: any) => i.id) : []);
        } else {
            setSelectedItems([]);
        }
    };

    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter((i: number) => i !== id));
        }
    };

    const handleMassDelete = () => {
        let counter = selectedItems.length;
        selectedItems.forEach((id: number) => {
            handleCheckboxChange(id, false);
            deleteItem(id).then(() => {
                counter--;
                if (counter === 0) {
                    notifications.addSuccessNotification(
                        t('wishlists.notifications.successMassDelete', {
                            count: selectedItems.length,
                        })
                    );
                    setSelectedItems([]);
                    refresh();
                    sort();
                }
            });
        });
    };

    const handleEdit = (id: number) => {
        if (!currentWishlist) return;
        setWantsDialogItem(currentWishlist && currentWishlist.items ? currentWishlist.items.find((i: WishlistItem) => i.id === id) : null);
        setShowWantsDialog(true);
    };

    const handleDeleteList = () => {
        apiRequest(`${ENDPOINTS.API.WISHLISTS.DELETE}/${id}`).then((res: any) => {
            if (res.success) {
                notifications.addSuccessNotification(t('wishlists.notifications.successDelete'));
            } else {
                notifications.addErrorNotification(t('wishlists.notifications.errorDelete'));
            }
        });
        router.push('/wishlists');
    };

    const submitMassEdit = (values: any) => {
        const selectedIds: number[] = [];
        selectedItems.forEach((id: number) => selectedIds.push(id));
        MassEditItems(id, selectedIds, values).then((res: any) => {
            if (res.success) {
                notifications.addSuccessNotification(
                    t('wishlists.notifications.successMassEdit', {
                        count: res.count,
                    })
                );
            } else {
                notifications.addErrorNotification(t('wishlists.notifications.errorMassEdit'));
            }
            refresh();
        });
        setSelectedItems([]);
        refresh();
        sort();
    };

    return (
        <>
            {!currentWishlist && <LinearProgress sx={{ mt: 5 }} />}
            {currentWishlist && (
                <>
                    <BasicBreadcrumbs
                        current={`${t(`wishlists.singleCardDialog.wishlist`)} - ${currentWishlist && currentWishlist['mtg.wishlist'] ? currentWishlist['mtg.wishlist'].name : null}`}
                        previous={[{ text: t(`wishlists.title`), url: '/wishlists' }]}
                    />
                    <SingleCardWishlistDialog
                        show={showWantsDialog}
                        setShow={setShowWantsDialog}
                        card={null}
                        wishlistItem={wantsDialogItem}
                        wishlistId={currentWishlist && currentWishlist['mtg.wishlist'] && currentWishlist['mtg.wishlist'].id ? currentWishlist['mtg.wishlist'].id : 0}
                    />
                    <SingleCardListWishlistDialog
                        show={showListDialog}
                        setShow={setShowListDialog}
                        wishlistId={currentWishlist && currentWishlist['mtg.wishlist'] && currentWishlist['mtg.wishlist'].id ? currentWishlist['mtg.wishlist'].id : 0}
                    />
                    <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
                        {`${t(`wishlists.singleCardDialog.wishlist`)} - ${currentWishlist && currentWishlist['mtg.wishlist'] ? currentWishlist['mtg.wishlist'].name : null}`}
                        {currentWishlist && (
                            <Tooltip title={t('wishlists.singleCardDialog.share')}>
                                <IconButton onClick={() => setShowShareDialog(true)}>
                                    <Share />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title={t('wishlists.changeName')}>
                            <IconButton aria-label='change wishlist name' onClick={() => setShowRenameDialog(true)}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('wishlists.deleteWishlist')}>
                            <IconButton aria-label='delete wishlist' onClick={() => handleDeleteList()}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <>
                        <Box sx={{ mt: 2, mb: 2, height: '32px' }}>
                            <Button component='a' variant='outlined' startIcon={<FileDownload />} href={`/api/wishlists/export/${id}`}>
                                {t('wishlists.single.export')}
                            </Button>
                            <Button sx={{ ml: 2 }} variant='outlined' startIcon={<FileUpload />} onClick={() => setShowImportDialog(true)}>
                                {t('wishlists.single.import')}
                            </Button>
                            <ButtonGroup className='view-mode-buttons' variant='outlined' aria-label='Basic button group' sx={{ float: 'right' }}>
                                <Button
                                    role='button'
                                    aria-pressed={viewMode === 'list'}
                                    onClick={() => {
                                        setViewMode('list');
                                    }}
                                >
                                    <List />
                                </Button>
                                <Button
                                    role='button'
                                    aria-pressed={viewMode === 'tiles'}
                                    onClick={() => {
                                        setViewMode('tiles');
                                    }}
                                >
                                    <ViewModule />
                                </Button>
                            </ButtonGroup>
                            <Button
                                variant='contained'
                                startIcon={<Add />}
                                onClick={() => {
                                    setWantsDialogItem(null);
                                    setShowWantsDialog(true);
                                }}
                                sx={{ float: 'right', mr: 1 }}
                            >
                                {t('wishlists.single.addItem')}
                            </Button>
                            <Button
                                variant='outlined'
                                startIcon={<Add />}
                                onClick={() => {
                                    setShowListDialog(true);
                                }}
                                sx={{ float: 'right', mr: 1 }}
                            >
                                {t('wishlists.single.addItemList')}
                            </Button>
                        </Box>
                        {loading && <LinearProgress sx={{ mt: 5 }} />}
                        {!loading && (
                            <Box sx={{ position: 'relative' }}>
                                {selectedItems.length > 0 && <WishlistMassEditPanel submitMassEdit={submitMassEdit} handleMassDelete={handleMassDelete} />}
                                <Typography variant='body1' sx={{ mt: 2 }}>
                                    {t('wishlists.single.totalItems', {
                                        count: currentWishlist && currentWishlist.items ? currentWishlist?.items.length : 0,
                                    })}
                                    {selectedItems.length > 0 && <span>{` | ${t('wishlists.single.selectedItems', { count: selectedItems.length })}`}</span>}
                                </Typography>
                            </Box>
                        )}
                        {!loading && previewItems.length > 0 && viewMode === 'list' && <WishlistPreviewItemsList items={previewItems} importErrors={importErrors} />}
                        {!loading && currentWishlist && viewMode === 'list' && (
                            <WishlistItemsList
                                handleSelectAllToggle={handleSelectAllToggle}
                                setSort={setSort}
                                wishlist={currentWishlist}
                                sortOrder={sortOrder}
                                sortBy={sortBy}
                                selectedItems={selectedItems}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                        )}
                        {!loading && previewItems.length > 0 && viewMode === 'tiles' && <WishlistPreviewItemsTiles items={previewItems} importErrors={importErrors} />}
                        {!loading && currentWishlist && viewMode === 'tiles' && (
                            <WishlistItemsTiles
                                handleSelectAllToggle={handleSelectAllToggle}
                                setSort={setSort}
                                wishlist={currentWishlist}
                                sortOrder={sortOrder}
                                sortBy={sortBy}
                                selectedItems={selectedItems}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                        )}
                    </>
                    <WishlistShareDialog show={showShareDialog} setShow={setShowShareDialog} shareLink={shareLink} />
                    <WishlistImportDialog show={showImportDialog} setShow={setShowImportDialog} />
                    <WishlistRenameDialog
                        show={showRenameDialog}
                        setShow={setShowRenameDialog}
                        name={(currentWishlist && currentWishlist['mtg.wishlist'] && currentWishlist['mtg.wishlist'].name) || ''}
                        id={id}
                    />
                </>
            )}
        </>
    );
}
