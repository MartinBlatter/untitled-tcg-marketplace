import { BuylistItem } from "@/src/store/types";

export type BuyableCardFiltersProps = {
    filters: any;
    setFilter: (column: string, value: string | string[]) => void;
    items?: BuylistItem[];
    resetFilters: () => void;
    hasFilters: boolean;
};