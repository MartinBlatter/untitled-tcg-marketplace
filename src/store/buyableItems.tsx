import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { ENDPOINTS } from '../constants/endpoints';
import { BuyableItemsState } from './types';

// Original buyableItems store
export const useBuyableItemsStore = create<BuyableItemsState>()(
    devtools((set, get) => ({
        loading: false,
        hasFilters: false,
        filters: { country: '', quality: '', language: [], price: '', isFoil: '', isAltered: '', isSigned: '', isMisprint: '', isGraded: '' },
        items: [],
        filteredItems: [],
        refresh: (uuid: string) => {
            set((state) => ({ loading: true }));
            apiRequest(`${ENDPOINTS.API.PURCHASEABLE_ITEMS.BY_UUID(uuid)}`).then((data: any) => {
                set((state) => ({ items: data.items, loading: false }));
                get().filterItems();
            });
        },
        setFilter: (column: string, value: string | string[]) => {
            set((state) => ({ filters: { ...state.filters, [column]: value } }));
            get().filterItems();
        },
        filterItems: () => {
            let filtersExist = 0;
            const qualities: any = { MI: 7, NM: 6, EX: 5, GD: 4, LP: 3, PL: 2, PO: 1 };
            const { items, filters } = get();
            let filteredItems = items;

            if (filters['country'] !== '') {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => item.country === filters['country']);
            }

            if (filters['quality'] !== '') {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => qualities[item.quality] >= qualities[filters['quality']]);
            }

            if (filters['language'].length > 0) {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => filters['language'].includes(item.language));
            }

            if (filters['price'] !== '') {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => item.price <= filters['price']);
            }

            if (filters['isFoil'] !== '') {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => item.isFoil == filters['isFoil']);
            }

            if (filters['isAltered'] !== '') {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => item.isAltered == filters['isAltered']);
            }

            if (filters['isSigned'] !== '') {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => item.isSigned == filters['isSigned']);
            }

            if (filters['isMisprint'] !== '') {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => item.isMisprint == filters['isMisprint']);
            }

            if (filters['isGraded'] !== '') {
                filtersExist++;
                filteredItems = filteredItems.filter((item: any) => item.isGraded == filters['isGraded']);
            }

            set((state) => ({ filteredItems: filteredItems, hasFilters: filtersExist > 0 ? true : false }));
        },
        resetFilters: () => {
            set((state) => ({ filters: { country: '', quality: '', language: [], price: '', isFoil: '', isAltered: '', isSigned: '', isMisprint: '', isGraded: '' } }));
            get().filterItems();
        },
        removeItem: (id: number, amount: number) => {
            const newItem = get().items.filter((item: any) => item.id === id);
            if (newItem.length === 0) return;

            newItem[0].quantity -= amount;
            if (newItem[0].quantity <= 0) {
                set((state) => ({ items: state.items.filter((item: any) => item.id !== id), filteredItems: state.filteredItems.filter((item: any) => item.id !== id) }));
            } else {
                set((state) => ({
                    items: state.items.map((item: any) => (item.id === id ? newItem[0] : item)),
                    filteredItems: state.filteredItems.map((item: any) => (item.id === id ? newItem[0] : item)),
                }));
            }
        },
    }))
);
