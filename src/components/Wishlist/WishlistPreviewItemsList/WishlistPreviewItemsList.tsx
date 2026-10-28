import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { magicSetCodeToNameMapping } from '@/src/lib/mappings/magicSetCodeToNameMapping';
import { WishlistItem } from '@/src/store/types';
import { useWishlistsStore } from '@/src/store/wishlists';
import { formatStringForUrl } from '@/src/utils/helpers';
import { BrokenImage, Brush, ChatBubble, Check, Gesture, GMobiledata, Star } from '@mui/icons-material';
import { Alert, Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import CardImageTooltip from '../../CardImageTooltip/CardImageTooltip';
import ImageWithFallback from '../../ImageWithFallback/ImageWithFallback';

export default function WishlistPreviewItemsList({ items, importErrors }: { items: WishlistItem[]; importErrors: string[] }) {
    const t = useTranslations();
    const { setPreviewItems, addItem, refresh } = useWishlistsStore();
    const notifications = useNotifications();

    const handleImport = async (items: WishlistItem[]) => {
        for (const item of items) {
            await addItem(item).then((res: any) => {
                if (res.success) {
                    notifications.addSuccessNotification(t('wishlists.notifications.successAddSingleCard'));
                    refresh();
                } else {
                    notifications.addErrorNotification(t('wishlists.notifications.errorAddSingleCard'));
                }
            });
        }
        setPreviewItems([]);
    };

    return (
        <>
            <Typography variant='h5' sx={{ color: 'secondary.main', mt: 2, mb: 1 }}>
                {t('wishlists.single.preview')}
            </Typography>
            <Button
                variant='contained'
                color='secondary'
                onClick={() => {
                    handleImport(items);
                }}
            >
                {t('wishlists.single.savePreview')}
            </Button>
            <Button
                variant='outlined'
                color='secondary'
                sx={{ ml: 1 }}
                onClick={() => {
                    setPreviewItems([]);
                }}
            >
                {t('wishlists.single.dismissPreview')}
            </Button>
            {importErrors && importErrors.length > 0 && (
                <Alert severity='error' sx={{ mt: 2 }}>
                    {importErrors.map((error, index) => (
                        <Box key={`import-error-${index}`}>{error}</Box>
                    ))}
                </Alert>
            )}
            <TableContainer component={Paper} sx={{ mb: 2, mt: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label='simple table' component={'div'}>
                    <TableHead component={'div'}>
                        <TableRow
                            sx={{
                                backgroundColor: 'secondary.main',
                                color: 'secondary.contrastText',
                                span: { color: 'secondary.contrastText' },
                            }}
                            component={'div'}
                        >
                            <TableCell component={'span'} sx={{ width: '5px', minWidth: '5px' }}></TableCell>
                            <TableCell component={'span'} align='center'></TableCell>
                            <TableCell component={'span'}>{t('wishlists.addDialog.name')}</TableCell>
                            <TableCell component={'span'} align='center'>
                                {t('inventory.inventoryColumns.set')}
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                {t('inventory.inventoryColumns.language')}
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                {t('wishlists.singleCardDialog.quality')}
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                <Tooltip title={t('wishlists.addDialog.description')}>
                                    <ChatBubble />
                                </Tooltip>
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                <Tooltip title={t('inventory.inventoryColumns.foil')}>
                                    <Star />
                                </Tooltip>
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                <Tooltip title={t('inventory.inventoryColumns.altered')}>
                                    <Brush />
                                </Tooltip>
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                <Tooltip title={t('inventory.inventoryColumns.signed')}>
                                    <Gesture />
                                </Tooltip>
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                <Tooltip title={t('inventory.inventoryColumns.misprint')}>
                                    <BrokenImage />
                                </Tooltip>
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                <Tooltip title={t('inventory.inventoryColumns.graded')}>
                                    <GMobiledata />
                                </Tooltip>
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                {t('wishlists.single.maxPrice')}
                            </TableCell>
                            <TableCell component={'span'} align='center'>
                                {t('inventory.inventoryColumns.quantity')}
                            </TableCell>
                            <TableCell component={'span'} align='center'></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody component={'div'}>
                        {items.map((item: any, index: number) => (
                            <TableRow component='div' key={`wants-preview-row-${index}`}>
                                <TableCell component={'span'} align='center'></TableCell>
                                <TableCell component={'span'} align='center'>
                                    <CardImageTooltip card={item} />
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    <Link
                                        href={{
                                            pathname: `/magic/ANY/products/singles/${formatStringForUrl(item.name)}`,
                                            query: {
                                                uuid: item.uuid,
                                            },
                                        }}
                                    >
                                        {item.name}
                                    </Link>
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.setCodes.split(',').map((setCode: string, setIndex: number) => {
                                        return setCode === '%' ? (
                                            <span key={`set-image-${index}-${setIndex}`}>{t('noMatter')}</span>
                                        ) : (
                                            <Tooltip key={`set-image-${index}-${setIndex}`} title={magicSetCodeToNameMapping[setCode as keyof typeof magicSetCodeToNameMapping]}>
                                                <ImageWithFallback
                                                    height={20}
                                                    width={20}
                                                    className='invertFilter'
                                                    src={`/images/magic/editions/${setCode.toLowerCase()}.svg`}
                                                    fallbackSrc={`/images/magic/editions/fallback.svg`}
                                                    alt={magicSetCodeToNameMapping[setCode as keyof typeof magicSetCodeToNameMapping]}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.language.split(',').map((language: string, langIndex: number) => {
                                        return language === '%' ? (
                                            <span key={`language-${index}-${langIndex}`}>{t('noMatter')}</span>
                                        ) : (
                                            <Box key={`language-${index}-${langIndex}`}>
                                                <Image height={20} width={30} alt={t(`localeStrings.${language}`)} src={`/images/flags/${language}.gif`} />
                                            </Box>
                                        );
                                    })}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.quality}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.comment ? (
                                        <Tooltip title={item.comment}>
                                            <IconButton>
                                                <ChatBubble />
                                            </IconButton>
                                        </Tooltip>
                                    ) : null}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.isFoil ? <Check /> : ''}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.isAltered ? <Check /> : ''}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.isSigned ? <Check /> : ''}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.isMisprint ? <Check /> : ''}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.isGraded ? <Check /> : ''}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.price !== 0 ? item.price : '-'}
                                </TableCell>
                                <TableCell component={'span'} align='center'>
                                    {item.quantity}
                                </TableCell>
                                <TableCell component={'span'} align='center'></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
