import { getCardsAction } from '@/src/actions/cards';
import { languagesEnum } from '@/src/constants/languages';
import { qualitiesEnum } from '@/src/constants/qualities';
import { useBuylistStore } from '@/src/store/buylist';
import { buildLanguageSelectOptions, buildQualitySelectOptions } from '@/src/utils/selectOptionBuilders.helper';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fade,
    FormControlLabel,
    Grid,
    InputAdornment,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { isEmpty } from 'ramda';
import React, { useRef, useState } from 'react';
import CardImageTooltip from '../CardImageTooltip/CardImageTooltip';
import ImageWithFallback from '../ImageWithFallback/ImageWithFallback';

// Define the interface for dialog props
interface BuylistItemAddDialogProps {
    show: boolean;
    setShow: (show: boolean) => void;
    buylistId: number;
}

const BuylistItemAddDialog: React.FC<BuylistItemAddDialogProps> = ({ show, setShow, buylistId }) => {
    const t = useTranslations();
    const currentLocale = useLocale();
    const { addBuylistItem, isLoading } = useBuylistStore();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const timer = useRef(setTimeout(() => null, 0));

    // Basic information
    const [quantity, setQuantity] = useState(1);
    const [maxBuys, setMaxBuys] = useState(0);
    const [price, setPrice] = useState<number | ''>('');

    // Condition options
    const [language, setLanguage] = useState('');
    const [quality, setQuality] = useState('');
    const [isFoil, setIsFoil] = useState(false);
    const [isAltered, setIsAltered] = useState(false);
    const [isSigned, setIsSigned] = useState(false);
    const [isMisprint, setIsMisprint] = useState(false);
    const [isGraded, setIsGraded] = useState(false);

    // Additional info
    const [comment, setComment] = useState('');

    // Validation errors
    const [cardError, setCardError] = useState('');
    const [priceError, setPriceError] = useState('');

    // Fetch search results when search query changes
    const fetchSearchData = (searchString: string) => {
        getCardsAction(currentLocale, searchString, 10, 1, {}, 'name', 'asc', {}).then((data: any) => {
            setSearchResults(data);
            setSearchLoading(false);
            setSearchQuery(searchString);
        });
    };

    // Handle search input changes
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        if (event.target.value.length > 2) {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                setShowSearchResults(true);
                setSearchLoading(true);
                fetchSearchData(event.target.value);
            }, 500);
        } else {
            setShowSearchResults(false);
        }
    };

    const handleClose = () => {
        // Reset form state
        setSearchQuery('');
        setSelectedCard(null);
        setQuantity(1);
        setMaxBuys(0);
        setPrice('');
        setLanguage('');
        setQuality('');
        setIsFoil(false);
        setIsAltered(false);
        setIsSigned(false);
        setIsMisprint(false);
        setIsGraded(false);
        setComment('');
        setCardError('');
        setPriceError('');
        setShowSearchResults(false);

        // Close dialog
        setShow(false);
    };

    const handleSubmit = async () => {
        // Validate form
        let isValid = true;

        if (!selectedCard) {
            setCardError(t('buylist.cardRequired'));
            isValid = false;
        }

        if (price === '') {
            setPriceError(t('buylist.priceRequired'));
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Add item to buylist
        await addBuylistItem(buylistId, {
            uuid: selectedCard.uuid,
            name: selectedCard.name,
            quantity,
            maxBuys,
            price: price as number,
            language,
            quality,
            isFoil,
            isAltered,
            isSigned,
            isMisprint,
            isGraded,
            comment,
            setCodes: selectedCard?.setCode ? selectedCard.setCode : undefined,
        });

        // Close dialog on success
        handleClose();
    };

    return (
        <Dialog open={show} onClose={handleClose} maxWidth='md' fullWidth>
            <DialogTitle>{t('buylist.addItem')}</DialogTitle>
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    <Grid container spacing={4}>
                        {/* Card search */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                value={searchQuery}
                                placeholder={t('appBar.searchField.placeholder')}
                                label={t('buylist.searchCards')}
                                onChange={handleSearchChange}
                                error={!!cardError}
                                helperText={cardError}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setShowSearchResults(false);
                                    }, 200);
                                }}
                            />
                            <Fade in={showSearchResults}>
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
                                    {searchLoading && (
                                        <Box sx={{ width: '100%', p: 2 }}>
                                            <LinearProgress />
                                        </Box>
                                    )}
                                    {!searchLoading && isEmpty(searchResults) && (
                                        <Typography variant='h6' sx={{ p: 2 }}>
                                            {t('appBar.searchField.noResults')}
                                        </Typography>
                                    )}
                                    {!searchLoading && !isEmpty(searchResults) && (
                                        <List dense={true} sx={{ width: '100%', p: 0 }}>
                                            {(searchResults as any).cards &&
                                                (searchResults as any).cards.slice(0, 10).map((searchResult: any) => (
                                                    <ListItemButton
                                                        key={`search-result-${searchResult.id}-button`}
                                                        onClick={() => {
                                                            setSelectedCard(searchResult);
                                                            setSearchQuery(searchResult.name);
                                                            setShowSearchResults(false);
                                                            setCardError('');
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
                                                            <ListItemIcon sx={{ display: 'inline' }}>
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
                                                        <ListItemText sx={{ color: 'text.primary' }} primary={searchResult.name} secondary={searchResult.foreignName} />
                                                    </ListItemButton>
                                                ))}
                                            {(searchResults as any).count && (searchResults as any).count[0].count === 0 && (
                                                <ListItem>
                                                    <Typography variant='h6' sx={{ p: 2 }}>
                                                        {t('appBar.searchField.noResults')}
                                                    </Typography>
                                                </ListItem>
                                            )}
                                            {(searchResults as any).count && (searchResults as any).count[0].count > 10 && (
                                                <>
                                                    <Divider />
                                                    <ListItemButton>
                                                        <ListItemText
                                                            sx={{ textAlign: 'center' }}
                                                            primary={t('appBar.searchField.moreResults', {
                                                                count: (searchResults as any).count[0].count,
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
                        {/* Section Divider */}
                        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
                                {t('buylist.basicInfo')}
                            </Typography>
                            <Divider />
                        </Grid>
                        {/* Basic card information */}
                        <Grid size={{ xs: 4 }}>
                            <TextField
                                label={`${t('buylist.price')}`}
                                fullWidth
                                required
                                type='number'
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                                        inputProps: { step: '0.01' },
                                    },
                                }}
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value === '' ? '' : Number(e.target.value));
                                    setPriceError('');
                                }}
                                error={!!priceError}
                                helperText={priceError}
                            />
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <TextField
                                label={t('buylist.quantity')}
                                fullWidth
                                type='number'
                                slotProps={{
                                    input: { inputProps: { min: 1 } },
                                }}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <TextField
                                label={t('buylist.maxToBuy')}
                                fullWidth
                                type='number'
                                slotProps={{
                                    input: { inputProps: { min: 0 } },
                                }}
                                value={maxBuys}
                                onChange={(e) => setMaxBuys(Number(e.target.value))}
                                helperText={t('buylist.setTo0ForUnlimited')}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField select label={t('condition')} fullWidth value={quality} onChange={(e) => setQuality(e.target.value)}>
                                <MenuItem value=''>{t('any')}</MenuItem>
                                {buildQualitySelectOptions(qualitiesEnum, t)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField select label={t('language')} fullWidth value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <MenuItem value=''>{t('any')}</MenuItem>
                                {buildLanguageSelectOptions(languagesEnum, t)}
                            </TextField>
                        </Grid>
                        {/* Section Divider */}
                        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
                                {t('buylist.cardSpecifications')}
                            </Typography>
                            <Divider />
                        </Grid>
                        {/* Card specifications */}
                        <Grid>
                            <FormControlLabel control={<Switch checked={isFoil} onChange={(e) => setIsFoil(e.target.checked)} />} label={t('buylist.foil')} sx={{ height: '100%', display: 'flex' }} />
                        </Grid>
                        <Grid>
                            <FormControlLabel
                                control={<Switch checked={isAltered} onChange={(e) => setIsAltered(e.target.checked)} />}
                                label={t('buylist.altered')}
                                sx={{ height: '100%', display: 'flex' }}
                            />
                        </Grid>
                        <Grid>
                            <FormControlLabel
                                control={<Switch checked={isSigned} onChange={(e) => setIsSigned(e.target.checked)} />}
                                label={t('buylist.signed')}
                                sx={{ height: '100%', display: 'flex' }}
                            />
                        </Grid>
                        <Grid>
                            <FormControlLabel
                                control={<Switch checked={isMisprint} onChange={(e) => setIsMisprint(e.target.checked)} />}
                                label={t('buylist.misprint')}
                                sx={{ height: '100%', display: 'flex' }}
                            />
                        </Grid>
                        <Grid>
                            <FormControlLabel
                                control={<Switch checked={isGraded} onChange={(e) => setIsGraded(e.target.checked)} />}
                                label={t('buylist.graded')}
                                sx={{ height: '100%', display: 'flex' }}
                            />
                        </Grid>
                        {/* Section Divider */}
                        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
                                {t('buylist.additionalInfo')}
                            </Typography>
                            <Divider />
                        </Grid>
                        {/* Additional information */}
                        <Grid size={{ xs: 12 }}>
                            <TextField label={t('buylist.comment')} fullWidth multiline rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} disabled={isLoading}>
                    {t('cancel')}
                </Button>
                <Button onClick={handleSubmit} variant='contained' disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : null}>
                    {t('add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuylistItemAddDialog;
