import { SetType } from '@/src/actions/sets';
import SetAutocomplete from '@/src/components/SetAutoComplete/SetAutocomplete';
import { languagesEnum } from '@/src/constants/languages';
import { qualitiesEnum } from '@/src/constants/qualities';
import { getSetData } from '@/src/constants/sets';
import { useInventoryStore } from '@/src/store/inventory';
import { buildLanguageSelectOptions, buildQualitySelectOptions, buildRaritySelectOptions } from '@/src/utils/selectOptionBuilders.helper';
import { BrokenImage, Brush, Clear, FilterAlt, Gesture, GMobiledata, Star } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const InventoryFilters = ({ refresh, isPublic = false }: { refresh: () => void; isPublic?: boolean }) => {
    const t = useTranslations();
    const { setFilter, resetFilters, resetPages } = useInventoryStore();
    const qualityChoices = buildQualitySelectOptions(qualitiesEnum, t);
    const languageChoices = buildLanguageSelectOptions(languagesEnum, t);
    const rarityChoices = buildRaritySelectOptions(t);
    const [setOptions, setSetOptions] = useState<SetType[]>([]);

    // Fetch sets from the database
    useEffect(() => {
        const fetchSets = async () => {
            try {
                const dbSets = await getSetData();
                setSetOptions(dbSets);
            } catch (error) {
                console.error('Error loading sets:', error);
            }
        };

        fetchSets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const defaultValues = {
        name: '',
        quality: [],
        language: [],
        set: [],
        rarity: [],
        minPrice: '',
        maxPrice: '',
        isFoil: '',
        isSigned: '',
        isAltered: '',
        isMisprint: '',
        isGraded: '',
        comment: '',
        internalComment: '',
        quantity: '',
    };

    const setFilters = (values: any) => {
        for (const [key, value] of Object.entries(values)) {
            setFilter(key, value as string | string[]);
        }
        resetPages();
        refresh();
    };

    const resetAllFilters = () => {
        resetFilters();
        resetPages();
        refresh();
    };

    return (
        <Accordion sx={{ my: '2rem' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='filter-panel-content' id='filter-panel-header'>
                <Grid container>
                    <Grid size={{ xs: 12 }}>{t('filters.title')}</Grid>
                </Grid>
            </AccordionSummary>
            <Formik
                initialValues={defaultValues}
                onSubmit={(values: any) => {
                    setFilters(values);
                }}
            >
                {({ values, errors, touched, dirty, handleChange, handleBlur, resetForm, setFieldValue }) => (
                    <AccordionDetails>
                        <form>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <FormControl fullWidth>
                                        <TextField id='filter-name' label={t('filters.name')} name='name' value={values.name} onChange={handleChange} onBlur={handleBlur} />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <SetAutocomplete sets={setOptions} value={values.set} onChange={(value) => setFieldValue('set', value || [])} label={t('filters.set')} multiple={true} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='filter-rarity-label'>{t('filters.rarity')}</InputLabel>
                                        <Select
                                            multiple
                                            labelId='filter-rarity-label'
                                            id='filter-rarity'
                                            value={values.rarity}
                                            name='rarity'
                                            label={t('filters.rarity')}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {rarityChoices}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='filter-quality-label'>{t('filters.quality')}</InputLabel>
                                        <Select
                                            multiple
                                            labelId='filter-quality-label'
                                            id='filter-quality'
                                            value={values.quality}
                                            name='quality'
                                            label={t('filters.quality')}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {qualityChoices}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: isPublic ? 6 : 4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='filter-language-label'>{t('filters.language')}</InputLabel>
                                        <Select
                                            multiple
                                            labelId='filter-language-label'
                                            id='filter-language'
                                            value={values.language}
                                            name='language'
                                            label={t('filters.language')}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {languageChoices}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: isPublic ? 6 : 4 }}>
                                    <FormControl fullWidth>
                                        <TextField id='filter-comment' label={t('filters.comment')} value={values.comment} name='comment' onChange={handleChange} onBlur={handleBlur} />
                                    </FormControl>
                                </Grid>
                                {!isPublic && (
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <FormControl fullWidth>
                                            <TextField
                                                id='filter-internal-comment'
                                                label={t('filters.internal-comment')}
                                                value={values.internalComment}
                                                name='internalComment'
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </FormControl>
                                    </Grid>
                                )}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id='filter-min-price'
                                            label={t('filters.minPrice')}
                                            value={values.minPrice}
                                            name='minPrice'
                                            type='number'
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id='filter-max-price'
                                            label={t('filters.maxPrice')}
                                            value={values.maxPrice}
                                            name='maxPrice'
                                            type='number'
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id='filter-quantity'
                                            label={t('filters.quantity')}
                                            value={values.quantity}
                                            name='quantity'
                                            type='number'
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='filter-isFoil-label'>
                                            {
                                                <>
                                                    {t('products.singleCard.foil')} <Star sx={{ height: '16px' }} />
                                                </>
                                            }
                                        </InputLabel>
                                        <Select
                                            labelId='filter-isFoil-label'
                                            id='filter-isFoil'
                                            value={values.isFoil}
                                            name='isFoil'
                                            label={
                                                <>
                                                    {t('products.singleCard.foil')} <Star sx={{ height: '16px' }} />
                                                </>
                                            }
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem key='1' value='1'>
                                                <Star sx={{ height: '16px' }} /> {t('yes')}
                                            </MenuItem>
                                            <MenuItem key='0' value='0'>
                                                {t('no')}
                                            </MenuItem>
                                            <MenuItem key='noMatter' value=''>
                                                {t('noMatter')}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='filter-isSigned-label'>
                                            {
                                                <>
                                                    {t('products.singleCard.signed')} <Gesture sx={{ height: '16px' }} />
                                                </>
                                            }
                                        </InputLabel>
                                        <Select
                                            labelId='filter-isSigned-label'
                                            id='filter-isSigned'
                                            value={values.isSigned}
                                            name='isSigned'
                                            label={
                                                <>
                                                    {t('products.singleCard.signed')} <Gesture sx={{ height: '16px' }} />
                                                </>
                                            }
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem key='1' value='1'>
                                                <Gesture sx={{ height: '16px' }} /> {t('yes')}
                                            </MenuItem>
                                            <MenuItem key='0' value='0'>
                                                {t('no')}
                                            </MenuItem>
                                            <MenuItem key='noMatter' value=''>
                                                {t('noMatter')}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='filter-isAltered-label'>
                                            {
                                                <>
                                                    {t('products.singleCard.altered')} <Brush sx={{ height: '16px' }} />
                                                </>
                                            }
                                        </InputLabel>
                                        <Select
                                            labelId='filter-isAltered-label'
                                            id='filter-isAltered'
                                            value={values.isAltered}
                                            name='isAltered'
                                            label={
                                                <>
                                                    {t('products.singleCard.altered')} <Brush sx={{ height: '16px' }} />
                                                </>
                                            }
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem key='1' value='1'>
                                                <Brush sx={{ height: '16px' }} /> {t('yes')}
                                            </MenuItem>
                                            <MenuItem key='0' value='0'>
                                                {t('no')}
                                            </MenuItem>
                                            <MenuItem key='noMatter' value=''>
                                                {t('noMatter')}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='filter-isMisprint-label'>
                                            {
                                                <>
                                                    {t('products.singleCard.misprint')} <BrokenImage sx={{ height: '16px' }} />
                                                </>
                                            }
                                        </InputLabel>
                                        <Select
                                            labelId='filter-isMisprint-label'
                                            id='filter-isMisprint'
                                            value={values.isMisprint}
                                            name='isMisprint'
                                            label={
                                                <>
                                                    {t('products.singleCard.misprint')} <BrokenImage sx={{ height: '16px' }} />
                                                </>
                                            }
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem key='1' value='1'>
                                                <BrokenImage sx={{ height: '16px' }} /> {t('yes')}
                                            </MenuItem>
                                            <MenuItem key='0' value='0'>
                                                {t('no')}
                                            </MenuItem>
                                            <MenuItem key='noMatter' value=''>
                                                {t('noMatter')}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, md: 2.4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='filter-isGraded-label'>
                                            {
                                                <>
                                                    {t('products.singleCard.graded')} <GMobiledata sx={{ height: '16px' }} />
                                                </>
                                            }
                                        </InputLabel>
                                        <Select
                                            labelId='filter-isGraded-label'
                                            id='filter-isGraded'
                                            value={values.isGraded}
                                            name='isGraded'
                                            label={
                                                <>
                                                    {t('products.singleCard.graded')} <GMobiledata sx={{ height: '16px' }} />
                                                </>
                                            }
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem key='1' value='1'>
                                                <GMobiledata sx={{ height: '16px' }} /> {t('yes')}
                                            </MenuItem>
                                            <MenuItem key='0' value='0'>
                                                {t('no')}
                                            </MenuItem>
                                            <MenuItem key='noMatter' value=''>
                                                {t('noMatter')}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Button
                                            onClick={() => {
                                                setFilters(values);
                                            }}
                                            variant='contained'
                                            startIcon={<FilterAlt />}
                                        >
                                            {t('filters.filter')}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                resetForm();
                                                resetAllFilters();
                                            }}
                                            variant='outlined'
                                            startIcon={<Clear />}
                                        >
                                            {t('filters.reset')}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </AccordionDetails>
                )}
            </Formik>
        </Accordion>
    );
};

export default InventoryFilters;
