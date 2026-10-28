export type PurchaseNavBarProps = {
    selectedIndex: number;
};

export type PurchaseAccordionProps = {
    purchase: any;
    expanded: boolean;
    handleChange: (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
    refresh: () => void;
    showPayButton?: boolean;
};

export type PurchasesSummaryProps = { title: string; sum: number; count: number; showPayButton?: boolean; refresh?: () => void };

export interface PurchaseFiltersType {
    sellerName: string;
    minPrice: string;
    maxPrice: string;
    createdAtStart: string;
    createdAtEnd: string;
    itemName: string;
    orderId: string;
}

export interface PurchaseFiltersProps {
    filters: PurchaseFiltersType;
    setFilters: (filters: PurchaseFiltersType) => void;
    resetFilters: () => void;
    loading?: boolean;
    autoExpand?: boolean;
}
