'use client';

import { getCardsAction } from '@/src/actions/cards';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import SingleCardFilters from '@/src/components/SingleCard/SingleCardFilters/SingleCardFilters';
import SingleCardList from '@/src/components/SingleCard/SingleCardList/SingleCardList';
import SingleCardPagination from '@/src/components/SingleCard/SingleCardPagination/SingleCardPagination';
import SingleCardTiles from '@/src/components/SingleCard/SingleCardTiles/SingleCardTiles';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { LinearProgress, SelectChangeEvent, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { ChangeEvent, use, useState } from 'react';

export default function Product(props: { params: Promise<{ product: string }> }) {
    const params = use(props.params);
    const t = useTranslations();
    const currentLocale = useLocale();
    const [data, setData] = useState<any[any]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isTableLoading, setTableLoading] = useState(true);
    const searchParams = useSearchParams();
    const [search, setSearch] = React.useState(searchParams?.get('search') || null);
    const [page, setPage] = React.useState(searchParams?.get('page') ? parseInt(searchParams?.get('page') as unknown as string) : 1);
    const [size, setSize] = React.useState(searchParams?.get('size') ? parseInt(searchParams?.get('size') as unknown as string) : 60);
    const router = useRouter();
    const [sortBy, setSortBy] = React.useState('name');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [filters, setFilters] = React.useState({
        rarity: '',
        type: '',
        set: '',
    });
    const { data: session } = useSession();
    const [viewMode, setViewMode] = React.useState(session?.settings?.find((setting: any) => setting.name === 'productView')?.value || 'list');

    const handleChangePage = (event: ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
        router.push(`?page=${newPage}&size=${size}${search ? `&search=${search}` : ''}`);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
        setSize(parseInt(event.target.value, 10));
        setPage(1);
        router.push(`?page=1&size=${parseInt(event.target.value, 10)}${search ? `&search=${search}` : ''}`);
    };

    const setSorting = (column: string) => {
        if (column === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortOrder('asc');
            setSortBy(column);
        }
    };

    const setFilter = (column: string, value: string) => {
        filters[column as keyof typeof filters] = value;
        setFilters({ ...filters });
    };

    React.useEffect(() => {
        setTableLoading(true);
        getCardsAction(currentLocale, search ? search : '%', size, page, {}, sortBy, sortOrder, filters).then((data) => {
            setData(data);
            setLoading(false);
            setTableLoading(false);
        });
    }, [search, size, page, currentLocale, sortBy, sortOrder, filters]);

    React.useEffect(() => {
        if (session) {
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productView')) {
                const viewMode = session.settings.find((setting: any) => setting.name === 'productView');
                setViewMode(viewMode.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultProductSort')) {
                const sortBy = session.settings.find((setting: any) => setting.name === 'defaultProductSort');
                setSortBy(sortBy.value);
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'defaultProductSortDirection')) {
                const sortOrder = session.settings.find((setting: any) => setting.name === 'defaultProductSortDirection');
                setSortOrder(sortOrder.value);
            }
            let filters = { rarity: '', type: '', set: '' };
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productsRarityFilter')) {
                const rarityFilter = session.settings.find((setting: any) => setting.name === 'productsRarityFilter');
                filters.rarity = rarityFilter.value;
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productsTypeFilter')) {
                const typeFilter = session.settings.find((setting: any) => setting.name === 'productsTypeFilter');
                filters.type = typeFilter.value;
            }
            if (session.settings && session.settings.find((setting: any) => setting.name === 'productsSetFilter')) {
                const setFilter = session.settings.find((setting: any) => setting.name === 'productsSetFilter');
                filters.set = setFilter.value;
            }
            setFilters(filters);
        }
    }, [session]);

    return (
        <>
            <BasicBreadcrumbs current={t(`products.categories.${params.product}`)} previous={[{ text: t(`products.title`), url: INTERNAL_ROUTES.MAGIC.PRODUCTS }]} />
            <Typography variant='h4' component={'h1'} sx={{ textAlign: 'center' }}>
                {t(`products.categories.${params.product}`)}
            </Typography>
            {isLoading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : viewMode === 'list' ? (
                <>
                    <SingleCardFilters filters={filters} setFilter={setFilter} showSetFilter setFilters={setFilters} />
                    <SingleCardPagination
                        count={data.count}
                        page={page}
                        size={size}
                        setViewMode={setViewMode}
                        handleChangePage={handleChangePage}
                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                        position='top'
                    />
                    <SingleCardList cards={data.cards} loading={isTableLoading} sortBy={sortBy} setSortBy={setSorting} sortOrder={sortOrder} />
                    <SingleCardPagination
                        count={data.count}
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
                    <SingleCardFilters filters={filters} setFilter={setFilter} showSetFilter setFilters={setFilters} />
                    <SingleCardPagination
                        count={data.count}
                        page={page}
                        size={size}
                        setViewMode={setViewMode}
                        handleChangePage={handleChangePage}
                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                        position='top'
                    />
                    <SingleCardTiles cards={data.cards} loading={isTableLoading} sortBy={sortBy} setSortBy={setSorting} sortOrder={sortOrder} />
                    <SingleCardPagination
                        count={data.count}
                        page={page}
                        size={size}
                        setViewMode={setViewMode}
                        handleChangePage={handleChangePage}
                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                        position='bottom'
                    />
                </>
            )}
        </>
    );
}
