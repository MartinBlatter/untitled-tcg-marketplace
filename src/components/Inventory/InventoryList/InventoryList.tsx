import { apiRequest } from '@/src/actions/apiRequest';
import { submitItemChangeAction } from '@/src/actions/inventory';
import { uploadItemFileAction } from '@/src/actions/upload';
import CardImageBadge from '@/src/components/CardImageBadge/CardImageBadge';
import CardImageTooltip from '@/src/components/CardImageTooltip/CardImageTooltip';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { CardSet } from '@/src/types/AllMTGJSONTypes';
import { buildProductLink } from '@/src/utils/helpers';
import { BrokenImage, Brush, ChatBubble, Check, Comment, Delete, Gesture, GMobiledata, InsertPhoto, LibraryAdd, Remove, Sell, ShoppingCart, Star } from '@mui/icons-material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
    Button,
    CircularProgress,
    IconButton,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { ReactElement } from 'react';
import * as yup from 'yup';
import ImageWithFallback from '../../ImageWithFallback/ImageWithFallback';
import VisuallyHiddenInput from '../../VisuallyHiddenInput/VisuallyHiddenInput';
import { InventoryListProps } from './types';

const InventoryList = ({ inventory, loading = false, triggerRefresh, setSortBy, sortBy, sortOrder, isPublic = false, removeItem }: InventoryListProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const { adding, addShoppingCartItem } = useShoppingCartStore();
    const { data: session } = useSession();
    const router = useRouter();

    function submitItemChange(values: { price: number; quantity: number }, id: number, isListed: boolean) {
        submitItemChangeAction(values, id, isListed).then((res) => {
            if (res) {
                notifications.addSuccessNotification(t('inventory.successUpdate'));
                triggerRefresh();
            } else {
                notifications.addErrorNotification(t('inventory.errorUpdate'));
            }
        });
    }

    function deleteItem(id: number) {
        apiRequest(ENDPOINTS.API.INVENTORY.ITEM, 'DELETE', { id: id }).then((res) => {
            if (res) {
                notifications.addSuccessNotification(t('inventory.successDelete'));
                triggerRefresh();
            } else {
                notifications.addErrorNotification(t('inventory.errorDelete'));
            }
        });
    }

    function cloneItem(id: number) {
        apiRequest(ENDPOINTS.API.INVENTORY.ITEM_CLONE, 'POST', { id: id }).then((res) => {
            if (res) {
                notifications.addSuccessNotification(t('inventory.successClone'));
                triggerRefresh();
            } else {
                notifications.addErrorNotification(t('inventory.errorClone'));
            }
        });
    }

    function uploadItemFile(id: string, file: File) {
        uploadItemFileAction(id, file).then((res) => {
            if (res) {
                notifications.addSuccessNotification(t('inventory.successUpload'));
                triggerRefresh();
            } else {
                notifications.addErrorNotification(t('inventory.errorUpload'));
            }
        });
    }

    const addItemToCart = (item: any, name: string, quantity: number) => {
        if (!session) {
            router.push(INTERNAL_ROUTES.LOGIN);
            return;
        }

        if (quantity <= 0 || quantity > item.quantity) {
            notifications.addErrorNotification(t('inventory.errorAddToCart'));
            return;
        }

        const shoppingCartItem = {
            game: 'mtg',
            foreignKeySource: 'inventory',
            foreignKey: item.inventoryId,
            quantity: quantity,
            price: item.inventoryPrice,
            displayName: name,
            sellerId: item.userId,
        };
        addShoppingCartItem(shoppingCartItem)
            .then((res: any) => {
                if (res.success && removeItem) {
                    notifications.addSuccessNotification(t('inventory.successAddToCart'));
                    removeItem(item.inventoryId);
                } else {
                    notifications.addErrorNotification(t('inventory.errorAddToCart'));
                }
            })
            .catch((e) => {
                notifications.addErrorNotification(t('inventory.errorAddToCart'));
            });
    };

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table' component={'div'}>
                <TableHead component={'div'}>
                    <TableRow
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            span: { color: 'primary.contrastText' },
                        }}
                        component={'div'}
                    >
                        <TableCell component={'span'} sx={{ width: '5px', minWidth: '5px' }} />
                        <TableCell component={'span'} onClick={() => setSortBy('name')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.name')} {(sortBy as unknown as string) === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center'></TableCell>
                        <TableCell component={'span'} align='center'></TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('setCode')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.set')} {(sortBy as unknown as string) === 'setCode' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('number')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.number')} {(sortBy as unknown as string) === 'number' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('rarity')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.rarity')} {(sortBy as unknown as string) === 'rarity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('inventoryLanguage')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.language')} {(sortBy as unknown as string) === 'inventoryLanguage' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('inventoryComment')} sx={{ cursor: 'pointer' }}>
                            <Tooltip title={t('inventory.inventoryColumns.comment')}>
                                <Comment />
                            </Tooltip>{' '}
                            {(sortBy as unknown as string) === 'inventoryComment' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        {!isPublic && (
                            <TableCell component={'span'} align='center' onClick={() => setSortBy('inventoryInternalComment')} sx={{ cursor: 'pointer' }}>
                                <Tooltip title={t('inventory.inventoryColumns.internalComment')}>
                                    <ChatBubble />
                                </Tooltip>{' '}
                                {(sortBy as unknown as string) === 'inventoryInternalComment' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                            </TableCell>
                        )}
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('inventoryPrice')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.price')} {(sortBy as unknown as string) === 'inventoryPrice' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('inventoryQuantity')} sx={{ cursor: 'pointer' }}>
                            {t('inventory.inventoryColumns.quantity')} {(sortBy as unknown as string) === 'inventoryQuantity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center'></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody component={'div'}>
                    {loading ? (
                        <TableRow component={'div'}>
                            <TableCell align='center' component={'div'}></TableCell>
                            {(() => {
                                const loadingCells = [];
                                const columns = isPublic ? 11 : 12;

                                for (let i = 0; i < columns; i++) {
                                    loadingCells.push(
                                        <TableCell key={`loading-cell-${i}`} align='center' component={'div'}>
                                            <LinearProgress />
                                        </TableCell>
                                    );
                                }

                                return loadingCells;
                            })()}
                        </TableRow>
                    ) : null}
                    {!loading && ((inventory && inventory.length === 0) || inventory === undefined) ? (
                        <TableRow>
                            <TableCell align='center' colSpan={13}>
                                {t('appBar.searchField.noResults')}
                            </TableCell>
                        </TableRow>
                    ) : null}
                    {!loading &&
                        inventory &&
                        inventory.length > 0 &&
                        (() => {
                            const loadingCells: any[] = [];
                            const validationSchema = yup.object({
                                price: yup.string().required(t('errors.required')),
                                quantity: yup.string().required(t('errors.required')),
                            });

                            inventory.forEach((cards, index) => {
                                loadingCells.push(
                                    <Formik
                                        key={`form-${index}`}
                                        initialValues={{
                                            price: cards.inventoryPrice || '',
                                            quantity: cards.inventoryQuantity || '',
                                        }}
                                        validationSchema={validationSchema}
                                        onSubmit={(values) => {
                                            submitItemChange(values, cards.id, cards.inventoryIsListed);
                                        }}
                                    >
                                        {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
                                            <TableRow
                                                sx={{
                                                    '&:nth-of-type(odd)': {
                                                        backgroundColor: 'action.hover',
                                                    },
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                }}
                                                key={`inventory-item-${index}`}
                                                component={'div'}
                                            >
                                                <TableCell
                                                    align='center'
                                                    scope='row'
                                                    sx={{
                                                        width: '5px',
                                                        minWidth: '5px',
                                                    }}
                                                    component={'span'}
                                                >
                                                    <CardImageTooltip card={cards as unknown as CardSet} />
                                                    {cards.inventoryImagePath && (
                                                        <Tooltip
                                                            title={
                                                                <React.Fragment>
                                                                    <CardImageBadge card={cards} imagePath={cards.inventoryImagePath} />
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
                                                    {!isPublic && (
                                                        <Button component='label' role={undefined} variant='text' tabIndex={-1}>
                                                            <CloudUploadIcon color={'action'} />
                                                            <form>
                                                                <VisuallyHiddenInput
                                                                    type='file'
                                                                    accept='image/png, image/gif, image/jpeg'
                                                                    onChange={(event) => {
                                                                        event.target.files && uploadItemFile(cards.inventoryId, event.target.files[0]);
                                                                    }}
                                                                />
                                                            </form>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell align='left' component={'span'}>
                                                    <a href={buildProductLink('magic', cards.setCode, cards.inventoryType, cards.name, cards.uuid)}>
                                                        {cards.name}
                                                        <Typography
                                                            variant='caption'
                                                            gutterBottom
                                                            sx={{
                                                                display: 'block',
                                                            }}
                                                        >
                                                            {cards.foreignName}
                                                        </Typography>
                                                    </a>
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    <Typography component='span'>{cards.inventoryQuality}</Typography>
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    {cards.inventoryIsFoil ? (
                                                        <Tooltip title={t('inventory.inventoryColumns.foil')}>
                                                            <Star />
                                                        </Tooltip>
                                                    ) : null}
                                                    {cards.inventoryIsAltered ? (
                                                        <Tooltip title={t('inventory.inventoryColumns.altered')}>
                                                            <Brush />
                                                        </Tooltip>
                                                    ) : null}
                                                    {cards.inventoryIsSigned ? (
                                                        <Tooltip title={t('inventory.inventoryColumns.signed')}>
                                                            <Gesture />
                                                        </Tooltip>
                                                    ) : null}
                                                    {cards.inventoryIsMisprint ? (
                                                        <Tooltip title={t('inventory.inventoryColumns.misprint')}>
                                                            <BrokenImage />
                                                        </Tooltip>
                                                    ) : null}
                                                    {cards.inventoryIsGraded ? (
                                                        <Tooltip title={`${cards.inventoryGradingCompany} ${cards.inventoryGrading}`}>
                                                            <GMobiledata />
                                                        </Tooltip>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    <ImageWithFallback
                                                        height={20}
                                                        width={20}
                                                        className='invertFilter'
                                                        src={`${INTERNAL_ROUTES.STATIC.IMAGES.MAGIC.EDITIONS}/${cards.setCode?.toLowerCase()}.svg`}
                                                        fallbackSrc={`${INTERNAL_ROUTES.STATIC.IMAGES.MAGIC.EDITIONS}/fallback.svg`}
                                                        alt={cards.setCode}
                                                    />
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    {cards.number}
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    <span className={`magic-rarity ${cards.rarity}`} />
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    <Image height={20} width={30} alt={t(`localeStrings.${cards.inventoryLanguage}`)} src={`/images/flags/${cards.inventoryLanguage}.gif`} />
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    {cards.inventoryComment ? (
                                                        <Tooltip title={cards.inventoryComment}>
                                                            <IconButton>
                                                                <Comment />
                                                            </IconButton>
                                                        </Tooltip>
                                                    ) : null}
                                                </TableCell>
                                                {!isPublic && (
                                                    <TableCell align='center' component={'span'}>
                                                        {cards.inventoryInternalComment ? (
                                                            <Tooltip title={cards.inventoryInternalComment}>
                                                                <IconButton>
                                                                    <ChatBubble />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : null}
                                                    </TableCell>
                                                )}
                                                <TableCell align='center' component={'span'}>
                                                    {!isPublic ? (
                                                        <TextField
                                                            sx={{
                                                                width: '100px',
                                                            }}
                                                            size='small'
                                                            type='number'
                                                            name='price'
                                                            slotProps={{
                                                                input: {
                                                                    inputProps: {
                                                                        step: '0.01',
                                                                    },
                                                                },
                                                            }}
                                                            value={values.price}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={touched.price && Boolean(errors.price)}
                                                        />
                                                    ) : (
                                                        `${cards.inventoryPrice} €`
                                                    )}
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    {!isPublic ? (
                                                        <TextField
                                                            size='small'
                                                            sx={{
                                                                width: '70px',
                                                            }}
                                                            type='number'
                                                            name='quantity'
                                                            value={values.quantity}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={touched.quantity && Boolean(errors.quantity)}
                                                        />
                                                    ) : cards.inventoryQuantity === 1 ? (
                                                        <TextField
                                                            size='small'
                                                            sx={{
                                                                width: '70px',
                                                            }}
                                                            type='number'
                                                            name='quantity'
                                                            disabled
                                                            value={values.quantity}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={touched.quantity && Boolean(errors.quantity)}
                                                        />
                                                    ) : (
                                                        <Select
                                                            size='small'
                                                            sx={{
                                                                width: '70px',
                                                            }}
                                                            name='quantity'
                                                            value={values.quantity}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={touched.quantity && Boolean(errors.quantity)}
                                                        >
                                                            {(() => {
                                                                const options: ReactElement[] = [];

                                                                for (let i = 1; i <= cards.inventoryQuantity; i++) {
                                                                    options.push(
                                                                        <MenuItem key={`${index}-quantity-${i}`} value={i}>
                                                                            {i}
                                                                        </MenuItem>
                                                                    );
                                                                }
                                                                return options;
                                                            })()}
                                                        </Select>
                                                    )}
                                                </TableCell>
                                                <TableCell align='center' component={'span'}>
                                                    {!isPublic ? (
                                                        <>
                                                            <Tooltip title={t('inventory.icons.delete')}>
                                                                <IconButton size='small' onClick={() => deleteItem(cards.inventoryId)}>
                                                                    <Delete fontSize='inherit' />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={t('inventory.icons.edit')}>
                                                                <span>
                                                                    <IconButton
                                                                        size='small'
                                                                        type='submit'
                                                                        onClick={() => submitItemChange(values, cards.inventoryId, cards.inventoryIsListed)}
                                                                        className={!dirty ? 'hidden' : ''}
                                                                        disabled={!dirty || Boolean(errors.price) || Boolean(errors.quantity)}
                                                                    >
                                                                        <Check fontSize='inherit' />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                            <Tooltip title={t('inventory.icons.clone')}>
                                                                <IconButton size='small' onClick={() => cloneItem(cards.inventoryId)}>
                                                                    <LibraryAdd fontSize='inherit' />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={cards.inventoryIsListed ? t('inventory.icons.unlist') : t('inventory.icons.list')}>
                                                                <span>
                                                                    <IconButton
                                                                        size='small'
                                                                        type='submit'
                                                                        onClick={() => submitItemChange(values, cards.inventoryId, !cards.inventoryIsListed)}
                                                                        sx={{
                                                                            width: '25%',
                                                                        }}
                                                                    >
                                                                        {cards.inventoryIsListed ? <Remove fontSize='inherit' /> : <Sell fontSize='inherit' />}
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {adding ? (
                                                                <CircularProgress size='20px' disableShrink />
                                                            ) : (
                                                                <IconButton onClick={() => addItemToCart(cards, cards.name, values.quantity)}>
                                                                    <ShoppingCart />
                                                                </IconButton>
                                                            )}
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Formik>
                                );
                            });

                            return loadingCells;
                        })()}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InventoryList;
