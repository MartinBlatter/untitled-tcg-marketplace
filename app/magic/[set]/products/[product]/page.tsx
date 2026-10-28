'use client';

import { getCardsAction } from '@/src/actions/cards';
import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import SingleCardFilters from '@/src/components/SingleCard/SingleCardFilters/SingleCardFilters';
import SingleCardList from '@/src/components/SingleCard/SingleCardList/SingleCardList';
import SingleCardPagination from '@/src/components/SingleCard/SingleCardPagination/SingleCardPagination';
import SingleCardTiles from '@/src/components/SingleCard/SingleCardTiles/SingleCardTiles';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { magicSetCodeToNameMapping } from '@/src/lib/mappings/magicSetCodeToNameMapping';
import { LinearProgress, SelectChangeEvent, Typography } from '@mui/material';
import { useSession } from '@/src/lib/context/AuthProvider';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { ChangeEvent, use, useState } from 'react';

export default function SetProduct(props: { params: Promise<{ set: string; product: string }> }) {
    const params = use(props.params);
    const t = useTranslations();
    const currentLocale = useLocale();
    const [data, setData] = useState<any>({ cards: [], count: 0 });
    const [isLoading, setLoading] = useState(true);
    const [isTableLoading, setTableLoading] = useState(true);
    const searchParams = useSearchParams();
    const [page, setPage] = React.useState(searchParams?.get('page') ? parseInt(searchParams?.get('page') as unknown as string) : 1);
    const [size, setSize] = React.useState(searchParams?.get('size') ? parseInt(searchParams?.get('size') as unknown as string) : 60);
    const router = useRouter();
    const [sortBy, setSortBy] = React.useState('name');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [filters, setFilters] = React.useState({ rarity: '', type: '' });
    const { data: session } = useSession();
    const [viewMode, setViewMode] = React.useState(session?.settings?.find((setting: any) => setting.name === 'productView')?.value || 'list');

    const handleChangePage = (event: ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
        router.push(`?page=${newPage}&size=${size}`);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
        setSize(parseInt(event.target.value, 10));
        setPage(1);
        router.push(`?page=1&size=${parseInt(event.target.value, 10)}`);
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
        setFilters({ ...filters, [column]: value });
    };

    React.useEffect(() => {
        setTableLoading(true);
        getCardsAction(currentLocale, '%', size, page, params.set, sortBy, sortOrder, filters).then((data) => {
            setData(data);
            setTableLoading(false);
            setLoading(false);
        });
    }, [page, size, currentLocale, params.set, sortBy, sortOrder, filters, session]);

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
        }
    }, [session]);

    return (
        <>
            <BasicBreadcrumbs
                current={t(`products.categories.${params.product}`)}
                previous={[
                    { text: t(`products.title`), url: INTERNAL_ROUTES.MAGIC.PRODUCTS },
                    {
                        text: magicSetCodeToNameMapping[params.set as keyof typeof magicSetCodeToNameMapping],
                        url: INTERNAL_ROUTES.MAGIC.SET_PRODUCTS(params.set),
                    },
                ]}
            />
            <Typography
                variant='h4'
                sx={{
                    textAlign: 'center',
                    textTransform: 'capitalize',
                    position: 'relative',
                }}
            >
                {magicSetCodeToNameMapping[params.set as keyof typeof magicSetCodeToNameMapping]} {t(`products.categories.${params.product}`)}
            </Typography>
            {isLoading ? (
                <LinearProgress sx={{ mt: 5 }} />
            ) : viewMode === 'list' ? (
                <>
                    <SingleCardFilters filters={filters} setFilter={setFilter} setFilters={setFilters} />
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
                    <SingleCardFilters filters={filters} setFilter={setFilter} setFilters={setFilters} />
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
