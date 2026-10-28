'use client';

import BasicBreadcrumbs from '@/src/components/Breadcrumbs/Breadcrumbs';
import BuylistItemAddDialog from '@/src/components/Buylist/BuylistItemAddDialog';
import BuylistItemEditDialog from '@/src/components/Buylist/BuylistItemEditDialog';
import EditBuylistDialog from '@/src/components/Buylist/EditBuylistDialog';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useBuylistStore } from '@/src/store/buylist';
import { BuylistItem } from '@/src/store/types';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
    Box,
    Button,
    ButtonGroup,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BuylistDetailPage() {
    const t = useTranslations();
    const params = useParams();
    const router = useRouter();
    const buylistId = params ? Number(params.id) : 0;

    const { currentBuylist, isLoading, error, fetchBuylistById, deleteBuylist, deleteBuylistItem } = useBuylistStore();

    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAddItemDialog, setShowAddItemDialog] = useState(false);
    const [showEditItemDialog, setShowEditItemDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<BuylistItem | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (buylistId) {
            fetchBuylistById(buylistId);
        }

        return () => {
            // No need to clear since there's no clearCurrentBuylist function
        };
    }, [buylistId, fetchBuylistById]);

    const handleBackClick = () => {
        router.push(INTERNAL_ROUTES.BUYLIST.ROOT);
    };

    const confirmDelete = async () => {
        if (currentBuylist) {
            await deleteBuylist(currentBuylist.id);
            router.push(INTERNAL_ROUTES.BUYLIST.ROOT);
        }
        setShowDeleteDialog(false);
    };

    const handleEditItem = (item: BuylistItem) => {
        setSelectedItem(item);
        setShowEditItemDialog(true);
    };

    const handleDeleteItem = (item: BuylistItem) => {
        setSelectedItem(item);
        setShowDeleteItemDialog(true);
    };

    const confirmDeleteItem = async () => {
        if (selectedItem && currentBuylist) {
            await deleteBuylistItem(currentBuylist.id, selectedItem.id);
            fetchBuylistById(currentBuylist.id); // Refresh items after deletion
        }
        setShowDeleteItemDialog(false);
    };

    // The error check now ensures currentBuylist exists for the return statement
    if (isLoading && !currentBuylist) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
            </Box>
        );
    }

    if (error || !currentBuylist) {
        return (
            <Container maxWidth='lg' sx={{ mt: 4 }}>
                <Typography variant='h5' color='error' align='center'>
                    {error || t('buylist.notFound')}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button variant='contained' onClick={handleBackClick} startIcon={<ArrowBackIcon />}>
                        {t('buylist.back')}
                    </Button>
                </Box>
            </Container>
        );
    }

    // At this point TypeScript knows currentBuylist is not null

    return (
        <>
            <BasicBreadcrumbs previous={[{ text: t('buylist.title'), url: '/buylists' }]} current={currentBuylist?.name || ''} />

            {/* Buylist Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant='h4' component='h1' sx={{ textAlign: 'center', mb: 2 }}>
                    {currentBuylist.name}
                    <Chip
                        component={'span'}
                        icon={currentBuylist.isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        label={currentBuylist.isPublic ? t('buylist.public') : t('buylist.private')}
                        color={currentBuylist.isPublic ? 'success' : 'default'}
                        sx={{ ml: 2 }}
                    />
                </Typography>
                <Typography variant='body1' gutterBottom>
                    {currentBuylist.description || t('buylist.noDescription')}
                    <ButtonGroup component={'span'} variant='outlined' size='small' sx={{ float: 'right', mt: 1 }}>
                        <Tooltip title={t('buylist.edit')}>
                            <Button onClick={() => setShowEditDialog(true)}>
                                <EditIcon fontSize='small' />
                            </Button>
                        </Tooltip>
                        <Tooltip title={t('buylist.delete')}>
                            <Button color='error' onClick={() => setShowDeleteDialog(true)}>
                                <DeleteIcon fontSize='small' />
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                </Typography>
            </Box>

            {/* Buylist Items */}
            <Paper sx={{ p: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='h5'>{t('buylist.items')}</Typography>
                    <Button variant='contained' startIcon={<AddIcon />} onClick={() => setShowAddItemDialog(true)}>
                        {t('buylist.addItem')}
                    </Button>
                </Box>

                {!currentBuylist.items || !Array.isArray(currentBuylist.items) || currentBuylist.items.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant='body1'>{t('buylist.noItems')}</Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('buylist.name')}</TableCell>
                                    <TableCell align='center'>{t('buylist.price')}</TableCell>
                                    <TableCell align='center'>{t('buylist.quantity')}</TableCell>
                                    <TableCell align='center'>{t('buylist.maxBuys')}</TableCell>
                                    <TableCell align='center'>{t('buylist.bought')}</TableCell>
                                    <TableCell align='center'>{t('condition')}</TableCell>
                                    <TableCell align='right'>{t('buylist.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentBuylist.items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell align='center'>${item.price.toFixed(2)}</TableCell>
                                        <TableCell align='center'>{item.quantity}</TableCell>
                                        <TableCell align='center'>{(item as any).maxBuys === 0 ? '∞' : (item as any).maxBuys || '∞'}</TableCell>
                                        <TableCell align='center'>{(item as any).bought || 0}</TableCell>
                                        <TableCell align='center'>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                                                {item.isFoil === 1 && <Chip label={t('buylist.foil')} size='small' color='primary' sx={{ mr: 0.5 }} />}
                                                {item.isAltered === 1 && <Chip label={t('buylist.altered')} size='small' color='secondary' sx={{ mr: 0.5 }} />}
                                                {item.isSigned === 1 && <Chip label={t('buylist.signed')} size='small' color='info' sx={{ mr: 0.5 }} />}
                                                {item.isMisprint === 1 && <Chip label={t('buylist.misprint')} size='small' color='warning' sx={{ mr: 0.5 }} />}
                                                {item.isGraded === 1 && <Chip label={t('buylist.graded')} size='small' color='success' sx={{ mr: 0.5 }} />}
                                            </Box>
                                        </TableCell>
                                        <TableCell align='right'>
                                            <ButtonGroup size='small'>
                                                <Tooltip title={t('buylist.editItem')}>
                                                    <IconButton onClick={() => handleEditItem(item)}>
                                                        <EditIcon fontSize='small' />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('buylist.deleteItem')}>
                                                    <IconButton color='error' onClick={() => handleDeleteItem(item)}>
                                                        <DeleteIcon fontSize='small' />
                                                    </IconButton>
                                                </Tooltip>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        colSpan={7}
                                        count={currentBuylist.items.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={(event, newPage) => setPage(newPage)}
                                        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                                    />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Delete Buylist Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>{t('buylist.confirmDelete')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('buylist.deleteWarning')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>{t('buylist.cancel')}</Button>
                    <Button onClick={confirmDelete} color='error' variant='contained'>
                        {t('buylist.delete')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Item Dialog */}
            <Dialog open={showDeleteItemDialog} onClose={() => setShowDeleteItemDialog(false)}>
                <DialogTitle>{t('buylist.confirmDeleteItem')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('buylist.deleteItemWarning')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteItemDialog(false)}>{t('buylist.cancel')}</Button>
                    <Button onClick={confirmDeleteItem} color='error' variant='contained'>
                        {t('buylist.delete')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Buylist Dialog */}
            <EditBuylistDialog show={showEditDialog} setShow={setShowEditDialog} buylist={currentBuylist} />

            {/* Add Item Dialog */}
            <BuylistItemAddDialog show={showAddItemDialog} setShow={setShowAddItemDialog} buylistId={currentBuylist.id} />

            {/* Edit Item Dialog */}
            {selectedItem && selectedItem.name && (
                <BuylistItemEditDialog show={showEditItemDialog} setShow={setShowEditItemDialog} item={{ ...selectedItem, name: selectedItem.name }} buylistId={currentBuylist.id} />
            )}
        </>
    );
}
