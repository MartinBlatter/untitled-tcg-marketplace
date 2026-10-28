import { languagesEnum } from '@/src/constants/languages';
import { qualitiesEnum } from '@/src/constants/qualities';
import { useBuylistStore } from '@/src/store/buylist';
import { BuylistItem } from '@/src/store/types';
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
    FormControlLabel,
    Grid,
    InputAdornment,
    MenuItem,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

// Define props interface
interface BuylistItemEditDialogProps {
    show: boolean;
    setShow: (show: boolean) => void;
    item: BuylistItem & { maxBuys?: number; bought?: number; name: string };
    buylistId: number;
}

// Convert boolean-like value to boolean
const toBool = (value: boolean | number | undefined): boolean => {
    if (typeof value === 'number') {
        return value === 1;
    }
    return !!value;
};

const BuylistItemEditDialog: React.FC<BuylistItemEditDialogProps> = ({ show, setShow, item, buylistId }) => {
    const t = useTranslations();
    const { updateBuylistItem, isLoading } = useBuylistStore();

    // Basic information
    const [quantity, setQuantity] = useState(item.quantity);
    const [maxBuys, setMaxBuys] = useState(item.maxBuys || 0);
    const [bought, setBought] = useState(item.bought || 0);
    const [price, setPrice] = useState<number | ''>(item.price || '');

    // Condition options
    const [language, setLanguage] = useState(item.language || '');
    const [quality, setQuality] = useState(item.quality || '');
    const [isFoil, setIsFoil] = useState(toBool(item.isFoil));
    const [isAltered, setIsAltered] = useState(toBool(item.isAltered));
    const [isSigned, setIsSigned] = useState(toBool(item.isSigned));
    const [isMisprint, setIsMisprint] = useState(toBool(item.isMisprint));
    const [isGraded, setIsGraded] = useState(toBool(item.isGraded));

    // Additional info
    const [comment, setComment] = useState(item.comment || '');

    // Validation errors
    const [priceError, setPriceError] = useState('');

    // Update form if item changes
    useEffect(() => {
        if (item) {
            setQuantity(item.quantity);
            setMaxBuys(item.maxBuys || 0);
            setBought(item.bought || 0);
            setPrice(item.price || '');
            setLanguage(item.language || '');
            setQuality(item.quality || '');
            setIsFoil(toBool(item.isFoil));
            setIsAltered(toBool(item.isAltered));
            setIsSigned(toBool(item.isSigned));
            setIsMisprint(toBool(item.isMisprint));
            setIsGraded(toBool(item.isGraded));
            setComment(item.comment || '');
        }
    }, [item]);

    const handleClose = () => {
        setPriceError('');
        setShow(false);
    };

    const handleSubmit = async () => {
        // Validate form
        let isValid = true;

        if (price === '') {
            setPriceError(t('buylist.priceRequired'));
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Update item
        await updateBuylistItem(buylistId, item.id, {
            name: item.name,
            uuid: item.uuid || '',
            quantity,
            maxBuys,
            bought,
            price: price as number,
            language,
            quality,
            isFoil,
            isAltered,
            isSigned,
            isMisprint,
            isGraded,
            comment,
        });

        // Close dialog on success
        setShow(false);
    };

    return (
        <Dialog open={show} onClose={handleClose} maxWidth='md' fullWidth>
            <DialogTitle>
                {t('buylist.editItem')}: {item.name}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    <Grid container spacing={4}>
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
                                slotProps={{ input: { inputProps: { min: 1 } } }}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </Grid>

                        <Grid size={{ xs: 2 }}>
                            <TextField
                                label={t('buylist.maxBuys')}
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

                        <Grid size={{ xs: 2 }}>
                            <TextField label={t('buylist.bought')} fullWidth type='number' slotProps={{ htmlInput: { min: 0 } }} value={bought} onChange={(e) => setBought(Number(e.target.value))} />
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
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuylistItemEditDialog;
