import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { PICKING_LIST_ITEM_STATUS } from '@/src/constants/status';
import { PickingListItem } from '@/src/store/types';
import { Box, Card, CardActionArea, CardContent, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import SingleCardImage from '../../SingleCard/SingleCardImage/SingleCardImage';

interface ProblemItemsGridProps {
    items: PickingListItem[];
    problemColumns: GridColDef<PickingListItem>[];
    viewMode?: 'list' | 'grid';
}

export default function ProblemItemsGrid({ items, problemColumns, viewMode = 'list' }: ProblemItemsGridProps) {
    const t = useTranslations();

    const problemItems = items.filter((item) => item.status === PICKING_LIST_ITEM_STATUS.PROBLEM);

    if (!problemItems.length) return null;

    return (
        <>
            <Typography variant='h4' component='h2' sx={{ textAlign: 'center', mt: 5, mb: 3 }}>
                {t('pickinglists.problemItems')}
            </Typography>

            {viewMode === 'grid' ? (
                <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 2, pb: 2, minWidth: 'min-content' }}>
                        {problemItems.map((item) => (
                            <Card key={item.id} sx={{ width: 264, flexShrink: 0, borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
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
                                        {item.problem && (
                                            <Typography
                                                sx={{
                                                    color: 'error.main',
                                                    mt: 1
                                                }}>
                                                {t('pickinglists.problem')}: {item.problem}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        ))}
                    </Box>
                </Box>
            ) : (
                <DataGrid
                    rows={problemItems}
                    columns={problemColumns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 25 },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    sx={{ backgroundColor: 'background.paper', borderColor: 'error.main' }}
                />
            )}
        </>
    );
}
