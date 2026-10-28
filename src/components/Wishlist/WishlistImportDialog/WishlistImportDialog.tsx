import { searchForCardByNameAndSet, searchForCardByScryfallId, searchForCardByUuid } from '@/src/actions/search';
import { manaBoxQualitiesMapping } from '@/src/constants/qualities';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { WishlistItem } from '@/src/store/types';
import { useWishlistsStore } from '@/src/store/wishlists';
import { Box, Button, Dialog, DialogContent, DialogTitle, Tab, Tabs, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import CsvReaderDragAndDrop from '../../CsvReaderDragAndDrop/CsvReaderDragandDrop';
import CustomTabPanel from '../../CustomTabPanel/CustomTabPanel';
import { NoMaxWidthTooltip } from '../../NoMaxWidthTooltip/NoMaxWidthTooltip';
import { WishlistImportDialogProps } from './types';

export default function WishlistImportDialog({ show, setShow }: WishlistImportDialogProps) {
    const t = useTranslations();
    const notifications = useNotifications();
    const { currentWishlistId, setPreviewItems, setImportErrors } = useWishlistsStore();
    const currentLocale = useLocale();
    const [tab, setTab] = React.useState(0);

    const handleManaBoxUpload = async (results: any) => {
        if (results) {
            const newItems: WishlistItem[] = [];
            if (results.data.length === 0) {
                notifications.addErrorNotification(t('wishlists.importDialog.errorEmpty'));
                return;
            }
            const errors: string[] = [];
            if (results.errors.length > 0) {
                results.errors.forEach((error: any) => errors.push(t('row') + ' ' + error.row + ' ' + error.message + ' '));
                setImportErrors(errors);
            }

            results.data.forEach((item: any, index: number) => {
                if (item.length !== 15) {
                    errors.push(t('row') + ' ' + (index + 1) + ' ' + t('wishlists.importDialog.errorInvalidLength') + '. ');
                    setImportErrors(errors);
                } else if (item[0] !== 'name') {
                    let card: any = null;
                    searchForCardByScryfallId(currentLocale, item[8]).then((data: any) => {
                        if (data) {
                            card = data;

                            const newItem = {
                                id: null,
                                wishlistId: currentWishlistId || 0,
                                uuid: card.uuid,
                                name: item[0],
                                setCodes: item[1] || '%',
                                language: item[13] || '%',
                                quality: manaBoxQualitiesMapping[item[12] as keyof typeof manaBoxQualitiesMapping] || 'PO',
                                quantity: item[6] || 1,
                                isFoil: item[4] && item[4] === 'foil' ? true : false,
                                isAltered: item[11] || 0,
                                isSigned: false,
                                isMisprint: item[10] || 0,
                                isGraded: false,
                                price: item[9] || 0,
                                comment: '',
                                updatedAt: '',
                                createdAt: '',
                                deactivatedAt: '',
                            };

                            newItems.push(newItem);
                            setPreviewItems(newItems);
                        }
                    });
                }
            });

            setImportErrors(errors);
            setShow(false);
        }
    };

    const handleUpload = async (results: any) => {
        if (results) {
            const newItems: WishlistItem[] = [];
            if (results.data.length === 0) {
                notifications.addErrorNotification(t('wishlists.importDialog.errorEmpty'));
                return;
            }
            const errors: string[] = [];
            if (results.errors.length > 0) {
                results.errors.forEach((error: any) => errors.push(t('row') + ' ' + error.row + ' ' + error.message + ' '));
                setImportErrors(errors);
            }

            results.data.forEach((item: any, index: number) => {
                if (item.length !== 13) {
                    errors.push(t('row') + ' ' + (index + 1) + ' ' + t('wishlists.importDialog.errorInvalidLength') + '. ');
                    setImportErrors(errors);
                } else if (item[0] === '' && item[1] === '') {
                    errors.push(t('row') + ' ' + (index + 1) + ' ' + t('wishlists.importDialog.errorRequiredMissing') + '. ');
                    setImportErrors(errors);
                } else {
                    if (item[0] !== 'uuid') {
                        let card: any = null;
                        if (item[0] === '') {
                            searchForCardByNameAndSet(currentLocale, item[1], item[2]).then((data: any) => {
                                if (data) {
                                    card = data;

                                    const newItem = {
                                        id: null,
                                        wishlistId: currentWishlistId || 0,
                                        uuid: card ? card.uuid : item[0],
                                        name: card ? card.name : item[1],
                                        setCodes: item[2] || '%',
                                        language: item[3] || '%',
                                        quality: item[4] || 'PO',
                                        quantity: item[5] || 1,
                                        isFoil: item[6] || 0,
                                        isAltered: item[7] || 0,
                                        isSigned: item[8] || 0,
                                        isMisprint: item[9] || 0,
                                        isGraded: item[10] || 0,
                                        price: item[11] || 0,
                                        comment: item[12],
                                        updatedAt: '',
                                        createdAt: '',
                                        deactivatedAt: '',
                                    };

                                    newItems.push(newItem);
                                    setPreviewItems(newItems);
                                }
                            });
                        } else if (item[0] !== '') {
                            searchForCardByUuid(currentLocale, item[0]).then((data: any) => {
                                if (data) {
                                    card = data;
                                    const newItem = {
                                        id: null,
                                        wishlistId: currentWishlistId || 0,
                                        uuid: card ? card.uuid : item[0],
                                        name: card ? card.name : item[1],
                                        setCodes: item[2] || '%',
                                        language: item[3] || '%',
                                        quality: item[4] || 'PO',
                                        quantity: item[5] || 1,
                                        isFoil: item[6] || 0,
                                        isAltered: item[7] || 0,
                                        isSigned: item[8] || 0,
                                        isMisprint: item[9] || 0,
                                        isGraded: item[10] || 0,
                                        price: item[11] || 0,
                                        comment: item[12],
                                        updatedAt: '',
                                        createdAt: '',
                                        deactivatedAt: '',
                                    };

                                    newItems.push(newItem);
                                    setPreviewItems(newItems);
                                }
                            });
                        }
                    }
                }
            });
            setImportErrors(errors);
            setShow(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newTab: number) => {
        setTab(newTab);
    };

    return (
        <Dialog open={show} onClose={() => setShow(false)} aria-labelledby='import-wishlist-dialog-title' aria-describedby='import-wishlist-dialog-title' sx={{ minWidth: '50%' }}>
            <DialogTitle id='import-wishlist-dialog-title'>{t('wishlists.importDialog.title')}</DialogTitle>
            <DialogContent sx={{ minWidth: '400px' }}>
                <Tabs value={tab} onChange={handleTabChange} aria-label='import tabs' sx={{ mb: 2 }}>
                    <Tab label={t('wishlists.importDialog.tab1')} />
                    <Tab label={t('wishlists.importDialog.tab2')} />
                </Tabs>
                <CustomTabPanel value={tab} index={0}>
                    <Typography variant='body1'>{t('wishlists.importDialog.description1')}</Typography>
                    <Typography variant='body1'>{t('wishlists.importDialog.description2')}</Typography>
                    <Button component='a' variant='text' href='/examples/wishlist.csv'>
                        {t('wishlists.importDialog.exampleDownload')}
                    </Button>
                    <NoMaxWidthTooltip
                        title={
                            <React.Fragment>
                                <Box sx={{ width: 800, height: 400 }}>
                                    <Image src='/examples/uuid.png' alt='Wishlist uuid example' width={800} height={400} />
                                </Box>
                            </React.Fragment>
                        }
                    >
                        <Button variant='text' sx={{ ml: 2 }}>
                            {t('wishlists.importDialog.uuidHint')}
                        </Button>
                    </NoMaxWidthTooltip>
                    <Typography variant='body1'>{t('wishlists.importDialog.description3')}</Typography>
                    <CsvReaderDragAndDrop handleUpload={handleUpload} />
                </CustomTabPanel>
                <CustomTabPanel value={tab} index={1}>
                    <Typography variant='body1'>{t('wishlists.importDialog.manaboxDescription1')}</Typography>
                    <Typography variant='body1' sx={{ mt: 1 }}>
                        {t('wishlists.importDialog.description3')}
                    </Typography>
                    <CsvReaderDragAndDrop handleUpload={handleManaBoxUpload} />
                </CustomTabPanel>
            </DialogContent>
        </Dialog>
    );
}
