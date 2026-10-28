import { Clear, FilterAlt } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, FormControl, Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { SalesFiltersProps, SalesFiltersType } from '../types';

const SalesFilters = ({ filters: storeFilters, setFilters, resetFilters, loading, autoExpand = false }: SalesFiltersProps) => {
    const t = useTranslations();
    const [localFilters, setLocalFilters] = React.useState<SalesFiltersType>(storeFilters);
    const [isExpanded, setIsExpanded] = React.useState<boolean>(autoExpand);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters(localFilters);
    };

    const handleChange = (key: string, value: string) => {
        setLocalFilters((prev: SalesFiltersType) => ({ ...prev, [key]: value }));
    };

    const handleDateChange = (key: string, value: dayjs.Dayjs | null) => {
        setLocalFilters((prev: SalesFiltersType) => ({ ...prev, [key]: value ? value.format('YYYY-MM-DD') : '' }));
    };

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalFilters({
            buyerName: '',
            minPrice: '',
            maxPrice: '',
            createdAtStart: '',
            createdAtEnd: '',
            itemName: '',
            orderId: '',
        });
        resetFilters();
    };

    const hasFilters = localFilters ? Object.values(localFilters).some((value) => value !== '') : false;

    // Update local filters when store filters change (e.g. from URL params)
    useEffect(() => {
        setLocalFilters(storeFilters);
        // Auto expand if we have filters from URL
        if (Object.values(storeFilters).some((value) => value !== '')) {
            setIsExpanded(true);
        }
    }, [storeFilters]);

    return (
        <Accordion sx={{ my: '2rem' }} expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='filter-panel-content' id='filter-panel-header'>
                <Grid container>
                    <Grid size={{ xs: 12 }}>
                        {t('filters.title')}
                        {hasFilters && (
                            <Button variant='outlined' size='small' sx={{ ml: '1rem' }} onClick={handleReset} startIcon={<Clear />}>
                                {t('filters.reset')}
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <TextField label={t('filters.buyerName')} value={localFilters.buyerName} onChange={(e) => handleChange('buyerName', e.target.value)} />
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <TextField label={t('filters.itemName')} value={localFilters.itemName} onChange={(e) => handleChange('itemName', e.target.value)} />
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <TextField type='number' label={t('filters.minPrice')} value={localFilters.minPrice} onChange={(e) => handleChange('minPrice', e.target.value)} />
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <TextField type='number' label={t('filters.maxPrice')} value={localFilters.maxPrice} onChange={(e) => handleChange('maxPrice', e.target.value)} />
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <DatePicker
                                    label={t('filters.createdAtStart')}
                                    value={localFilters.createdAtStart ? dayjs(localFilters.createdAtStart) : null}
                                    onChange={(date) => handleDateChange('createdAtStart', date)}
                                />
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <DatePicker
                                    label={t('filters.createdAtEnd')}
                                    value={localFilters.createdAtEnd ? dayjs(localFilters.createdAtEnd) : null}
                                    onChange={(date) => handleDateChange('createdAtEnd', date)}
                                />
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <TextField label={t('filters.orderId')} value={localFilters.orderId} onChange={(e) => handleChange('orderId', e.target.value)} />
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button type='submit' variant='contained' startIcon={<FilterAlt />} loading={loading}>
                                    {t('filters.filter')}
                                </Button>
                                <Button onClick={handleReset} variant='outlined' startIcon={<Clear />} loading={loading}>
                                    {t('filters.reset')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </AccordionDetails>
        </Accordion>
    );
};

export default SalesFilters;
