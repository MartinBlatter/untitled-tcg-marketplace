export interface WishlistItemsTilesProps {
    handleSelectAllToggle?: (checked: boolean) => void;
    setSort: (column: string) => void;
    wishlist: any;
    sortOrder: string;
    sortBy: string;
    selectedItems?: number[];
    handleCheckboxChange?: (id: number, checked: boolean) => void;
    handleDelete?: (id: number) => void;
    handleEdit?: (id: number) => void;
}
