import { BrokenImage, Brush, Delete, Edit, Gesture, GMobiledata, Star } from '@mui/icons-material';
import {
    ButtonGroup,
    Card,
    CardActionArea,
    CardContent,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import ConfirmationDialog from '../../ConfirmationDialog/ConfirmationDialog';
import SingleCardImage from '../../SingleCard/SingleCardImage/SingleCardImage';
import { WishlistItemsTilesProps } from './types';

export default function WishlistItemsTiles({ handleSelectAllToggle, setSort, wishlist, sortOrder, sortBy, selectedItems, handleCheckboxChange, handleDelete, handleEdit }: WishlistItemsTilesProps) {
    const t = useTranslations();
    const theme = useTheme();

    return (
        <>
            {handleSelectAllToggle ? <FormControlLabel sx={{ mt: 2 }} control={<Switch onChange={(event) => handleSelectAllToggle(event.target.checked)} />} label={t('selectAll')} /> : null}
            <FormControl size='small' sx={{ minWidth: 200, mt: 2 }}>
                <InputLabel id='select-sort-by-label'>{t('table.sortBy')}</InputLabel>
                <Select labelId='select-sort-by-label' id='select-sort-by' value={sortBy} label={t('table.sortBy')} onChange={(e) => setSort(e.target.value)}>
                    <MenuItem value='name'>{t('inventory.inventoryColumns.name')}</MenuItem>
                    <MenuItem value='setCode'>{t('inventory.inventoryColumns.set')}</MenuItem>
                    <MenuItem value='language'>{t('inventory.inventoryColumns.language')}</MenuItem>
                    <MenuItem value='quality'>{t('wishlists.singleCardDialog.quality')}</MenuItem>
                    <MenuItem value='description'>{t('wishlists.addDialog.description')}</MenuItem>
                    <MenuItem value='isFoil'>
                        {t('inventory.inventoryColumns.foil')} <Star />
                    </MenuItem>
                    <MenuItem value='isSigned'>
                        {t('inventory.inventoryColumns.signed')} <Gesture />
                    </MenuItem>
                    <MenuItem value='isAltered'>
                        {t('inventory.inventoryColumns.altered')} <Brush />
                    </MenuItem>
                    <MenuItem value='isMisprint'>
                        {t('inventory.inventoryColumns.misprint')} <BrokenImage />
                    </MenuItem>
                    <MenuItem value='isGraded'>
                        {t('inventory.inventoryColumns.graded')} <GMobiledata />
                    </MenuItem>
                    <MenuItem value='price'>{t('inventory.inventoryColumns.price')}</MenuItem>
                    <MenuItem value='quantity'>{t('inventory.inventoryColumns.quantity')}</MenuItem>
                </Select>
            </FormControl>
            <FormControl size='small' sx={{ minWidth: 200, mt: 2, ml: 2 }}>
                <InputLabel id='select-sort-order-label'>{t('table.sortOrder')}</InputLabel>
                <Select labelId='select-sort-order-label' id='select-sort-order' value={sortOrder} label={t('table.sortOrder')} onChange={(e) => setSort(sortBy)}>
                    <MenuItem value='asc'>{t('table.ascending')}</MenuItem>
                    <MenuItem value='desc'>{t('table.descending')}</MenuItem>
                </Select>
            </FormControl>
            <Grid container spacing={4} sx={{ mt: 2, justifyContent: 'left' }}>
                {wishlist.items.length === 0 && (
                    <Paper sx={{ height: '50px', p: 2, width: '100%' }}>
                        <Typography variant='body1'>{t('wishlists.single.noItems')}</Typography>
                    </Paper>
                )}
                {wishlist.items.map((item: any, index: number) => (
                    <Card
                        sx={
                            selectedItems && selectedItems.includes(item.id)
                                ? {
                                      width: '264px',
                                      boxShadow: `0px 0px 3px 5px ${theme.palette.primary.main}`,
                                  }
                                : { width: '264px' }
                        }
                        key={`card-item-${index}`}
                        onClick={() => (handleCheckboxChange && selectedItems ? handleCheckboxChange(item.id, selectedItems.includes(item.id) ? false : true) : null)}
                    >
                        <CardActionArea sx={{ height: '100%' }} component='div'>
                            <SingleCardImage card={item} showOverlay />
                            <CardContent>
                                <Typography variant='h6'>
                                    {item.quantity} x {item.name}
                                </Typography>
                                <Typography variant='body1'>
                                    {t('wishlists.single.maxPrice')} {item.price !== 0 ? `${item.price} €` : '-'}
                                </Typography>
                                {handleDelete && handleEdit ? (
                                    <ButtonGroup variant='outlined' aria-label='Basic outlined button group' fullWidth sx={{ mt: 2 }}>
                                        <ConfirmationDialog title={t('inventory.icons.delete')} description={t('confirmation.delete')} response={() => handleDelete(item.id)}>
                                            {(showDialog) => (
                                                <Tooltip title={t('inventory.icons.delete')}>
                                                    <IconButton size='medium' onClick={showDialog} sx={{ width: '50%' }}>
                                                        <Delete fontSize='medium' />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </ConfirmationDialog>
                                        <Tooltip title={t('inventory.icons.edit')}>
                                            <IconButton
                                                size='medium'
                                                type='submit'
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleEdit(item.id);
                                                }}
                                                sx={{ width: '50%' }}
                                            >
                                                <Edit fontSize='medium' />
                                            </IconButton>
                                        </Tooltip>
                                    </ButtonGroup>
                                ) : null}
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Grid>
        </>
    );
}
