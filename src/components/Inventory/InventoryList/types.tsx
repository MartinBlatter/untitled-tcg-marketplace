export interface InventoryListProps {
    inventory: any[];
    loading: boolean;
    triggerRefresh: () => void;
    setSortBy: (sortBy: string) => void;
    sortBy: string;
    sortOrder: string;
    isPublic?: boolean;
    removeItem?: (id: number) => void;
}
