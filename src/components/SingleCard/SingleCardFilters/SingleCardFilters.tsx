import { SetType } from '@/src/actions/sets';
import SetAutocomplete from '@/src/components/SetAutoComplete/SetAutocomplete';
import { getSetData } from '@/src/constants/sets';
import { buildRaritySelectOptions, buildTypeSelectOptions } from '@/src/utils/selectOptionBuilders.helper';
import { Close } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Button, Chip, FormControl, Grid, InputLabel, Select } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SingleCardFiltersProps } from './types';

const SingleCardFilters = ({ filters, setFilter, showSetFilter = false, setFilters }: SingleCardFiltersProps) => {
    const t = useTranslations();
    const rarityChoices = buildRaritySelectOptions(t);
    const typeChoices = buildTypeSelectOptions(t);
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

    const resetFilters = () => {
        setFilters({
            rarity: '',
            type: '',
            set: '',
        });
    };

    // Handle set selection ensuring we only pass a string to setFilter
    const handleSetChange = (value: string | string[] | null) => {
        // Ensure we only use the first value if it's an array, or empty string if null
        const setValue = typeof value === 'string' ? value : Array.isArray(value) && value.length > 0 ? value[0] : '';
        setFilter('set', setValue);
    };

    return (
        <Accordion sx={{ my: '2rem' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} component='div' aria-controls='filter-panel-content' id='filter-panel-header'>
                <Grid container>
                    <Grid size={{ xs: 12 }}>
                        {t('filters.title')}
                        {((filters.rarity && filters.rarity !== '') || (filters.type && filters.type !== '') || (filters.set && filters.set !== '')) && (
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
                        {filters.rarity && filters.rarity !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={t(`rarities.${filters.rarity}`)}
                                variant='outlined'
                                onDelete={() => {
                                    setFilter('rarity', '');
                                }}
                            />
                        )}
                        {filters.type && filters.type !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={t(`cardTypes.${filters.type}`)}
                                variant='outlined'
                                onDelete={() => {
                                    setFilter('type', '');
                                }}
                            />
                        )}
                        {filters.set && filters.set !== '' && (
                            <Chip
                                sx={{ mr: '1rem' }}
                                label={`${filters.set}`}
                                variant='outlined'
                                onDelete={() => {
                                    setFilter('set', '');
                                }}
                            />
                        )}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id='filter-rarity-label'>{t('filters.rarity')}</InputLabel>
                            <Select
                                labelId='filter-rarity-label'
                                id='filter-rarity'
                                value={filters.rarity}
                                label={t('filters.rarity')}
                                onChange={(e) => {
                                    setFilter('rarity', e.target.value);
                                }}
                            >
                                {rarityChoices}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id='filter-type-label'>{t('filters.type')}</InputLabel>
                            <Select
                                labelId='filter-type-label'
                                id='filter-type'
                                value={filters.type}
                                label={t('filters.type')}
                                onChange={(e) => {
                                    setFilter('type', e.target.value);
                                }}
                            >
                                {typeChoices}
                            </Select>
                        </FormControl>
                    </Grid>
                    {showSetFilter && (
                        <Grid size={{ xs: 12, md: 3 }}>
                            <SetAutocomplete sets={setOptions} value={filters.set} onChange={handleSetChange} label={t('filters.set')} />
                        </Grid>
                    )}
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

export default SingleCardFilters;
