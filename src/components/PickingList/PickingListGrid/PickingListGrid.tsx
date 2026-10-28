import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { PICKING_LIST_ITEM_STATUS } from '@/src/constants/status';
import { PickingListItem } from '@/src/store/types';
import { CardSet } from '@/src/types/AllMTGJSONTypes';
import { InsertPhoto } from '@mui/icons-material';
import { Box, Button, Card, CardActionArea, CardContent, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import CardImageBadge from '../../CardImageBadge/CardImageBadge';
import CardImageTooltip from '../../CardImageTooltip/CardImageTooltip';
import SingleCardImage from '../../SingleCard/SingleCardImage/SingleCardImage';

interface PickingListGridProps {
    items: PickingListItem[];
    pickedItems: PickingListItem[];
    orderIndexList: number[];
    onSetItemToPicked: (item: PickingListItem) => void;
    onSetItemToUnpicked: (item: PickingListItem) => void;
    onSetItemStatus: (item: PickingListItem, status: string) => void;
    onProblemClick: (itemId: number) => void;
    onEnvelopeClick: () => void;
    viewMode?: 'list' | 'grid';
}

export default function PickingListGrid({
    items,
    pickedItems,
    orderIndexList,
    onSetItemToPicked,
    onSetItemToUnpicked,
    onSetItemStatus,
    onProblemClick,
    onEnvelopeClick,
    viewMode = 'list',
}: PickingListGridProps) {
    const t = useTranslations();

    const columns: GridColDef<PickingListItem>[] = [
        {
            field: 'status',
            headerName: t('pickinglists.status'),
            minWidth: 250,
            align: 'center',
            renderCell: (params: GridRenderCellParams<PickingListItem>) => {
                const isPicked = pickedItems.some((item) => item.id === params.row.id);
                const isFound = params.row.status === PICKING_LIST_ITEM_STATUS.FOUND;
                const isProblem = params.row.status === PICKING_LIST_ITEM_STATUS.PROBLEM;

                if (isPicked) {
                    return (
                        <Button variant='outlined' color='error' size='small' onClick={() => onSetItemToUnpicked({ ...params.row, status: '' })}>
                            {t('pickingLists.backToPicking')}
                        </Button>
                    );
                }

                if (isFound) {
                    return (
                        <Button
                            variant='contained'
                            color='success'
                            size='small'
                            onClick={() => {
                                onSetItemToPicked(params.row);
                                onEnvelopeClick();
                            }}
                        >
                            {t('pickingLists.putInEnvelope')} {orderIndexList.indexOf(params.row.orderItem?.orderId as number) + 1}
                        </Button>
                    );
                }

                if (isProblem) {
                    return (
                        <Button variant='outlined' color='error' size='small' onClick={() => onSetItemStatus(params.row, '')}>
                            {t('pickingLists.backToPicking')}
                        </Button>
                    );
                }

                return (
                    <React.Fragment key={params.row.id}>
                        <Button variant='contained' color='primary' size='small' onClick={() => onSetItemStatus(params.row, 'found')}>
                            {params.row.orderItem?.originalItem?.quantity || 1} {t('pickinglists.markAsFound')}
                        </Button>
                        <Button variant='outlined' color='error' size='small' onClick={() => onProblemClick(params.row.id)} sx={{ ml: 1 }}>
                            {t('pickinglists.problem')}
                        </Button>
                    </React.Fragment>
                );
            },
        },
        {
            field: 'image',
            headerName: '',
            renderCell: (props: GridRenderCellParams<PickingListItem, any, any, GridTreeNodeWithRender>) => {
                return (
                    <>
                        <CardImageTooltip card={props.row.card as unknown as CardSet} />
                        {props.row.orderItem?.originalItem?.imagePath && (
                            <Tooltip
                                title={
                                    <React.Fragment>
                                        <CardImageBadge card={props.row.card as unknown as CardSet} imagePath={props.row.orderItem?.originalItem?.imagePath} />
                                    </React.Fragment>
                                }
                            >
                                <InsertPhoto
                                    sx={{
                                        cursor: 'pointer',
                                    }}
                                />
                            </Tooltip>
                        )}
                    </>
                );
            },
        },
        {
            field: 'quantity',
            headerName: '',
            editable: false,
            width: 60,
            align: 'right',
            valueGetter: (value, row) => `${row.orderItem?.originalItem?.quantity || 1} x `,
        },
        { field: 'name', headerName: t('pickinglists.cardName'), flex: 1, minWidth: 200, valueGetter: (value, row) => row.card?.name },
        {
            field: 'language',
            headerName: t('pickinglists.language'),
            width: 120,
            renderCell: (props: GridRenderCellParams<PickingListItem, any, any, GridTreeNodeWithRender>) => {
                return (
                    <Image
                        height={20}
                        width={30}
                        alt={t(`localeStrings.${props.row.orderItem?.originalItem?.language || 'en'}`)}
                        src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${props.row.orderItem?.originalItem?.language || 'en'}.gif`}
                    />
                );
            },
        },
        { field: 'condition', headerName: t('pickinglists.condition'), width: 120, valueGetter: (value, row) => row.orderItem?.originalItem?.quality },
        { field: 'set', headerName: t('pickinglists.set'), width: 100, valueGetter: (value, row) => row.card?.setCode },
        { field: 'collectorNumber', headerName: t('pickinglists.collectorNumber'), width: 140, valueGetter: (value, row) => row.card?.number },
        { field: 'isFoil', headerName: t('pickinglists.foil'), width: 80, type: 'boolean', valueGetter: (value, row) => row.orderItem?.originalItem?.isFoil },
        {
            field: 'isSigned',
            headerName: t('pickinglists.signed'),
            width: 80,
            type: 'boolean',
            valueGetter: (value, row) => row.orderItem?.originalItem?.isSigned,
        },
        {
            field: 'isAltered',
            headerName: t('pickinglists.altered'),
            width: 80,
            type: 'boolean',
            valueGetter: (value, row) => row.orderItem?.originalItem?.isAltered,
        },
        {
            field: 'isMisprint',
            headerName: t('pickinglists.misprint'),
            width: 80,
            type: 'boolean',
            valueGetter: (value, row) => row.orderItem?.originalItem?.isMisprint,
        },
    ];

    const renderActionButtons = (item: PickingListItem) => {
        const isPicked = pickedItems.some((pickedItem) => pickedItem.id === item.id);
        const isFound = item.status === PICKING_LIST_ITEM_STATUS.FOUND;
        const isProblem = item.status === PICKING_LIST_ITEM_STATUS.PROBLEM;

        if (isPicked) {
            return (
                <Button variant='outlined' color='error' size='small' onClick={() => onSetItemToUnpicked({ ...item, status: '' })} fullWidth>
                    {t('pickingLists.backToPicking')}
                </Button>
            );
        }

        if (isFound) {
            return (
                <Button variant='contained' color='success' size='small' onClick={() => onSetItemToPicked(item)} fullWidth>
                    {t('pickingLists.putInEnvelope')} {orderIndexList.indexOf(item.orderItem?.orderId as number) + 1}
                </Button>
            );
        }

        if (isProblem) {
            return (
                <Button variant='outlined' color='error' size='small' onClick={() => onSetItemStatus(item, '')} fullWidth>
                    {t('pickingLists.backToPicking')}
                </Button>
            );
        }

        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant='contained' color='primary' size='small' onClick={() => onSetItemStatus(item, 'found')} sx={{ flex: 1 }}>
                    {item.orderItem?.originalItem?.quantity || 1} {t('pickinglists.markAsFound')}
                </Button>
                <Button variant='outlined' color='error' size='small' onClick={() => onProblemClick(item.id)} sx={{ flex: 1 }}>
                    {t('pickinglists.problem')}
                </Button>
            </Box>
        );
    };

    if (viewMode === 'grid') {
        return (
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 2, pb: 2, minWidth: 'min-content' }}>
                    {items.map((item) => (
                        <Card key={item.id} sx={{ width: 264, flexShrink: 0 }}>
                            <CardActionArea component={'div'}>
                                <SingleCardImage
                                    card={{
                                        ...item.card,
                                        quality: item.orderItem?.originalItem?.quality,
                                        isFoil: item.orderItem?.originalItem?.isFoil,
                                        isSigned: item.orderItem?.originalItem?.isSigned,
                                        isAltered: item.orderItem?.originalItem?.isAltered,
                                        isMisprint: item.orderItem?.originalItem?.isMisprint,
                                        isGraded: item.orderItem?.originalItem?.isGraded,
                                        gradingCompany: item.orderItem?.originalItem?.gradingCompany,
                                        grading: item.orderItem?.originalItem?.grading,
                                        comment: item.orderItem?.originalItem?.comment,
                                        inventoryInternalComment: item.orderItem?.originalItem?.internalComment,
                                        inventoryImagePath: item.orderItem?.originalItem?.imagePath,
                                    }}
                                    language={item.orderItem?.originalItem?.language || 'en'}
                                    showOverlay
                                />
                                <CardContent>
                                    <Typography variant='h6' gutterBottom>
                                        {item.orderItem?.originalItem?.quantity || 1}x {item.card?.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Tooltip title={t(`localeStrings.${item.orderItem?.originalItem?.language || 'en'}`)}>
                                            <Image
                                                height={20}
                                                width={30}
                                                alt={t(`localeStrings.${item.orderItem?.originalItem?.language || 'en'}`)}
                                                src={`${INTERNAL_ROUTES.STATIC.IMAGES.FLAGS}/${item.orderItem?.originalItem?.language || 'en'}.gif`}
                                            />
                                        </Tooltip>
                                        <Typography>{item.orderItem?.originalItem?.quality}</Typography>
                                        {item.orderItem?.originalItem?.isFoil && <Typography>★ Foil</Typography>}
                                    </Box>
                                    {renderActionButtons(item)}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>
            </Box>
        );
    }

    return (
        <DataGrid
            rows={items}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: { pageSize: 25 },
                },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{ backgroundColor: 'background.paper' }}
        />
    );
}
