import { apiRequest } from '@/src/actions/apiRequest';
import { submitItemChangeAction } from '@/src/actions/inventory';
import { uploadItemFileAction } from '@/src/actions/upload';
import { ENDPOINTS } from '@/src/constants/endpoints';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { magicSetCodeToNameMapping } from '@/src/lib/mappings/magicSetCodeToNameMapping';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { buildProductLink } from '@/src/utils/helpers';
import { Check, Delete, LibraryAdd, Remove, Sell, ShoppingCart } from '@mui/icons-material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardActionArea,
    CardContent,
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useTranslations } from 'next-intl';
import { ReactElement } from 'react';
import * as yup from 'yup';
import SingleCardImage from '../../SingleCard/SingleCardImage/SingleCardImage';
import VisuallyHiddenInput from '../../VisuallyHiddenInput/VisuallyHiddenInput';
import { InventoryTilesProps } from './types';

const InventoryTiles = ({ inventory, loading = false, triggerRefresh, setSortBy, sortBy, sortOrder, isPublic = false, removeItem }: InventoryTilesProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const { adding, addShoppingCartItem } = useShoppingCartStore();
    const { data: session } = useSession();
    const router = useRouter();

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

    function submitItemChange(values: { price: number; quantity: number }, id: number, isListed: boolean) {
        submitItemChangeAction(values, id, isListed).then((res) => {
            if (res) {
                triggerRefresh();
            }
        });
    }

    function deleteItem(id: number) {
        apiRequest(ENDPOINTS.API.INVENTORY.ITEM, 'DELETE', { id: id }).then((res) => {
            if (res) {
                triggerRefresh();
            }
        });
    }

    function cloneItem(id: number) {
        apiRequest(ENDPOINTS.API.INVENTORY.ITEM_CLONE, 'POST', { id: id }).then((res) => {
            if (res) {
                triggerRefresh();
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

    const validationSchema = yup.object({
        price: yup.string().required(t('errors.required')),
        quantity: yup.string().required(t('errors.required')),
    });

    return (
        <>
            <FormControl size='small' sx={{ minWidth: 200, mt: 2 }}>
                <InputLabel id='select-sort-by-label'>{t('table.sortBy')}</InputLabel>
                <Select labelId='select-sort-by-label' id='select-sort-by' value={sortBy} label={t('table.sortBy')} onChange={(e) => setSortBy(e.target.value)}>
                    <MenuItem value='name'>{t('inventory.inventoryColumns.name')}</MenuItem>
                    <MenuItem value='setCode'>{t('inventory.inventoryColumns.set')}</MenuItem>
                    <MenuItem value='number'>{t('inventory.inventoryColumns.number')}</MenuItem>
                    <MenuItem value='rarity'>{t('inventory.inventoryColumns.rarity')}</MenuItem>
                    <MenuItem value='inventoryLanguage'>{t('inventory.inventoryColumns.language')}</MenuItem>
                    <MenuItem value='inventoryComment'>{t('inventory.inventoryColumns.comment')}</MenuItem>
                    <MenuItem value='inventoryInternalComment'>{t('inventory.inventoryColumns.internalComment')}</MenuItem>
                    <MenuItem value='inventoryPrice'>{t('inventory.inventoryColumns.price')}</MenuItem>
                    <MenuItem value='inventoryQuantity'>{t('inventory.inventoryColumns.quantity')}</MenuItem>
                </Select>
            </FormControl>
            <FormControl size='small' sx={{ minWidth: 200, mt: 2, ml: 2 }}>
                <InputLabel id='select-sort-order-label'>{t('table.sortOrder')}</InputLabel>
                <Select labelId='select-sort-order-label' id='select-sort-order' value={sortOrder} label={t('table.sortOrder')} onChange={(e) => setSortBy(sortBy)}>
                    <MenuItem value='asc'>{t('table.ascending')}</MenuItem>
                    <MenuItem value='desc'>{t('table.descending')}</MenuItem>
                </Select>
            </FormControl>
            <Grid container spacing={4} sx={{ mt: 2, justifyContent: 'left' }}>
                {loading && (
                    <>
                        {(() => {
                            const loadingCards = [];

                            for (let i = 0; i <= 3; i++) {
                                loadingCards.push(
                                    <Card key={`loader-card-${i}`} sx={{ width: '264px', height: '520px' }}>
                                        <CardContent>
                                            <LinearProgress />
                                        </CardContent>
                                    </Card>
                                );
                            }

                            return loadingCards;
                        })()}
                    </>
                )}
                {!loading && inventory && inventory.length === 0 ? <Typography variant='h6'>{t('appBar.searchField.noResults')}</Typography> : null}
                {!loading &&
                    inventory &&
                    inventory.length > 0 &&
                    inventory.map((card, index) => (
                        <Formik
                            key={`form-${card.inventoryId}`}
                            initialValues={{
                                price: card.inventoryPrice || '',
                                quantity: card.inventoryQuantity || '',
                            }}
                            validationSchema={validationSchema}
                            onSubmit={(values) => {
                                submitItemChange(values, card.inventoryId, card.isListed);
                            }}
                        >
                            {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
                                <Card
                                    key={card.inventoryId}
                                    sx={{
                                        width: '264px',
                                        position: 'relative',
                                    }}
                                >
                                    <CardActionArea component='div'>
                                        <SingleCardImage card={card} showOverlay />
                                        <CardContent>
                                            <a href={buildProductLink('magic', card.setCode, card.inventoryType, card.name, card.uuid)}>
                                                <Typography variant='h6'>
                                                    {card.name}
                                                    {!isPublic && (
                                                        <Button component='label' role={undefined} variant='text' tabIndex={-1}>
                                                            <CloudUploadIcon color={'action'} />
                                                            <form>
                                                                <VisuallyHiddenInput
                                                                    type='file'
                                                                    accept='image/png, image/gif, image/jpeg'
                                                                    onChange={(event) => {
                                                                        event.target.files && uploadItemFile(card.inventoryId, event.target.files[0]);
                                                                    }}
                                                                />
                                                            </form>
                                                        </Button>
                                                    )}
                                                </Typography>
                                                <Typography
                                                    color='textSecondary'
                                                    gutterBottom
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        display: 'block'
                                                    }}>
                                                    {card.foreignName}
                                                </Typography>
                                            </a>
                                            <Typography color='textSecondary'>
                                                {t('products.singleCard.set')}: {magicSetCodeToNameMapping[card.setCode as keyof typeof magicSetCodeToNameMapping]}
                                            </Typography>
                                            <Typography color='textSecondary'>
                                                {t('products.singleCard.number')}: {card.number}
                                            </Typography>
                                            <Typography color='textSecondary'>
                                                {t('products.singleCard.rarity')}: <span className={`capitalize`}>{card.rarity}</span>
                                            </Typography>
                                            <Typography color='textSecondary' component={'div'} sx={{
                                                mt: 1
                                            }}>
                                                <TextField
                                                    sx={{ width: '70%' }}
                                                    size='small'
                                                    type='number'
                                                    name='price'
                                                    label={t('products.singleCard.price')}
                                                    slotProps={{
                                                        input: {
                                                            inputProps: {
                                                                step: '0.01',
                                                            },
                                                            endAdornment: <InputAdornment position='start'>€</InputAdornment>,
                                                        },
                                                    }}
                                                    value={values.price}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.price && Boolean(errors.price)}
                                                    disabled={isPublic}
                                                />
                                                {!isPublic ? (
                                                    <TextField
                                                        size='small'
                                                        sx={{
                                                            width: '25%',
                                                            ml: 1,
                                                        }}
                                                        type='number'
                                                        name='quantity'
                                                        label={t('inventory.inventoryColumns.quantity')}
                                                        value={values.quantity}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.quantity && Boolean(errors.quantity)}
                                                    />
                                                ) : card.inventoryQuantity === 1 ? (
                                                    <TextField
                                                        size='small'
                                                        sx={{
                                                            width: '25%',
                                                            ml: 1,
                                                        }}
                                                        type='number'
                                                        name='quantity'
                                                        label={t('inventory.inventoryColumns.quantity')}
                                                        value={values.quantity}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.quantity && Boolean(errors.quantity)}
                                                        disabled
                                                    />
                                                ) : (
                                                    <Select
                                                        size='small'
                                                        sx={{
                                                            width: '25%',
                                                            ml: 1,
                                                        }}
                                                        name='quantity'
                                                        value={values.quantity}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.quantity && Boolean(errors.quantity)}
                                                    >
                                                        {(() => {
                                                            const options: ReactElement[] = [];

                                                            for (let i = 1; i <= card.inventoryQuantity; i++) {
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
                                            </Typography>
                                            <ButtonGroup variant='outlined' aria-label='Basic outlined button group' fullWidth sx={{ mt: 2 }}>
                                                {!isPublic ? (
                                                    <>
                                                        <Tooltip title={t('inventory.icons.delete')}>
                                                            <IconButton
                                                                size='medium'
                                                                onClick={() => deleteItem(card.inventoryId)}
                                                                sx={{
                                                                    width: '25%',
                                                                }}
                                                            >
                                                                <Delete fontSize='medium' />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={t('inventory.icons.edit')}>
                                                            <IconButton
                                                                size='medium'
                                                                type='submit'
                                                                onClick={() => submitItemChange(values, card.inventoryId, card.inventoryIsListed)}
                                                                sx={{
                                                                    width: '25%',
                                                                }}
                                                            >
                                                                <Check fontSize='medium' />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={t('inventory.icons.clone')}>
                                                            <IconButton
                                                                size='medium'
                                                                onClick={() => cloneItem(card.inventoryId)}
                                                                sx={{
                                                                    width: '25%',
                                                                }}
                                                            >
                                                                <LibraryAdd fontSize='medium' />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={card.inventoryIsListed ? t('inventory.icons.unlist') : t('inventory.icons.list')}>
                                                            <Box
                                                                component='span'
                                                                sx={{
                                                                    width: '25%',
                                                                }}
                                                            >
                                                                <IconButton
                                                                    size='medium'
                                                                    type='submit'
                                                                    onClick={() => submitItemChange(values, card.inventoryId, !card.inventoryIsListed)}
                                                                    sx={{
                                                                        width: '100%',
                                                                    }}
                                                                >
                                                                    {card.inventoryIsListed ? <Remove fontSize='medium' /> : <Sell fontSize='medium' />}
                                                                </IconButton>
                                                            </Box>
                                                        </Tooltip>
                                                    </>
                                                ) : (
                                                    <>
                                                        {adding ? (
                                                            <CircularProgress size='20px' disableShrink />
                                                        ) : (
                                                            <Button variant='outlined' size='medium' onClick={() => addItemToCart(card, card.name, values.quantity)}>
                                                                <ShoppingCart />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </ButtonGroup>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            )}
                        </Formik>
                    ))}
            </Grid>
        </>
    );
};

export default InventoryTiles;
