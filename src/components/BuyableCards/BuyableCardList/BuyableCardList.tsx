import { submitItemChangeAction } from '@/src/actions/inventory';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { useBuyableItemsStore } from '@/src/store/buyableItems';
import { useShoppingCartStore } from '@/src/store/shoppingcart';
import { BrokenImage, Brush, ChatBubble, Check, Gesture, GMobiledata, Remove, ShoppingCart, Star } from '@mui/icons-material';
import {
    Box,
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
import Link from 'next/link';
import React, { ReactElement } from 'react';
import * as yup from 'yup';
import BuyableCardFilters from '../BuyableCardFilters/BuyableCardFilters';

const BuyableCardList = ({ uuid, name }: { uuid: string; name: string }) => {
    const { loading, refresh, items, filteredItems, filters, hasFilters, setFilter, filterItems, resetFilters, removeItem } = useBuyableItemsStore();
    const t = useTranslations();
    const { data: session } = useSession();
    const router = useRouter();
    const notifications = useNotifications();
    const { adding, addShoppingCartItem } = useShoppingCartStore();
    React.useEffect(() => {
        refresh(uuid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validationSchema = yup.object({
        price: yup.string().required(t('errors.required')),
        quantity: yup.string().required(t('errors.required')),
    });

    // The populated table is rendered with div/span elements, so every row and cell has to follow
    // the same choice as the Table itself - a real <tr> inside a <div> is invalid HTML and the
    // browser hoists it out, which React reports as a hydration error.
    const isSemanticTable = filteredItems && filteredItems.length === 0;
    const tableComponent = isSemanticTable ? 'table' : 'div';
    const tableHeadComponent = isSemanticTable ? 'thead' : 'div';
    const tableBodyComponent = isSemanticTable ? 'tbody' : 'div';
    const rowComponent = isSemanticTable ? 'tr' : 'div';
    const cellComponent = isSemanticTable ? 'td' : 'span';

    function submitItemChange(values: { price: number; quantity: number }, id: number, isListed: boolean) {
        submitItemChangeAction(values, id, isListed)
            .then((res) => {
                if (res) {
                    notifications.addSuccessNotification(t('inventory.successUpdate'));
                    refresh(uuid);
                    filterItems();
                } else {
                    notifications.addErrorNotification(t('inventory.errorUpdate'));
                }
            })
            .catch((e) => {
                notifications.addErrorNotification(t('inventory.errorUpdate'));
            });
    }

    const addItemToCart = (item: any, name: string, quantity: number) => {
        if (!session) {
            router.push(INTERNAL_ROUTES.LOGIN);
            return;
        }

        if (quantity <= 0 || quantity > item.quantity) {
            quantity = item.quantity;
        }

        const shoppingCartItem = {
            game: 'mtg',
            foreignKeySource: 'inventory',
            foreignKey: item.id,
            quantity: quantity,
            price: item.price,
            displayName: name,
            sellerId: item.userId,
        };

        addShoppingCartItem(shoppingCartItem)
            .then((res: any) => {
                if (res.success) {
                    notifications.addSuccessNotification(t('inventory.successAddToCart'));
                    removeItem(item.id, quantity);
                } else {
                    notifications.addErrorNotification(t('inventory.errorAddToCart'));
                }
            })
            .catch((e) => {
                notifications.addErrorNotification(t('inventory.errorAddToCart'));
            });
    };

    React.useEffect(() => {
        if (session) {
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productDetailViewFilterCountry')) {
                const countryFilter = session.settings.find((setting: any) => setting.name === 'productDetailViewFilterCountry');
                setFilter('country', countryFilter.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productDetailViewFilterQuality')) {
                const qualityFilter = session.settings.find((setting: any) => setting.name === 'productDetailViewFilterQuality');
                setFilter('quality', qualityFilter.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productDetailViewFilterLanguage')) {
                const languageFilter = session.settings.find((setting: any) => setting.name === 'productDetailViewFilterLanguage');
                setFilter(
                    'language',
                    languageFilter.value.split(',').filter(function (e: any) {
                        return e !== '';
                    })
                );
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productDetailViewFilterFoil')) {
                const foilFilter = session.settings.find((setting: any) => setting.name === 'productDetailViewFilterFoil');
                setFilter('isFoil', foilFilter.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productDetailViewFilterSigned')) {
                const signedFilter = session.settings.find((setting: any) => setting.name === 'productDetailViewFilterSigned');
                setFilter('isSigned', signedFilter.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productDetailViewFilterAltered')) {
                const alteredFilter = session.settings.find((setting: any) => setting.name === 'productDetailViewFilterAltered');
                setFilter('isAltered', alteredFilter.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productDetailViewFilterMisprint')) {
                const misprintFilter = session.settings.find((setting: any) => setting.name === 'productDetailViewFilterMisprint');
                setFilter('isMisprint', misprintFilter.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productDetailViewFilterGraded')) {
                const gradedFilter = session.settings.find((setting: any) => setting.name === 'productDetailViewFilterGraded');
                setFilter('isGraded', gradedFilter.value);
            }
        }
    }, [session]);

    return (
        <>
            <BuyableCardFilters filters={filters} setFilter={setFilter} hasFilters={hasFilters} items={items} resetFilters={resetFilters} />
            <Typography variant='body1' sx={{ mt: 2 }}>
                {t('products.buylist.numberOfItems', {
                    count: items && items.length,
                })}
            </Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size='small' aria-label='buyable items table' component={tableComponent}>
                    <TableHead component={tableHeadComponent}>
                        <TableRow
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                'span, td': { color: 'primary.contrastText' },
                            }}
                            component={rowComponent}
                        >
                            <TableCell component={cellComponent} align='center'>
                                {t('products.buylist.table.country')}
                            </TableCell>
                            <TableCell component={cellComponent} align='center'>
                                {t('products.buylist.table.user')}
                            </TableCell>
                            <TableCell component={cellComponent} align='center'>
                                {t('products.buylist.table.quality')}
                            </TableCell>
                            <TableCell component={cellComponent} align='center'>
                                {t('products.buylist.table.language')}
                            </TableCell>
                            <TableCell component={cellComponent} align='center'>
                                {t('products.buylist.table.price')}
                            </TableCell>
                            <TableCell component={cellComponent} align='center'>
                                {t('products.buylist.table.quantity')}
                            </TableCell>
                            <TableCell component={cellComponent} align='center'></TableCell>
                            <TableCell component={cellComponent} align='center'></TableCell>
                            <TableCell component={cellComponent} align='center'></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody component={tableBodyComponent}>
                        {loading ? (
                            <TableRow component={rowComponent}>
                                {(() => {
                                    const loadingCells = [];

                                    for (let i = 0; i < 9; i++) {
                                        loadingCells.push(
                                            <TableCell component={cellComponent} key={`loading-cell-${i}`} align='center'>
                                                <LinearProgress />
                                            </TableCell>
                                        );
                                    }

                                    return loadingCells;
                                })()}
                            </TableRow>
                        ) : null}
                        {!loading && filteredItems && filteredItems.length === 0 ? (
                            <TableRow component={rowComponent}>
                                <TableCell component={cellComponent} align='center' colSpan={9}>
                                    {t('appBar.searchField.noResults')}
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {!loading && filteredItems && filteredItems.length > 0
                            ? filteredItems
                                  .filter((item) => (session ? item.user === session.userName : false))
                                  .map((item, index) => (
                                      <Formik
                                          key={`form-${index}`}
                                          initialValues={{
                                              price: item.price,
                                              quantity: item.quantity,
                                          }}
                                          validationSchema={validationSchema}
                                          onSubmit={(values) => {
                                              submitItemChange(values, item.id, true);
                                          }}
                                      >
                                          {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
                                              <TableRow
                                                  key={item.id}
                                                  component={'div'}
                                                  sx={{
                                                      ':hover': {
                                                          backgroundColor: 'action.hover',
                                                      },
                                                  }}
                                              >
                                                  <TableCell component={'span'} align='center'>
                                                      <Box
                                                          component='img'
                                                          sx={{
                                                              height: 20,
                                                              mt: '8px',
                                                          }}
                                                          alt={t(`localeStrings.${item.country.toLowerCase()}`)}
                                                          src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${item.country.toLowerCase()}.gif`}
                                                      />
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      {item.user}
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      {item.quality}
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      <Image height={20} width={30} alt={t(`localeStrings.${item.language}`)} src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${item.language}.gif`} />
                                                  </TableCell>
                                                  <TableCell align='center' component={'span'}>
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
                                                  </TableCell>
                                                  <TableCell align='center' component={'span'}>
                                                      <TextField
                                                          size='small'
                                                          sx={{ width: '70px' }}
                                                          type='number'
                                                          name='quantity'
                                                          value={values.quantity}
                                                          onChange={handleChange}
                                                          onBlur={handleBlur}
                                                          error={touched.quantity && Boolean(errors.quantity)}
                                                      />
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      {item.comment && (
                                                          <Tooltip title={item.comment}>
                                                              <ChatBubble />
                                                          </Tooltip>
                                                      )}
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      {item.isFoil ? (
                                                          <Tooltip title={t('inventory.inventoryColumns.foil')}>
                                                              <Star />
                                                          </Tooltip>
                                                      ) : null}
                                                      {item.isAltered ? (
                                                          <Tooltip title={t('inventory.inventoryColumns.altered')}>
                                                              <Brush />
                                                          </Tooltip>
                                                      ) : null}
                                                      {item.isSigned ? (
                                                          <Tooltip title={t('inventory.inventoryColumns.signed')}>
                                                              <Gesture />
                                                          </Tooltip>
                                                      ) : null}
                                                      {item.isMisprint ? (
                                                          <Tooltip title={t('inventory.inventoryColumns.misprint')}>
                                                              <BrokenImage />
                                                          </Tooltip>
                                                      ) : null}
                                                      {item.isGraded ? (
                                                          <Tooltip title={`${item.gradingCompany} ${item.grading}`}>
                                                              <GMobiledata />
                                                          </Tooltip>
                                                      ) : null}
                                                  </TableCell>
                                                  <TableCell component={'span'} align='right'>
                                                      <Tooltip title={t('inventory.icons.edit')}>
                                                          <span>
                                                              <IconButton
                                                                  size='small'
                                                                  type='submit'
                                                                  onClick={() => submitItemChange(values, item.id, true)}
                                                                  className={!dirty ? 'hidden' : ''}
                                                                  disabled={!dirty || Boolean(errors.price) || Boolean(errors.quantity)}
                                                              >
                                                                  <Check fontSize='inherit' />
                                                              </IconButton>
                                                          </span>
                                                      </Tooltip>
                                                      <Tooltip title={t('inventory.icons.unlist')}>
                                                          <span>
                                                              <IconButton size='small' type='submit' onClick={() => submitItemChange(values, item.id, false)}>
                                                                  <Remove fontSize='inherit' />
                                                              </IconButton>
                                                          </span>
                                                      </Tooltip>
                                                  </TableCell>
                                              </TableRow>
                                          )}
                                      </Formik>
                                  ))
                            : null}
                        {!loading && filteredItems && filteredItems.length > 0
                            ? filteredItems.filter((item) => (session ? item.user === session.userName : false)).length > 0 && (
                                  <TableRow component={'div'}>
                                      {(() => {
                                          const loadingCells = [];

                                          for (let i = 0; i < 9; i++) {
                                              loadingCells.push(
                                                  <TableCell
                                                      component={'span'}
                                                      key={`spacer-cell-${i}`}
                                                      align='center'
                                                      sx={{
                                                          backgroundColor: 'secondary.main',
                                                          py: '1px',
                                                      }}
                                                  ></TableCell>
                                              );
                                          }

                                          return loadingCells;
                                      })()}
                                  </TableRow>
                              )
                            : null}
                        {!loading && filteredItems && filteredItems.length > 0
                            ? filteredItems
                                  .filter((item) => (session ? item.user !== session.userName : true))
                                  .map((item, index) => (
                                      <Formik
                                          key={`form-${index}`}
                                          initialValues={{
                                              price: item.price,
                                              quantity: item.quantity,
                                          }}
                                          validationSchema={validationSchema}
                                          onSubmit={() => {}}
                                      >
                                          {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
                                              <TableRow
                                                  key={item.id}
                                                  component={'div'}
                                                  sx={{
                                                      ':hover': {
                                                          backgroundColor: 'action.hover',
                                                      },
                                                  }}
                                              >
                                                  <TableCell component={'span'} align='center'>
                                                      <Box
                                                          component='img'
                                                          sx={{
                                                              height: 20,
                                                              mt: '8px',
                                                          }}
                                                          alt={t(`localeStrings.${item.country.toLowerCase()}`)}
                                                          src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${item.country.toLowerCase()}.gif`}
                                                      />
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      <Link href={INTERNAL_ROUTES.USER.PROFILE(item.user)}>{item.user}</Link>
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      {item.quality}
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      <Image height={20} width={30} alt={t(`localeStrings.${item.language}`)} src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${item.language}.gif`} />
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      {item.price}
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      {item.quantity === 1 ? (
                                                          item.quantity
                                                      ) : (
                                                          <Select
                                                              value={values.quantity}
                                                              size='small'
                                                              name='quantity'
                                                              onChange={handleChange}
                                                              onBlur={handleBlur}
                                                              error={touched.quantity && Boolean(errors.quantity)}
                                                          >
                                                              {(() => {
                                                                  const options: ReactElement[] = [];

                                                                  for (let i = 1; i <= item.quantity; i++) {
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
                                                  <TableCell component={'span'} align='center'>
                                                      {item.comment && (
                                                          <Tooltip title={item.comment}>
                                                              <ChatBubble />
                                                          </Tooltip>
                                                      )}
                                                  </TableCell>
                                                  <TableCell component={'span'} align='center'>
                                                      {item.isFoil ? (
                                                          <Tooltip title={t('inventory.inventoryColumns.foil')}>
                                                              <Star />
                                                          </Tooltip>
                                                      ) : null}
                                                      {item.isAltered ? (
                                                          <Tooltip title={t('inventory.inventoryColumns.altered')}>
                                                              <Brush />
                                                          </Tooltip>
                                                      ) : null}
                                                      {item.isSigned ? (
                                                          <Tooltip title={t('inventory.inventoryColumns.signed')}>
                                                              <Gesture />
                                                          </Tooltip>
                                                      ) : null}
                                                      {item.isMisprint ? (
                                                          <Tooltip title={t('inventory.inventoryColumns.misprint')}>
                                                              <BrokenImage />
                                                          </Tooltip>
                                                      ) : null}
                                                      {item.isGraded ? (
                                                          <Tooltip title={`${item.gradingCompany} ${item.grading}`}>
                                                              <GMobiledata />
                                                          </Tooltip>
                                                      ) : null}
                                                  </TableCell>
                                                  <TableCell component={'span'} align='right'>
                                                      {adding ? (
                                                          <CircularProgress size='20px' disableShrink />
                                                      ) : (
                                                          <IconButton onClick={() => addItemToCart(item, name, values.quantity)}>
                                                              <ShoppingCart />
                                                          </IconButton>
                                                      )}
                                                  </TableCell>
                                              </TableRow>
                                          )}
                                      </Formik>
                                  ))
                            : null}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default BuyableCardList;
