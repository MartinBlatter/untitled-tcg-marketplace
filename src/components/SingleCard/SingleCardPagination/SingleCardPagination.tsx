import { ButtonGroup, FormControl, Select, MenuItem, Button, Box, Pagination } from "@mui/material";
import { useTranslations } from "next-intl";
import ListIcon from '@mui/icons-material/List';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { SingleCardPaginationProps } from "./types";

const SingleCardPagination = ({ page, size, count, position, setViewMode, handleChangePage, handleChangeRowsPerPage }: SingleCardPaginationProps) => {
    const t = useTranslations();
    const paginationClass = position === 'top' ? 'top-pagination' : 'bottom-pagination';
    const actualCount = typeof count === 'number' ? count : count[0].count;

    return (
        <Box sx={{ position: 'relative' }}>
            <Pagination
                className={paginationClass}
                count={Math.ceil(actualCount / size)}
                page={page}
                onChange={handleChangePage}
                showFirstButton
                showLastButton
            />
            <ButtonGroup className="view-mode-buttons" variant="outlined" aria-label="Basic button group" sx={{ position: 'absolute', right: 0, top: -4 }}>
                <FormControl>
                    <Select
                        id="top-size-select"
                        value={size as unknown as string}
                        size="small"
                        onChange={handleChangeRowsPerPage}
                    >
                        <MenuItem value={60}>{t('pagination.sixty')}</MenuItem>
                        <MenuItem value={120}>{t('pagination.onehundredtwenty')}</MenuItem>
                        <MenuItem value={240}>{t('pagination.twohundredfourty')}</MenuItem>
                    </Select>
                </FormControl>
                <Button onClick={() => { setViewMode('list') }}><ListIcon /></Button>
                <Button onClick={() => { setViewMode('tiles') }}><ViewModuleIcon /></Button>
            </ButtonGroup>
        </Box>
    );
};

export default SingleCardPagination;
