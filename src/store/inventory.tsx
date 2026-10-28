import { create } from "zustand";
import { InventoryState } from "./types";
import { devtools } from "zustand/middleware";
import { getInventoryAction } from "../actions/inventory";

export const useInventoryStore = create<InventoryState>()(devtools((set, get) => ({
    loading: true,
    viewMode: 'list',
    fullInventory: [],
    privateInventory: [],
    forSaleInventory: [],
    fullInventoryCount: 0,
    privateInventoryCount: 0,
    forSaleInventoryCount: 0,
    page: 1,
    size: 60,
    privatePage: 1,
    privateSize: 60,
    forSalePage: 1,
    forSaleSize: 60,
    sortBy: 'name',
    sortOrder: 'asc',
    filters: { name: '', quality: [], language: [], set: [], rarity: [], minPrice: '', maxPrice: '', isFoil: '', isSigned: '', isAltered: '', isMisprint: '', isGraded: '', comment: '', internalComment: '', quantity: '' },
    setLoading: (loading: boolean) => set({ loading: loading }),
    setViewMode: (viewMode: string) => set({ viewMode: viewMode }),
    setFullInventory: (inventory: any[]) => set({ fullInventory: inventory }),
    setPrivateInventory: (inventory: any[]) => set({ privateInventory: inventory }),
    setForSaleInventory: (inventory: any[]) => set({ forSaleInventory: inventory }),
    setFullInventoryCount: (count: number) => set({ fullInventoryCount: count }),
    setPrivateInventoryCount: (count: number) => set({ privateInventoryCount: count }),
    setForSaleInventoryCount: (count: number) => set({ forSaleInventoryCount: count }),
    setPage: (page: number) => set({ page: page }),
    setPrivatePage: (page: number) => set({ privatePage: page }),
    setForSalePage: (page: number) => set({ forSalePage: page }),
    setSize: (size: number) => set({ size: size }),
    setPrivateSize: (size: number) => set({ privateSize: size }),
    setForSaleSize: (size: number) => set({ forSaleSize: size }),
    setSortBy: (sortBy: string) => set({ sortBy: sortBy }),
    setSortOrder: (sortOrder: string) => set({ sortOrder: sortOrder }),
    setFilter: (column: string, value: string | string[]) => set((state) => ({ filters: { ...state.filters, [column]: value } })),
    resetFilters: () => set({ filters: { name: '', quality: [], language: [], set: [], rarity: [], minPrice: '', maxPrice: '', isFoil: '', isSigned: '', isAltered: '', isMisprint: '', isGraded: '', comment: '', internalComment: '', quantity: '' } }),
    setSorting: (column: string) => {
        if (column === get().sortBy) {
            get().setSortOrder(get().sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            get().setSortOrder('asc');
            get().setSortBy(column);
        }
    },
    refreshFullInventory: () => {
        get().setLoading(true);
        getInventoryAction(get().page, get().size, get().sortBy, get().sortOrder, get().filters).then((data: any) => {
            set((state) => ({ fullInventory: data.inventory, fullInventoryCount: data.count, loading: false }));
        })
    },
    refreshPrivateInventory: () => {
        get().setLoading(true);
        getInventoryAction(get().privatePage, get().privateSize, get().sortBy, get().sortOrder, get().filters, 0).then((data: any) => {
            set((state) => ({ privateInventory: data.inventory, privateInventoryCount: data.count, loading: false }));
        })
    },
    refreshSaleInventory: () => {
        get().setLoading(true);
        getInventoryAction(get().forSalePage, get().forSaleSize, get().sortBy, get().sortOrder, get().filters, 1).then((data: any) => {
            set((state) => ({ forSaleInventory: data.inventory, forSaleInventoryCount: data.count, loading: false }));
        })
    },
    resetPages: () => set({ page: 1, privatePage: 1, forSalePage: 1 }),
})))