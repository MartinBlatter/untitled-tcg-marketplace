import { buildCountrySelectOptions, buildLanguageSelectOptions, buildQualitySelectOptions } from '@/src/utils/selectOptionBuilders.helper';
import { BrokenImage, Brush, Close, Gesture, GMobiledata, Star } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { BuyableCardFiltersProps } from './types';

const BuyableCardFilters = ({ filters, setFilter, items = [], resetFilters, hasFilters }: BuyableCardFiltersProps) => {
    const t = useTranslations();

    const countriesAdded: any[] = [];
    const qualitiesAdded: any[] = [];
    const languagesAdded: any[] = [];

    items.forEach((item) => {
        if (!countriesAdded.includes(item.country)) {
            countriesAdded.push(item.country);
        }
        if (!qualitiesAdded.includes(item.quality)) {
            qualitiesAdded.push(item.quality);
        }
        if (!languagesAdded.includes(item.language)) {
            languagesAdded.push(item.language);
        }
    });

    const countryChoices = buildCountrySelectOptions(countriesAdded, t);
    const qualityChoices = buildQualitySelectOptions(qualitiesAdded, t);
    const languageChoices = buildLanguageSelectOptions(languagesAdded, t);

    return (
        <Accordion sx={{ my: '2rem' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='filter-panel-content' id='filter-panel-header' component={'div'}>
                <Grid container>
                    <Grid size={{ xs: 12 }}>
                        {t('filters.title')}
                        {hasFilters && (
                            <Button
                                variant='outlined'
                                size='small'
                                sx={{ ml: '1rem' }}
                                onClick={(e) => {
                                    resetFilters();
                                    e.stopPropagation();
                                }}
                                startIcon={<Close />}
                            >
                                {t('filters.reset')}
                            </Button>
                        )}
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
                        {filters.country !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={
                                    <>
                                        <Box
                                            component='img'
                                            sx={{
                                                height: 14,
                                                mt: '6px',
                                            }}
                                            alt={t(`countries.${filters.country.toUpperCase()}`)}
                                            src={`/images/flags/${filters.country.toLowerCase()}.gif`}
                                        />
                                    </>
                                }
                                variant='outlined'
                                onDelete={() => setFilter('country', '')}
                            />
                        )}
                        {filters.quality !== '' && <Chip sx={{ mr: '1rem' }} label={t(`qualityStrings.${filters.quality}`)} variant='outlined' onDelete={() => setFilter('quality', '')} />}
                        {filters.language.length > 0 && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={filters.language.map((l: any) => t(`localeStrings.${l.toLowerCase()}`)).join(', ')}
                                variant='outlined'
                                onDelete={() => setFilter('language', [])}
                            />
                        )}
                        {filters.price !== '' && <Chip sx={{ mr: '1rem' }} label={`${t('products.singleCard.price')}: ${filters.price}`} variant='outlined' onDelete={() => setFilter('price', '')} />}
                        {filters.isFoil !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={`${t('products.singleCard.foil')}: ${filters.isFoil == 1 ? t('yes') : t('no')}`}
                                variant='outlined'
                                onDelete={() => setFilter('isFoil', '')}
                            />
                        )}
                        {filters.isAltered !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={`${t('products.singleCard.altered')}: ${filters.isAltered == 1 ? t('yes') : t('no')}`}
                                variant='outlined'
                                onDelete={() => setFilter('isAltered', '')}
                            />
                        )}
                        {filters.isSigned !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={`${t('products.singleCard.signed')}: ${filters.isSigned == 1 ? t('yes') : t('no')}`}
                                variant='outlined'
                                onDelete={() => setFilter('isSigned', '')}
                            />
                        )}
                        {filters.isMisprint !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={`${t('products.singleCard.misprint')}: ${filters.isMisprint == 1 ? t('yes') : t('no')}`}
                                variant='outlined'
                                onDelete={() => setFilter('isMisprint', '')}
                            />
                        )}
                        {filters.isGraded !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={`${t('products.singleCard.graded')}: ${filters.isGraded == 1 ? t('yes') : t('no')}`}
                                variant='outlined'
                                onDelete={() => setFilter('isGraded', '')}
                            />
                        )}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id='filter-country-label'>{t('filters.country')}</InputLabel>
                            <Select labelId='filter-country-label' id='filter-country' value={filters.country} label={t('filters.country')} onChange={(e) => setFilter('country', e.target.value)}>
                                {countryChoices}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id='filter-quality-label'>{t('filters.quality')}</InputLabel>
                            <Select labelId='filter-quality-label' id='filter-quality' value={filters.quality} label={t('filters.quality')} onChange={(e) => setFilter('quality', e.target.value)}>
                                {qualityChoices}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id='filter-language-label'>{t('filters.language')}</InputLabel>
                            <Select
                                multiple
                                labelId='filter-language-label'
                                id='filter-language'
                                value={filters.language}
                                label={t('filters.language')}
                                onChange={(e) => setFilter('language', e.target.value)}
                            >
                                {languageChoices}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth>
                            <TextField id='filter-price' label={t('filters.price')} value={filters.price} type='number' onChange={(e) => setFilter('price', e.target.value)} />
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
                                value={filters.isFoil}
                                label={
                                    <>
                                        {t('products.singleCard.foil')} <Star sx={{ height: '16px' }} />
                                    </>
                                }
                                onChange={(e) => setFilter('isFoil', e.target.value)}
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
                                value={filters.isSigned}
                                label={
                                    <>
                                        {t('products.singleCard.signed')} <Gesture sx={{ height: '16px' }} />
                                    </>
                                }
                                onChange={(e) => setFilter('isSigned', e.target.value)}
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
                                value={filters.isAltered}
                                label={
                                    <>
                                        {t('products.singleCard.altered')} <Brush sx={{ height: '16px' }} />
                                    </>
                                }
                                onChange={(e) => setFilter('isAltered', e.target.value)}
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
                                value={filters.isMisprint}
                                label={
                                    <>
                                        {t('products.singleCard.misprint')} <BrokenImage sx={{ height: '16px' }} />
                                    </>
                                }
                                onChange={(e) => setFilter('isMisprint', e.target.value)}
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
                                value={filters.isGraded}
                                label={
                                    <>
                                        {t('products.singleCard.graded')} <GMobiledata sx={{ height: '16px' }} />
                                    </>
                                }
                                onChange={(e) => setFilter('isGraded', e.target.value)}
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
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

export default BuyableCardFilters;
