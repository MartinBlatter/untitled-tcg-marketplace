import { SelectChangeEvent } from "@mui/material";
import { ChangeEvent } from "react";

export interface SingleCardPaginationProps {
    size: number;
    page: number;
    count: any;
    position: string;
    setViewMode: (viewMode: string) => void;
    handleChangePage: (event: ChangeEvent<unknown>, newPage: number) => void;
    handleChangeRowsPerPage: (event: SelectChangeEvent) => void;
}