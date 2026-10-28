import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { ENDPOINTS } from '../constants/endpoints';
import { ShoppingCartItem, ShoppingCartState } from './types';

export const useShoppingCartStore = create<ShoppingCartState>()(
    devtools((set, get) => ({
        loading: false,
        adding: false,
        removing: false,
        items: [],
        funds: 0,
        addShoppingCartItem: (item: ShoppingCartItem) => {
            set((state) => ({ adding: true }));
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.SHOPPINGCART.ADD_ITEM, 'POST', item)
                    .then((data: any) => {
                        set((state) => ({ adding: false }));
                        item.id = data.id;
                        if (data.success) {
                            get().refreshShoppingCartItems();
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                    .catch((error) => {
                        set((state) => ({ adding: false }));
                        reject(error);
                    });
            });
        },
        removeShoppingCartItem: (id: number) => {
            set((state) => ({ removing: true }));
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.SHOPPINGCART.DELETE_ITEM, 'DELETE', { id: id })
                    .then((data: any) => {
                        set((state) => ({ removing: false }));
                        if (data.success) {
                            get().refreshShoppingCartItems();
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                    .catch((error) => {
                        set((state) => ({ removing: false }));
                        reject(error);
                    });
            });
        },
        getShoppingCartPrice: () => {
            const items = get().items;
            if (!Array.isArray(items)) return 0;
            return items.reduce((acc, sellerItems) => acc + sellerItems.reduce((sellerAcc, item) => sellerAcc + (item.price as unknown as number) * item.quantity, 0), 0);
        },
        refreshShoppingCartItems: () => {
            set((state) => ({ loading: true }));
            apiRequest(ENDPOINTS.API.SHOPPINGCART.GET_ITEMS)
                .then((data: any) => {
                    // An error response carries no `items`, and assigning it blindly
                    // put `undefined` into the store, so the next render of the
                    // TopBar cart threw on `items.reduce`. Keep the last good list.
                    if (Array.isArray(data?.items)) {
                        set((state) => ({ items: data.items }));
                    } else {
                        console.error('[cart] shopping cart request returned no items', data);
                    }
                    set((state) => ({ loading: false }));
                })
                .catch((error) => {
                    set((state) => ({ loading: false }));
                    console.log(error);
                });
        },
        refreshFunds: () => {
            apiRequest(ENDPOINTS.API.FUNDS)
                .then((data: any) => {
                    set((state) => ({ funds: data.funds }));
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    }))
);
