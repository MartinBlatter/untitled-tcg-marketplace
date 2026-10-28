import ListIcon from '@mui/icons-material/List';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Box, Button, ButtonGroup, FormControl, MenuItem, Pagination, Select, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { InventoryPaginationProps } from './types';

const InventoryPagination = ({ page, size, count, position, setViewMode, handleChangePage, handleChangeRowsPerPage }: InventoryPaginationProps) => {
    const t = useTranslations();
    const paginationClass = position === 'top' ? 'top-pagination' : 'bottom-pagination';

    return (
        <Box sx={{ position: 'relative' }}>
            {position === 'top' && (
                <Typography variant='body2'>
                    {count} {t('items')}
                </Typography>
            )}
            <Pagination className={paginationClass} count={Math.ceil(count / size)} page={page} onChange={handleChangePage} showFirstButton showLastButton />
            <ButtonGroup className='view-mode-buttons' variant='outlined' aria-label='Basic button group' sx={{ position: 'absolute', right: 0, top: -4 }}>
                <FormControl>
                    <Select id='top-size-select' value={size as unknown as string} size='small' onChange={handleChangeRowsPerPage}>
                        <MenuItem value={60}>{t('pagination.sixty')}</MenuItem>
                        <MenuItem value={120}>{t('pagination.onehundredtwenty')}</MenuItem>
                        <MenuItem value={240}>{t('pagination.twohundredfourty')}</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    onClick={() => {
                        setViewMode('list');
                    }}
                >
                    <ListIcon />
                </Button>
                <Button
                    onClick={() => {
                        setViewMode('tiles');
                    }}
                >
                    <ViewModuleIcon />
                </Button>
            </ButtonGroup>
        </Box>
    );
};

export default InventoryPagination;
