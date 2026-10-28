'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import SingleCardList from '@/src/components/SingleCard/SingleCardList/SingleCardList';
import SingleCardPagination from '@/src/components/SingleCard/SingleCardPagination/SingleCardPagination';
import SingleCardTiles from '@/src/components/SingleCard/SingleCardTiles/SingleCardTiles';
import { colorsEnum, colorsLogicEnum } from '@/src/constants/colors';
import { formatsEnum, formatsLogicEnum } from '@/src/constants/formats';
import { raritiesEnum } from '@/src/constants/rarities';
import { statsLogicEnum } from '@/src/constants/stats';
import { AddCircleOutlined, ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Backdrop,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    Menu,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { ChangeEvent, ReactElement, useState } from 'react';
import * as yup from 'yup';
import { DetailedSearchParams } from './types';

export default function Products() {
    const currentLocale = useLocale();
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [expanded, setExpanded] = React.useState(true);
    const [options, setOptions] = useState({
        subtypes: [],
        types: [],
        keywords: [],
        sets: [{ code: '', name: '' }],
    });
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [data, setData] = useState({});
    const showAddManaSymbolList = Boolean(anchorEl);
    const [sortBy, setSortBy] = React.useState('name');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [page, setPage] = React.useState(1);
    const [size, setSize] = React.useState(60);
    const { data: session } = useSession();
    const [viewMode, setViewMode] = React.useState(session?.settings?.find((setting: any) => setting.name === 'searchView')?.value || 'list');

    const handleAddManySymbolClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleAddManaSymbolClose = () => {
        setAnchorEl(null);
    };

    const submitSearch = (values: DetailedSearchParams, setSubmitting: (isSubmitting: boolean) => void) => {
        setCardsLoading(true);
        setSubmitting(true);
        setShowBackdrop(true);
        values.page = page;
        values.pageSize = size;
        values.sortBy = sortBy;
        values.sortOrder = sortOrder;
        fetch(`/api/magic/cards/search`, {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setShowBackdrop(false);
                setCardsLoading(false);
                setExpanded(false);
                setSubmitting(false);
                window.scrollTo(0, 0);
            });
    };

    const getOptions = () => {
        fetch(`/api/magic/cards/search/options`, {
            method: 'GET',
        })
            .then((res) => res.json())
            .then((data) => {
                setOptions(data);
                setLoading(false);
            });
    };

    React.useEffect(() => {
        if (loading) {
            getOptions();
        } else {
            document.getElementById('search-form-submit')?.click();
        }
    }, [page, size, sortBy, sortOrder]);

    React.useEffect(() => {
        if (session) {
            if (session.settings && session.settings.find((setting: any) => setting.name === 'searchView')) {
                const viewMode = session.settings.find((setting: any) => setting.name === 'searchView');
                setViewMode(viewMode.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultSearchSort')) {
                const sortBy = session.settings.find((setting: any) => setting.name === 'defaultSearchSort');
                setSortBy(sortBy.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultSearchSortDirection')) {
                const sortOrder = session.settings.find((setting: any) => setting.name === 'defaultSearchSortDirection');
                setSortOrder(sortOrder.value);
            }
        }
    }, [session]);

    React.useEffect(() => {
        if (session) {
            if (session.settings && session.settings.find((setting: any) => setting.name === 'searchView')) {
                const viewMode = session.settings.find((setting: any) => setting.name === 'searchView');
                setViewMode(viewMode.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultSearchSort')) {
                const sortBy = session.settings.find((setting: any) => setting.name === 'defaultSearchSort');
                setSortBy(sortBy.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultSearchSortDirection')) {
                const sortOrder = session.settings.find((setting: any) => setting.name === 'defaultSearchSortDirection');
                setSortOrder(sortOrder.value);
            }
        }
    }, [session]);

    const handleChangePage = (event: ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
        setSize(parseInt(event.target.value, 10));
        setPage(1);
    };

    const setSorting = (column: string) => {
        if (column === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortOrder('asc');
            setSortBy(column);
        }
    };

    const statManaValueLogicSelectItems: ReactElement[] = [];
    const statPowerLogicSelectItems: ReactElement[] = [];
    const statToughnessLogicSelectItems: ReactElement[] = [];
    const statLoyaltyLogicSelectItems: ReactElement[] = [];
    statsLogicEnum.forEach((logic) => {
        statManaValueLogicSelectItems.push(
            <MenuItem key={`stats-logic-mv-${logic}`} value={logic}>
                {t(`search.form.logic.${logic}`)}
            </MenuItem>
        );
        statPowerLogicSelectItems.push(
            <MenuItem key={`stats-logic-p-${logic}`} value={logic}>
                {t(`search.form.logic.${logic}`)}
            </MenuItem>
        );
        statToughnessLogicSelectItems.push(
            <MenuItem key={`stats-logic-t-${logic}`} value={logic}>
                {t(`search.form.logic.${logic}`)}
            </MenuItem>
        );
        statLoyaltyLogicSelectItems.push(
            <MenuItem key={`stats-logic-l-${logic}`} value={logic}>
                {t(`search.form.logic.${logic}`)}
            </MenuItem>
        );
    });

    const colorLogicSelectItems: ReactElement[] = [];
    colorsLogicEnum.forEach((logic) => {
        colorLogicSelectItems.push(
            <MenuItem key={`color-logic-${logic}`} value={logic}>
                {t(`search.form.logic.${logic}`)}
            </MenuItem>
        );
    });

    const formatLogicSelectItems: ReactElement[] = [];
    formatsLogicEnum.forEach((logic) => {
        formatLogicSelectItems.push(
            <MenuItem key={`format-logic-${logic}`} value={logic}>
                {t(`search.form.logic.${logic}`)}
            </MenuItem>
        );
    });

    const handleAddManaSymbolClick = (symbol: string, setFieldValue: any, value: string) => {
        setFieldValue('manaCost', value + symbol);
        handleAddManaSymbolClose();
    };

    return (
        <>
            <BasicBreadcrumbs current={t(`search.title`)} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`search.title`)}
            </Typography>
            <Accordion defaultExpanded expanded={expanded}>
                <AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel3-content' id='search-accordion' onClick={() => setExpanded(!expanded)}>
                    <Typography variant='h5'>{t(`search.accordion.title`)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Backdrop
                        sx={(theme) => ({
                            color: '#fff',
                            zIndex: theme.zIndex.drawer + 1,
                        })}
                        open={showBackdrop}
                    >
                        <CircularProgress color='inherit' />
                    </Backdrop>
                    {loading ? (
                        <LinearProgress />
                    ) : (
                        <Formik
                            initialValues={{
                                name: '',
                                text: '',
                                types: [],
                                subtypes: [],
                                colors: [],
                                manaCost: '',
                                formats: [],
                                formatsLogic: 'legal',
                                sets: [],
                                rarity: [],
                                keywords: [],
                                priceMin: 0,
                                priceMax: 0,
                                artist: '',
                                flavorText: '',
                                loyalty: '',
                                power: '',
                                toughness: '',
                                manaValue: '',
                                loyaltyLogic: 'equal',
                                powerLogic: 'equal',
                                toughnessLogic: 'equal',
                                manaValueLogic: 'equal',
                                page: 1,
                                pageSize: 60,
                                locale: currentLocale,
                                sortBy: 'name',
                                sortOrder: 'asc',
                            }}
                            validationSchema={yup.object({})}
                            onSubmit={(values, { setSubmitting }) => {
                                submitSearch(values, setSubmitting);
                            }}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
                                <form onSubmit={handleSubmit} id='search-form'>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField id='name' label={t('search.form.name')} variant='outlined' value={values.name} onChange={handleChange} onBlur={handleBlur} fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField id='text' label={t('search.form.text')} variant='outlined' value={values.text} onChange={handleChange} onBlur={handleBlur} fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Autocomplete
                                                multiple
                                                id='types'
                                                options={options.types}
                                                onChange={(event: any, newValue: string[] | null) => {
                                                    setFieldValue('types', newValue);
                                                }}
                                                getOptionLabel={(option) => option}
                                                renderInput={(params) => <TextField {...params} variant='outlined' label={t('search.form.types')} />}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Autocomplete
                                                multiple
                                                id='subtypes'
                                                onChange={(event: any, newValue: string[] | null) => {
                                                    setFieldValue('subtypes', newValue);
                                                }}
                                                options={options.subtypes}
                                                getOptionLabel={(option) => option}
                                                renderInput={(params) => <TextField {...params} variant='outlined' label={t('search.form.subtypes')} />}
                                            />
                                        </Grid>
                                        <Grid container spacing={2} size={{ xs: 12 }}>
                                            {(() => {
                                                const colorCheckboxes: ReactElement[] = [];

                                                colorsEnum.map((color) => {
                                                    colorCheckboxes.push(
                                                        <Grid size={{ xs: 2 }} key={`grid-color-${color}`}>
                                                            <FormControlLabel
                                                                key={`color-${color}`}
                                                                control={<Checkbox />}
                                                                onChange={() => {
                                                                    if ((values.colors as any).includes(color)) {
                                                                        setFieldValue(
                                                                            'colors',
                                                                            values.colors.filter((c: string) => c !== color)
                                                                        );
                                                                    } else {
                                                                        setFieldValue('colors', [...values.colors, color]);
                                                                    }
                                                                }}
                                                                label={
                                                                    <>
                                                                        <Image src={`/images/magic/mana/${color}.svg`} alt={t(`colors.${color}`)} width={15} height={15} />
                                                                        <Typography
                                                                            component={'span'}
                                                                            sx={{
                                                                                ml: 1,
                                                                            }}
                                                                        >
                                                                            {t(`colors.${color}`)}
                                                                        </Typography>
                                                                    </>
                                                                }
                                                            />
                                                        </Grid>
                                                    );
                                                });

                                                return colorCheckboxes;
                                            })()}
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <FormControl fullWidth>
                                                <InputLabel htmlFor='manaCost'>{t('search.form.manaCost')}</InputLabel>
                                                <OutlinedInput
                                                    id='manaCost'
                                                    name='manaCost'
                                                    type='text'
                                                    value={values.manaCost}
                                                    onChange={handleChange}
                                                    endAdornment={
                                                        <InputAdornment position='end'>
                                                            <Tooltip title={t('search.form.addManaSymbol')}>
                                                                <IconButton
                                                                    aria-label={t('search.form.addManaSymbol')}
                                                                    aria-controls={showAddManaSymbolList ? 'basic-menu' : undefined}
                                                                    aria-haspopup='true'
                                                                    aria-expanded={showAddManaSymbolList ? 'true' : undefined}
                                                                    onClick={handleAddManySymbolClick}
                                                                    edge='end'
                                                                >
                                                                    <AddCircleOutlined />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Menu
                                                                id='basic-menu'
                                                                anchorEl={anchorEl}
                                                                open={showAddManaSymbolList}
                                                                onClose={handleAddManaSymbolClose}
                                                                slotProps={{
                                                                    list: { 'aria-labelledby': 'basic-button' },
                                                                }}
                                                            >
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{W}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.W')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{U}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.U')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{B}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.B')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{R}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.R')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{G}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.G')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{C}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.C')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{X}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.X')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{0}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.0')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{1}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.1')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{2}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.2')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{3}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.3')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{4}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.4')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{5}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.5')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{6}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.6')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{7}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.7')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{8}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.8')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{9}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.9')}</MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{10}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.10')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{11}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.11')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{12}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.12')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{13}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.13')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{14}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.14')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{15}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.15')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{16}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.16')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{W/U}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.WU')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{W/B}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.WB')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{B/R}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.BR')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{B/G}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.BG')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{U/B}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.UB')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{U/R}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.UR')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{R/G}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.RG')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{R/W}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.RW')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{G/W}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.GW')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{G/U}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.GU')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{G/U/P}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.GUP')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{G/W/P}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.GWP')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{C/W}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.CW')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{C/U}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.CU')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{C/B}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.CB')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{C/R}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.CR')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{C/G}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.CG')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{2/W}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.2W')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{2/U}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.2U')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{2/B}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.2B')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{2/R}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.2R')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{2/G}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.2G')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{W/P}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.WP')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{U/P}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.UP')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{B/P}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.BP')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{R/P}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.RP')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{G/P}', setFieldValue, values.manaCost)}>
                                                                    {t('search.form.manaSymbolMenu.GP')}
                                                                </MenuItem>
                                                                <MenuItem onClick={() => handleAddManaSymbolClick('{S}', setFieldValue, values.manaCost)}>{t('search.form.manaSymbolMenu.S')}</MenuItem>
                                                            </Menu>
                                                        </InputAdornment>
                                                    }
                                                    label={t('search.form.manaCost')}
                                                    fullWidth
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Autocomplete
                                                multiple
                                                id='keywords'
                                                options={options.keywords}
                                                onChange={(event: any, newValue: string[] | null) => {
                                                    setFieldValue('keywords', newValue);
                                                }}
                                                getOptionLabel={(option) => option}
                                                renderInput={(params) => <TextField {...params} variant='outlined' label={t('search.form.keywords')} />}
                                            />
                                        </Grid>
                                        <Grid container spacing={4} size={{ xs: 12 }}>
                                            <Grid
                                                size={{ xs: 3 }}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant='body1'>{t('search.form.manaValue')}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 4.5 }}>
                                                <FormControl fullWidth>
                                                    <Select id='manaValueLogic' name='manaValueLogic' value={values.manaValueLogic} onChange={handleChange} onBlur={handleBlur}>
                                                        {statManaValueLogicSelectItems}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 4.5 }}>
                                                <TextField
                                                    id='manaValue'
                                                    name='manaValue'
                                                    type='number'
                                                    label={t('search.form.value')}
                                                    variant='outlined'
                                                    value={values.manaValue}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={4} size={{ xs: 12 }}>
                                            <Grid
                                                size={{ xs: 3 }}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant='body1'>{t('search.form.power')}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 4.5 }}>
                                                <FormControl fullWidth>
                                                    <Select id='powerLogic' name='powerLogic' value={values.powerLogic} onChange={handleChange} onBlur={handleBlur}>
                                                        {statPowerLogicSelectItems}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 4.5 }}>
                                                <TextField
                                                    id='power'
                                                    name='power'
                                                    type='number'
                                                    label={t('search.form.value')}
                                                    variant='outlined'
                                                    value={values.power}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={4} size={{ xs: 12 }}>
                                            <Grid
                                                size={{ xs: 3 }}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant='body1'>{t('search.form.toughness')}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 4.5 }}>
                                                <FormControl fullWidth>
                                                    <Select id='toughnessLogic' name='toughnessLogic' value={values.toughnessLogic} onChange={handleChange} onBlur={handleBlur}>
                                                        {statToughnessLogicSelectItems}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 4.5 }}>
                                                <TextField
                                                    id='toughness'
                                                    name='toughness'
                                                    type='number'
                                                    label={t('search.form.value')}
                                                    variant='outlined'
                                                    value={values.toughness}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={4} size={{ xs: 12 }}>
                                            <Grid
                                                size={{ xs: 3 }}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant='body1'>{t('search.form.loyalty')}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 4.5 }}>
                                                <FormControl fullWidth>
                                                    <Select id='loyaltyLogic' name='loyaltyLogic' value={values.loyaltyLogic} onChange={handleChange} onBlur={handleBlur}>
                                                        {statLoyaltyLogicSelectItems}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 4.5 }}>
                                                <TextField
                                                    id='loyalty'
                                                    name='loyalty'
                                                    type='number'
                                                    label={t('search.form.value')}
                                                    variant='outlined'
                                                    value={values.loyalty}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={4} size={{ xs: 12 }}>
                                            <Grid size={{ xs: 3 }}>
                                                <FormControl fullWidth>
                                                    <Select id='formatsLogic' name='formatsLogic' value={values.formatsLogic} onChange={handleChange} fullWidth>
                                                        {formatLogicSelectItems}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 9 }}>
                                                <Autocomplete
                                                    multiple
                                                    id='formats'
                                                    onChange={(event: any, newValue: string[] | null) => {
                                                        setFieldValue('formats', newValue);
                                                    }}
                                                    options={formatsEnum}
                                                    getOptionLabel={(option) => option}
                                                    renderInput={(params) => <TextField {...params} variant='outlined' label={t('search.form.formats')} />}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Autocomplete
                                                multiple
                                                id='setCodes'
                                                options={options.sets}
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
                                                    setFieldValue('sets', newValue);
                                                }}
                                                renderInput={(params) => <TextField {...params} variant='outlined' label={t('search.form.sets')} />}
                                            />
                                        </Grid>
                                        <Grid container spacing={4} size={{ xs: 12 }}>
                                            {(() => {
                                                const rarityCheckboxes: ReactElement[] = [];

                                                raritiesEnum.map((rarity) => {
                                                    rarityCheckboxes.push(
                                                        <Grid size={{ xs: 2.4 }} key={`rarity-grid-${rarity}`}>
                                                            <FormControlLabel
                                                                key={`rarity-${rarity}`}
                                                                onChange={() => {
                                                                    if ((values.rarity as any).includes(rarity)) {
                                                                        setFieldValue(
                                                                            'rarity',
                                                                            values.rarity.filter((c: string) => c !== rarity)
                                                                        );
                                                                    } else {
                                                                        setFieldValue('rarity', [...values.rarity, rarity]);
                                                                    }
                                                                }}
                                                                control={<Checkbox />}
                                                                label={
                                                                    <>
                                                                        <Typography
                                                                            className={`magic-rarity ${rarity}`}
                                                                            component={'span'}
                                                                            sx={{
                                                                                mr: 1,
                                                                            }}
                                                                        ></Typography>
                                                                        {t(`rarities.${rarity}`)}
                                                                    </>
                                                                }
                                                            />
                                                        </Grid>
                                                    );
                                                });

                                                return rarityCheckboxes;
                                            })()}
                                        </Grid>
                                        <Grid container spacing={4} size={{ xs: 12 }}>
                                            <Grid size={{ xs: 6 }}>
                                                <TextField
                                                    id='priceMin'
                                                    type='number'
                                                    label={t('search.form.priceMin')}
                                                    variant='outlined'
                                                    slotProps={{
                                                        input: {
                                                            inputProps: {
                                                                step: '0.01',
                                                            },
                                                        },
                                                    }}
                                                    value={values.priceMin}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <TextField
                                                    id='priceMax'
                                                    type='number'
                                                    label={t('search.form.priceMax')}
                                                    variant='outlined'
                                                    slotProps={{
                                                        input: {
                                                            inputProps: {
                                                                step: '0.01',
                                                            },
                                                        },
                                                    }}
                                                    value={values.priceMax}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField id='artist' label={t('search.form.artist')} variant='outlined' value={values.artist} onChange={handleChange} onBlur={handleBlur} fullWidth />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                id='flavorText'
                                                label={t('search.form.flavorText')}
                                                variant='outlined'
                                                value={values.flavorText}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button id='search-form-submit' type='submit' variant='contained'>
                                                {t('search.form.search')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        </Formik>
                    )}
                </AccordionDetails>
            </Accordion>
            {(data as any).cards &&
                (data as any).cards.length > 0 &&
                (viewMode === 'list' ? (
                    <>
                        <SingleCardPagination
                            count={(data as any).count[0].count}
                            page={page}
                            size={size}
                            setViewMode={setViewMode}
                            handleChangePage={handleChangePage}
                            handleChangeRowsPerPage={handleChangeRowsPerPage}
                            position='top'
                        />
                        <SingleCardList cards={(data as any).cards} loading={cardsLoading} setSortBy={setSorting} sortBy={sortBy} sortOrder={sortOrder} />
                        <SingleCardPagination
                            count={(data as any).count[0].count}
                            page={page}
                            size={size}
                            setViewMode={setViewMode}
                            handleChangePage={handleChangePage}
                            handleChangeRowsPerPage={handleChangeRowsPerPage}
                            position='bottom'
                        />
                    </>
                ) : (
                    <>
                        <SingleCardPagination
                            count={(data as any).count[0].count}
                            page={page}
                            size={size}
                            setViewMode={setViewMode}
                            handleChangePage={handleChangePage}
                            handleChangeRowsPerPage={handleChangeRowsPerPage}
                            position='top'
                        />
                        <SingleCardTiles cards={(data as any).cards} loading={cardsLoading} setSortBy={setSorting} sortBy={sortBy} sortOrder={sortOrder} />
                        <SingleCardPagination
                            count={(data as any).count[0].count}
                            page={page}
                            size={size}
                            setViewMode={setViewMode}
                            handleChangePage={handleChangePage}
                            handleChangeRowsPerPage={handleChangeRowsPerPage}
                            position='bottom'
                        />
                    </>
                ))}
        </>
    );
}
