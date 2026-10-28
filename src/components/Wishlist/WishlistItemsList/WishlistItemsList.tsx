import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { magicSetCodeToNameMapping } from '@/src/lib/mappings/magicSetCodeToNameMapping';
import { formatStringForUrl } from '@/src/utils/helpers';
import { BrokenImage, Brush, ChatBubble, Check, Delete, Edit, Gesture, GMobiledata, Star } from '@mui/icons-material';
import { Box, Checkbox, IconButton, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import CardImageTooltip from '../../CardImageTooltip/CardImageTooltip';
import ConfirmationDialog from '../../ConfirmationDialog/ConfirmationDialog';
import ImageWithFallback from '../../ImageWithFallback/ImageWithFallback';
import { WishlistItemsListProps } from './types';

export default function WishlistItemsList({ handleSelectAllToggle, setSort, wishlist, sortOrder, sortBy, selectedItems, handleCheckboxChange, handleDelete, handleEdit }: WishlistItemsListProps) {
    const t = useTranslations();

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table' component={wishlist.items.length === 0 ? 'table' : 'div'}>
                <TableHead component={'div'}>
                    <TableRow
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            span: { color: 'primary.contrastText' },
                        }}
                        component={'div'}
                    >
                        <TableCell component={'span'} sx={{ width: '5px', minWidth: '5px' }}>
                            {handleSelectAllToggle ? (
                                <Switch color='secondary' onChange={(event) => handleSelectAllToggle(event.target.checked)} slotProps={{ input: { 'aria-label': t('selectAll') } }} />
                            ) : null}
                        </TableCell>
                        <TableCell component={'span'} align='center'></TableCell>
                        <TableCell component={'span'} onClick={() => setSort('name')} sx={{ cursor: 'pointer' }}>
                            {t('wishlists.addDialog.name')} {(sortBy as unknown as string) === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('setCode')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.set')} {(sortBy as unknown as string) === 'setCode' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('language')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.language')} {(sortBy as unknown as string) === 'language' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('quality')} sx={{ cursor: 'pointer' }}>
                            {t('wishlists.singleCardDialog.quality')} {(sortBy as unknown as string) === 'quality' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('description')} sx={{ cursor: 'pointer' }}>
                            <Tooltip title={t('wishlists.addDialog.description')}>
                                <ChatBubble />
                            </Tooltip>{' '}
                            {(sortBy as unknown as string) === 'description' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('isFoil')} sx={{ cursor: 'pointer' }}>
                            <Tooltip title={t('inventory.inventoryColumns.foil')}>
                                <Star />
                            </Tooltip>{' '}
                            {(sortBy as unknown as string) === 'isFoil' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('isAltered')} sx={{ cursor: 'pointer' }}>
                            <Tooltip title={t('inventory.inventoryColumns.altered')}>
                                <Brush />
                            </Tooltip>{' '}
                            {(sortBy as unknown as string) === 'isAltered' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('isSigned')} sx={{ cursor: 'pointer' }}>
                            <Tooltip title={t('inventory.inventoryColumns.signed')}>
                                <Gesture />
                            </Tooltip>{' '}
                            {(sortBy as unknown as string) === 'isSigned' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('isMisprint')} sx={{ cursor: 'pointer' }}>
                            <Tooltip title={t('inventory.inventoryColumns.misprint')}>
                                <BrokenImage />
                            </Tooltip>{' '}
                            {(sortBy as unknown as string) === 'isMisprint' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('isGraded')} sx={{ cursor: 'pointer' }}>
                            <Tooltip title={t('inventory.inventoryColumns.graded')}>
                                <GMobiledata />
                            </Tooltip>{' '}
                            {(sortBy as unknown as string) === 'isGraded' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('price')} sx={{ cursor: 'pointer' }}>
                            {t('wishlists.single.maxPrice')} {(sortBy as unknown as string) === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSort('quantity')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.quantity')} {(sortBy as unknown as string) === 'quantity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center'></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody component={wishlist.items.length === 0 ? 'tbody' : 'div'}>
                    {wishlist.items.length === 0 && (
                        <TableRow sx={{ height: '50px' }}>
                            <TableCell colSpan={17}>{t('wishlists.single.noItems')}</TableCell>
                        </TableRow>
                    )}
                    {wishlist.items.map((item: any, index: number) => (
                        <TableRow component='div' key={`wants-row-${index}`}>
                            <TableCell component={'span'} align='center'>
                                {selectedItems ? (
                                    <Checkbox
                                        role='checkbox'
                                        aria-checked={selectedItems.includes(item.id)}
                                        checked={selectedItems.includes(item.id)}
                                        onChange={(e) => handleCheckboxChange && handleCheckboxChange(item.id, e.target.checked)}
                                    />
                                ) : null}
                            </TableCell>
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
                                            <Image height={20} width={30} alt={t(`localeStrings.${language}`)} src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${language}.gif`} />
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
                            <TableCell component={'span'} align='center'>
                                {handleDelete ? (
                                    <>
                                        <ConfirmationDialog title={t('inventory.icons.delete')} description={t('confirmation.delete')} response={() => handleDelete(item.id)}>
                                            {(showDialog) => (
                                                <Tooltip title={t('inventory.icons.delete')}>
                                                    <IconButton size='small' onClick={showDialog}>
                                                        <Delete fontSize='inherit' />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </ConfirmationDialog>
                                        <Tooltip title={t('inventory.icons.edit')}>
                                            <IconButton size='small' type='submit' onClick={() => handleEdit && handleEdit(item.id)}>
                                                <Edit fontSize='inherit' />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : null}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
