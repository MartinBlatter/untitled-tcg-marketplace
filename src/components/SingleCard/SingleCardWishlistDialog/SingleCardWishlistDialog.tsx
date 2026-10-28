import { getCardsAction } from '@/src/actions/cards';
import { languagesEnum } from '@/src/constants/languages';
import { qualitiesEnum } from '@/src/constants/qualities';
import { useNotifications } from '@/src/lib/context/NotificationProvider';
import { magicSetCodeToNameMapping } from '@/src/lib/mappings/magicSetCodeToNameMapping';
import { useWishlistsStore } from '@/src/store/wishlists';
import { getAutocompleteMultipleOptionsObjects } from '@/src/utils/helpers';
import { BrokenImage, Brush, Gesture, GMobiledata, Star } from '@mui/icons-material';
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fade,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useLocale, useTranslations } from 'next-intl';
import { isEmpty } from 'ramda';
import React, { useRef, useState } from 'react';
import * as yup from 'yup';
import CardImageTooltip from '../../CardImageTooltip/CardImageTooltip';
import ImageWithFallback from '../../ImageWithFallback/ImageWithFallback';
import { SingleCardWishlistDialogProps } from './types';

const SingleCardWishlistDialog = ({ show, setShow, card, wishlistId = 0, wishlistItem = null }: SingleCardWishlistDialogProps) => {
    const t = useTranslations();
    const notifications = useNotifications();
    const { addItem, editItem, refresh, loading, wishlists } = useWishlistsStore();
    const [showSearchResults, setshowSearchResults] = React.useState(false);
    const [currentSearch, setCurrentSearch] = useState('');
    const currentLocale = useLocale();
    const timer = useRef(setTimeout(() => null, 0));
    const [searchData, setSearchData] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [cardData, setCardData] = useState(card);
    const [loadingPrintingData, setLoadingPrintingData] = useState(false);
    const [setOptions, setSetOptions] = useState([{ code: '%', name: t('noMatter') }]);
    const languageOptions = [{ code: '%', name: t('noMatter') }];
    const languageNames: any = [];
    languageNames['%'] = t('noMatter');
    languagesEnum.map((language) => {
        languageNames[language] = t(`localeStrings.${language}`);
        languageOptions.push({
            code: language,
            name: t(`localeStrings.${language}`),
        });
    });

    const fetchSearchData = (searchString: string) => {
        getCardsAction(currentLocale, searchString, 10, 1, {}, 'name', 'asc', {}).then((data: any) => {
            setSearchData(data);
            setLoadingSearch(false);
            setCurrentSearch(searchString);
        });
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentSearch(event.target.value);
        if (event.target.value.length > 2) {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                setshowSearchResults(true);
                setLoadingSearch(true);
                fetchSearchData(event.target.value);
            }, 500);
        } else {
            setshowSearchResults(false);
        }
    };

    const handleClose = () => {
        setShow(false);
    };

    const submitItemAdd = (values: any) => {
        const setCodes: any[] = [];
        values.setCodes.map((setCode: { code: string; name: string }) => {
            setCodes.push(setCode.code);
        });
        values.setCodes = setCodes;

        const language: any[] = [];
        values.language.map((val: { code: string; name: string }) => {
            language.push(val.code);
        });
        values.language = language;

        if (!wishlistItem) {
            addItem({
                uuid: cardData.uuid,
                name: cardData.name,
                ...values,
            }).then((res: any) => {
                if (res.success) {
                    notifications.addSuccessNotification(t('wishlists.notifications.successAddSingleCard'));
                } else {
                    notifications.addErrorNotification(t('wishlists.notifications.errorAddSingleCard'));
                }
                refresh();
            });
        } else {
            editItem({
                id: wishlistItem?.id,
                uuid: wishlistItem.uuid,
                name: wishlistItem.name,
                ...values,
            }).then((res: any) => {
                if (res.success) {
                    notifications.addSuccessNotification(t('wishlists.notifications.successEditSingleCard'));
                } else {
                    notifications.addErrorNotification(t('wishlists.notifications.errorEditSingleCard'));
                }
                refresh();
            });
        }

        setShow(false);
    };

    const validationSchema = yup.object({
        quantity: yup.number().required(t('errors.required')).moreThan(0, t('errors.required')),
        language: yup.array().min(1, t('errors.required')).required(t('errors.required')),
        setCodes: yup.array().min(1, t('errors.required')).required(t('errors.required')),
        quality: yup.string().required(t('errors.required')),
        wishlist: yup.string().required(t('errors.required')),
    });

    React.useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (cardData || wishlistItem) {
            fetch(`/api/magic/cards/single/?uuid=${wishlistItem?.uuid || cardData?.uuid}&locale=${currentLocale}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        data = data[0];
                    }
                    fetch(`/api/magic/cards/single/printing-ids?printings=${data.printings}&name=${data.name}`)
                        .then((res2) => res2.json())
                        .then((printData) => {
                            const newOptions = [{ code: '%', name: t('noMatter') }];
                            printData.map((p: any) => {
                                if (!newOptions.find((o) => o.code === p.setCode)) {
                                    newOptions.push({
                                        code: p.setCode,
                                        name: magicSetCodeToNameMapping[p.setCode as keyof typeof magicSetCodeToNameMapping] + ` (${p.setCode})`,
                                    });
                                }
                            });
                            setSetOptions(newOptions);
                            setLoadingPrintingData(false);
                        });
                });
        }
    }, [cardData, wishlistItem]);

    return (
        <Dialog open={show} onClose={handleClose}>
            <DialogTitle>
                {wishlistItem
                    ? t('wishlists.singleCardDialog.edit', {
                          name: wishlistItem.name,
                      })
                    : t('wishlists.singleCardDialog.title')}
            </DialogTitle>
            <Formik
                initialValues={{
                    price: wishlistItem?.price || '0.00',
                    quantity: wishlistItem?.quantity || '1',
                    language: wishlistItem?.language.split(',') || [],
                    quality: wishlistItem?.quality || 'NM',
                    comment: wishlistItem?.comment || '',
                    isFoil: wishlistItem?.isFoil || false,
                    isAltered: wishlistItem?.isAltered || false,
                    isSigned: wishlistItem?.isSigned || false,
                    isMisprint: wishlistItem?.isMisprint || false,
                    isGraded: wishlistItem?.isGraded || false,
                    wishlist: wishlistId !== 0 ? wishlistId : wishlists.length > 0 ? (wishlists[0] as any)['mtg.wishlist'].id : '',
                    setCodes: wishlistItem?.setCodes ? getAutocompleteMultipleOptionsObjects(wishlistItem.setCodes, magicSetCodeToNameMapping, t('noMatter'), true) : [],
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    submitItemAdd(values);
                }}
            >
                {({ values, errors, touched, dirty, handleChange, handleBlur, setFieldValue }) => (
                    <form>
                        <DialogContent>
                            <Grid container spacing={4}>
                                {wishlistId !== 0 && !wishlistItem && (
                                    <Grid size={{ xs: 12 }} sx={{ position: 'relative' }}>
                                        <FormControl fullWidth>
                                            <TextField
                                                value={currentSearch}
                                                placeholder={t('appBar.searchField.placeholder')}
                                                onChange={handleSearchChange}
                                                onBlur={(e) => {
                                                    setshowSearchResults(false);
                                                    handleBlur(e);
                                                }}
                                            />
                                        </FormControl>
                                        <Fade in={showSearchResults} onBlurCapture={() => setshowSearchResults(false)}>
                                            <Paper
                                                className='search-field'
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    position: 'absolute',
                                                    left: '0',
                                                    top: '55px',
                                                    backgroundColor: 'background.paper',
                                                    color: 'grey.900',
                                                    zIndex: 2,
                                                    border: '1px solid black',
                                                }}
                                            >
                                                {loadingSearch && (
                                                    <Box
                                                        sx={{
                                                            width: '100%',
                                                            p: 2,
                                                        }}
                                                    >
                                                        <LinearProgress />
                                                    </Box>
                                                )}
                                                {!loadingSearch && isEmpty(searchData) && (
                                                    <Typography variant='h6' sx={{ p: 2 }}>
                                                        {t('appBar.searchField.noResults')}
                                                    </Typography>
                                                )}
                                                {!loadingSearch && !isEmpty(searchData) && (
                                                    <List
                                                        dense={true}
                                                        sx={{
                                                            width: '100%',
                                                            p: 0,
                                                        }}
                                                    >
                                                        {(searchData as any).cards.slice(0, 10).map((searchResult: any) => (
                                                            <ListItemButton
                                                                key={`search-result-${searchResult.id}-button`}
                                                                onClick={() => {
                                                                    setCardData(searchResult);
                                                                    setCurrentSearch(searchResult.name);
                                                                }}
                                                            >
                                                                <ListItemIcon>
                                                                    <CardImageTooltip card={searchResult} />
                                                                </ListItemIcon>
                                                                <Box
                                                                    sx={{
                                                                        width: 30,
                                                                        marginRight: '30px',
                                                                        textAlign: 'center',
                                                                        paddingTop: '5px',
                                                                    }}
                                                                >
                                                                    <ListItemIcon
                                                                        sx={{
                                                                            display: 'inline',
                                                                        }}
                                                                    >
                                                                        <ImageWithFallback
                                                                            height={20}
                                                                            width={20}
                                                                            className='invertFilter'
                                                                            src={`/images/magic/editions/${searchResult.setCode.toLowerCase()}.svg`}
                                                                            fallbackSrc={`/images/magic/editions/fallback.svg`}
                                                                            alt={searchResult.setCode}
                                                                        />
                                                                    </ListItemIcon>
                                                                </Box>
                                                                <ListItemText
                                                                    sx={{
                                                                        color: 'text.primary',
                                                                    }}
                                                                    primary={searchResult.name}
                                                                    secondary={searchResult.foreignName}
                                                                />
                                                            </ListItemButton>
                                                        ))}
                                                        {(searchData as any).count[0].count === 0 && (
                                                            <ListItem>
                                                                <Typography
                                                                    variant='h6'
                                                                    sx={{
                                                                        p: 2,
                                                                    }}
                                                                >
                                                                    {t('appBar.searchField.noResults')}
                                                                </Typography>
                                                            </ListItem>
                                                        )}
                                                        {(searchData as any).count[0].count > 10 && (
                                                            <>
                                                                <Divider />
                                                                <ListItemButton>
                                                                    <ListItemText
                                                                        sx={{
                                                                            textAlign: 'center',
                                                                        }}
                                                                        primary={t('appBar.searchField.moreResults', {
                                                                            count: (searchData as any).count[0].count,
                                                                        })}
                                                                    />
                                                                </ListItemButton>
                                                            </>
                                                        )}
                                                    </List>
                                                )}
                                            </Paper>
                                        </Fade>
                                    </Grid>
                                )}
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='select-wishlist-label'>{t('wishlists.singleCardDialog.wishlist')}</InputLabel>
                                        <Select
                                            labelId='select-wishlist-label'
                                            id='select-wishlist'
                                            name='wishlist'
                                            value={values.wishlist}
                                            label={t('wishlists.singleCardDialog.wishlist')}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {wishlists.map((wishlist: any) => (
                                                <MenuItem key={`wishlist-${wishlist['mtg.wishlist'].id}`} value={wishlist['mtg.wishlist'].id}>
                                                    {wishlist['mtg.wishlist'].name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {!loadingPrintingData && (
                                    <Grid size={{ xs: 12 }}>
                                        <Autocomplete
                                            multiple
                                            id='setCodes'
                                            defaultValue={wishlistItem?.setCodes ? getAutocompleteMultipleOptionsObjects(wishlistItem.setCodes, magicSetCodeToNameMapping, t('noMatter'), true) : []}
                                            options={setOptions}
                                            getOptionLabel={(option) => option.name}
                                            onChange={(
                                                event: any,
                                                newValue:
                                                    | {
                                                          name: string;
                                                          code: string;
                                                      }[]
                                                    | null
                                            ) => {
                                                setFieldValue('setCodes', newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant='outlined'
                                                    label={t('search.form.sets')}
                                                    error={Boolean(errors.setCodes)}
                                                    helperText={errors?.setCodes && (errors.setCodes as string)}
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='select-quality-label'>{t('wishlists.singleCardDialog.quality')}</InputLabel>
                                        <Select
                                            labelId='select-quality-label'
                                            id='select-quality'
                                            name='quality'
                                            value={values.quality}
                                            label={t('wishlists.singleCardDialog.quality')}
                                            fullWidth
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {qualitiesEnum.map((quality) => (
                                                <MenuItem key={quality} value={quality}>
                                                    {t(`qualityStrings.${quality}`)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Autocomplete
                                        multiple
                                        id='language'
                                        defaultValue={wishlistItem?.language ? getAutocompleteMultipleOptionsObjects(wishlistItem.language, languageNames, t('noMatter')) : []}
                                        options={languageOptions}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(
                                            event: any,
                                            newValue:
                                                | {
                                                      name: string;
                                                      code: string;
                                                  }[]
                                                | null
                                        ) => {
                                            setFieldValue('language', newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant='outlined'
                                                label={t('products.singleCard.language')}
                                                error={Boolean(errors.language)}
                                                helperText={errors?.language && (errors.language as string)}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name='isFoil'
                                        control={<Checkbox />}
                                        checked={values.isFoil}
                                        label={
                                            <>
                                                {t('products.singleCard.foil')} <Star />
                                            </>
                                        }
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name='isSigned'
                                        control={<Checkbox />}
                                        checked={values.isSigned}
                                        label={
                                            <>
                                                {t('products.singleCard.signed')} <Gesture />
                                            </>
                                        }
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name='isAltered'
                                        control={<Checkbox />}
                                        checked={values.isAltered}
                                        label={
                                            <>
                                                {t('products.singleCard.altered')} <Brush />
                                            </>
                                        }
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name='isMisprint'
                                        control={<Checkbox />}
                                        checked={values.isMisprint}
                                        label={
                                            <>
                                                {t('products.singleCard.misprint')} <BrokenImage />
                                            </>
                                        }
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControlLabel
                                        name='isGraded'
                                        control={<Checkbox />}
                                        checked={values.isGraded}
                                        label={
                                            <>
                                                {t('products.singleCard.graded')} <GMobiledata />
                                            </>
                                        }
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type='text'
                                            name='comment'
                                            label={t('products.singleCard.comment')}
                                            value={values.comment}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.comment && Boolean(errors.comment)}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type='number'
                                            name='price'
                                            label={t('products.singleCard.price')}
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
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type='number'
                                            name='quantity'
                                            label={t('products.singleCard.quantity')}
                                            value={values.quantity}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.quantity && Boolean(errors.quantity)}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>{t('cancel')}</Button>
                            <Button
                                variant='contained'
                                disabled={
                                    loading || (cardData === null && !wishlistItem) || Boolean(errors.quantity) || Boolean(errors.language) || Boolean(errors.quality) || Boolean(errors.setCodes)
                                }
                                onClick={() => submitItemAdd(values)}
                            >
                                {loading ? <CircularProgress size={12} sx={{ marginRight: 1 }} /> : ''} {t('save')}
                            </Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

export default SingleCardWishlistDialog;
