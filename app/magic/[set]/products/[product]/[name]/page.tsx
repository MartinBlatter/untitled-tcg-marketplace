'use client';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import BuyableCardList from '@/src/components/BuyableCards/BuyableCardList/BuyableCardList';
import CardImageBadge from '@/src/components/CardImageBadge/CardImageBadge';
import ImageWithFallback from '@/src/components/ImageWithFallback/ImageWithFallback';
import SingleCardAddDialog from '@/src/components/SingleCard/SingleCardAddDialog/SingleCardAddDialog';
import SingleCardImage from '@/src/components/SingleCard/SingleCardImage/SingleCardImage';
import SingleCardWishlistDialog from '@/src/components/SingleCard/SingleCardWishlistDialog/SingleCardWishlistDialog';
import { magicSetCodeToNameMapping } from '@/src/lib/mappings/magicSetCodeToNameMapping';
import { buildProductLink, formatCurrency } from '@/src/utils/helpers';
import { Favorite, Sell } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Skeleton,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Tabs,
    Tooltip,
    Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { isEmpty } from 'ramda';
import React, { use, useState } from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div role='tabpanel' hidden={value !== index} id={`product-tabpanel-${index}`} aria-labelledby={`product-tab-${index}`} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `product-tab-${index}`,
        'aria-controls': `product-tabpanel-${index}`,
    };
}

export interface CardHistory {
    id: number;
    orderId: string;
    date: string;
    price: number;
    quantity: number;
    quality: string;
    isFoil: number;
    buyer?: string;
    seller?: string;
}

export default function SetProductName(props: { params: Promise<{ set: string; product: string; name: string }> }) {
    const params = use(props.params);
    const t = useTranslations();
    const searchParams = new URLSearchParams(window.location.search);
    const { data: session } = useSession();
    const uuid = searchParams?.get('uuid') || null;
    const [data, setData] = useState<any>([]);
    const [printingData, setPrintingData] = useState<any[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isLoadingPrintingData, setLoadingPrintingData] = useState(true);
    const currentLocale = useLocale();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showWishDialog, setShowWishDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [salesHistory, setSalesHistory] = useState<CardHistory[]>([]);
    const [purchaseHistory, setPurchaseHistory] = useState<CardHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        if (newValue === 1 && historyLoading) {
            fetchHistoryData();
        }
    };

    const fetchHistoryData = async () => {
        try {
            if (!session || !uuid) {
                // If user is not logged in or missing UUID, we can't fetch history
                setHistoryLoading(false);
                return;
            }

            const response = await fetch(`/api/magic/cards/history?uuid=${uuid}`);
            const data = await response.json();

            if (data.success) {
                setSalesHistory(data.salesHistory || []);
                setPurchaseHistory(data.purchaseHistory || []);
            } else {
                console.error('Failed to fetch history data:', data.error);
            }

            setHistoryLoading(false);
        } catch (error) {
            console.error('Error fetching history data:', error);
            setHistoryLoading(false);
        }
    };

    React.useEffect(() => {
        fetch(`/api/magic/cards/single/?uuid=${uuid}&locale=${currentLocale}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    data = data[0];
                }
                setData(data);
                setLoading(false);
                fetch(`/api/magic/cards/single/printing-ids?printings=${data.printings}&name=${data.name}`)
                    .then((res2) => res2.json())
                    .then((printData) => {
                        setPrintingData(printData);
                        setLoadingPrintingData(false);
                    });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) return <LinearProgress sx={{ mt: 5 }} />;

    if (!isLoading && !isEmpty(data)) {
        // Sales history columns
        const salesColumns: GridColDef[] = [
            {
                field: 'date',
                headerName: t('products.history.date'),
                width: 140,
                renderCell: (params: GridRenderCellParams) => (
                    <Tooltip title={t('products.history.jumpToOrder')}>
                        <Link href={`/sales/delivered?orderId=${params.row.orderId}`}>{new Date(params.value as string).toLocaleDateString()}</Link>
                    </Tooltip>
                ),
            },
            {
                field: 'price',
                headerName: t('products.history.price'),
                width: 100,
                valueGetter: (value, row) => {
                    return `${formatCurrency(row.price)}`;
                },
            },
            { field: 'quantity', headerName: t('products.history.quantity'), width: 100 },
            { field: 'quality', headerName: t('products.history.quality'), width: 100 },
            { field: 'buyer', headerName: t('products.history.buyer'), width: 180 },
            { field: 'isFoil', headerName: t('products.history.foil'), width: 100, type: 'boolean' },
        ];

        // Purchase history columns
        const purchaseColumns: GridColDef[] = [
            {
                field: 'date',
                headerName: t('products.history.date'),
                width: 140,
                renderCell: (params: GridRenderCellParams) => (
                    <Tooltip title={t('products.history.jumpToOrder')}>
                        <Link href={`/purchases/delivered?orderId=${params.row.orderId}`}>{new Date(params.value as string).toLocaleDateString()}</Link>
                    </Tooltip>
                ),
            },
            {
                field: 'price',
                headerName: t('products.history.price'),
                width: 100,
                valueGetter: (value, row) => {
                    return `${formatCurrency(row.price)}`;
                },
            },
            { field: 'quantity', headerName: t('products.history.quantity'), width: 100 },
            { field: 'quality', headerName: t('products.history.quality'), width: 100 },
            { field: 'seller', headerName: t('products.history.seller'), width: 180 },
            { field: 'isFoil', headerName: t('products.history.foil'), width: 100, type: 'boolean' },
        ];

        return (
            <>
                <BasicBreadcrumbs
                    current={data.name}
                    previous={[
                        { text: t(`products.title`), url: `/magic/products` },
                        {
                            text: magicSetCodeToNameMapping[data.setCode as keyof typeof magicSetCodeToNameMapping],
                            url: `/magic/${data.setCode}/products`,
                        },
                        {
                            text: t(`products.categories.${params.product}`),
                            url: `/magic/${data.setCode}/products/${params.product}`,
                        },
                    ]}
                />
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant='h4' component={'h1'} sx={{ textTransform: 'capitalize' }}>
                        {data.foreignName ? data.foreignName : data.name}
                    </Typography>
                    <Typography variant='h6' sx={{ textTransform: 'capitalize' }}>
                        {magicSetCodeToNameMapping[data.setCode as keyof typeof magicSetCodeToNameMapping]}
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 2 }} />
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card key={data.uuid} sx={{ margin: '0 auto', padding: '1rem' }}>
                                <Box sx={{ width: '264px', margin: '0 auto' }}>
                                    <SingleCardImage card={data} showOverlay={false} />
                                </Box>
                                {session && (
                                    <>
                                        <Button variant='outlined' sx={{ mt: 2 }} fullWidth startIcon={<Sell />} onClick={() => setShowAddDialog(true)}>
                                            {t('products.details.sell')}
                                        </Button>
                                        <Button variant='outlined' sx={{ mt: 2 }} fullWidth startIcon={<Favorite />} onClick={() => setShowWishDialog(true)}>
                                            {t('products.details.want')}
                                        </Button>
                                    </>
                                )}
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={tabValue} onChange={handleTabChange} aria-label='product detail tabs'>
                                    <Tab label={t('products.details.tabs.info')} {...a11yProps(0)} />
                                    <Tab label={t('products.details.tabs.history')} {...a11yProps(1)} />
                                </Tabs>
                            </Box>
                            <TabPanel value={tabValue} index={0}>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableBody>
                                            <TableRow key='set'>
                                                <TableCell width={150}>{t('products.details.infoTable.set')}</TableCell>
                                                <TableCell valign='middle'>
                                                    <ImageWithFallback
                                                        width={30}
                                                        height={30}
                                                        className='invertFilter'
                                                        src={`/images/magic/editions/${data.setCode.toLowerCase()}.svg`}
                                                        fallbackSrc={`/images/magic/editions/fallback.svg`}
                                                        alt={data.setCode}
                                                    />
                                                    <Link
                                                        style={{
                                                            display: 'inline-block',
                                                            position: 'relative',
                                                            marginLeft: '1rem',
                                                            top: '-0.5rem',
                                                        }}
                                                        href={{
                                                            pathname: `/magic/${data.setCode}/products/${params.product}`,
                                                        }}
                                                    >
                                                        <Box
                                                            component='span'
                                                            sx={{
                                                                display: 'inline',
                                                            }}
                                                        >
                                                            {magicSetCodeToNameMapping[data.setCode as keyof typeof magicSetCodeToNameMapping]}
                                                        </Box>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow key='printings'>
                                                <TableCell>{t('products.details.infoTable.printings')}</TableCell>
                                                <TableCell>
                                                    {isLoadingPrintingData && <Skeleton variant='rectangular' width='100%' height={20} />}
                                                    {!isLoadingPrintingData &&
                                                        printingData.map((singlePrinting) => {
                                                            if (singlePrinting.uuid === data.uuid) return null;
                                                            return (
                                                                <Tooltip
                                                                    key={`pringint-${singlePrinting.uuid}`}
                                                                    title={
                                                                        <React.Fragment>
                                                                            <CardImageBadge card={singlePrinting} />
                                                                        </React.Fragment>
                                                                    }
                                                                >
                                                                    <Button
                                                                        component='a'
                                                                        sx={{
                                                                            position: 'relative',
                                                                        }}
                                                                        href={buildProductLink('magic', singlePrinting.setCode, params.product, singlePrinting.name, singlePrinting.uuid)}
                                                                    >
                                                                        <ImageWithFallback
                                                                            height={30}
                                                                            width={30}
                                                                            className='invertFilter'
                                                                            src={`/images/magic/editions/${singlePrinting.setCode.toLowerCase()}.svg`}
                                                                            fallbackSrc={`/images/magic/editions/fallback.svg`}
                                                                            alt={singlePrinting.setCode}
                                                                        />
                                                                    </Button>
                                                                </Tooltip>
                                                            );
                                                        })}
                                                    {!isLoadingPrintingData && printingData.length === 1 && '-'}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow key='number'>
                                                <TableCell>{t('products.details.infoTable.number')}</TableCell>
                                                <TableCell>{data.number}</TableCell>
                                            </TableRow>
                                            <TableRow key='rarity'>
                                                <TableCell>{t('products.details.infoTable.rarity')}</TableCell>
                                                <TableCell>
                                                    <Box
                                                        component='span'
                                                        sx={{
                                                            marginRight: '10px',
                                                            position: 'relative',
                                                            top: '3px',
                                                        }}
                                                        className={`magic-rarity ${data.rarity} `}
                                                    />{' '}
                                                    <Box component='span' className='capitalize'>
                                                        {data.rarity}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow key='type'>
                                                <TableCell>{t('products.details.infoTable.type')}</TableCell>
                                                <TableCell>{data.foreignType ? data.foreignType : data.type}</TableCell>
                                            </TableRow>
                                            <TableRow key='text'>
                                                <TableCell>{t('products.details.infoTable.text')}</TableCell>
                                                <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{data.foreignText ? data.foreignText : data.text}</TableCell>
                                            </TableRow>
                                            <TableRow key='flavorText'>
                                                <TableCell>{t('products.details.infoTable.flavorText')}</TableCell>
                                                <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{data.foreignFlavorText ? data.foreignFlavorText : data.flavorText ? data.flavorText : '-'}</TableCell>
                                            </TableRow>
                                            <TableRow key='artist'>
                                                <TableCell>{t('products.details.infoTable.artist')}</TableCell>
                                                <TableCell>{data.artist}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </TabPanel>
                            <TabPanel value={tabValue} index={1}>
                                {historyLoading ? (
                                    <LinearProgress />
                                ) : !session ? (
                                    <Alert severity='info'>{t('products.history.loginRequired') || 'Please login to view your purchase and sales history for this card'}</Alert>
                                ) : (
                                    <>
                                        <Typography variant='h6' sx={{ mb: 2 }}>
                                            {t('products.history.sales')}
                                        </Typography>
                                        {salesHistory.length === 0 ? (
                                            <Alert severity='info' sx={{ mb: 4 }}>
                                                {t('products.history.noSales') || 'You have no sales history for this card'}
                                            </Alert>
                                        ) : (
                                            <DataGrid
                                                rows={salesHistory}
                                                columns={salesColumns}
                                                initialState={{
                                                    pagination: {
                                                        paginationModel: { pageSize: 5 },
                                                    },
                                                    sorting: {
                                                        sortModel: [{ field: 'date', sort: 'desc' }],
                                                    },
                                                }}
                                                pageSizeOptions={[5, 10]}
                                                disableRowSelectionOnClick
                                                sx={{ mb: 4 }}
                                            />
                                        )}

                                        <Typography variant='h6' sx={{ mb: 2, mt: 3 }}>
                                            {t('products.history.purchases')}
                                        </Typography>
                                        {purchaseHistory.length === 0 ? (
                                            <Alert severity='info'>{t('products.history.noPurchases') || 'You have no purchase history for this card'}</Alert>
                                        ) : (
                                            <DataGrid
                                                rows={purchaseHistory}
                                                columns={purchaseColumns}
                                                initialState={{
                                                    pagination: {
                                                        paginationModel: { pageSize: 5 },
                                                    },
                                                    sorting: {
                                                        sortModel: [{ field: 'date', sort: 'desc' }],
                                                    },
                                                }}
                                                pageSizeOptions={[5, 10]}
                                                disableRowSelectionOnClick
                                            />
                                        )}
                                    </>
                                )}
                            </TabPanel>
                        </Grid>
                    </Grid>
                </Paper>
                <BuyableCardList uuid={data.uuid} name={data.name} />
                <SingleCardAddDialog show={showAddDialog} setShow={setShowAddDialog} card={data} />
                <SingleCardWishlistDialog show={showWishDialog} setShow={setShowWishDialog} card={data} wishlistId={0} wishlistItem={null} />
            </>
        );
    }

    return null;
}
