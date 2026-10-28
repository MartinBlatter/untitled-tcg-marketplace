import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { ENDPOINTS } from '../constants/endpoints';
import { WishlistResponseItem, WishlistsState } from './types';

export const useWishlistsStore = create<WishlistsState>()(
    devtools((set, get) => ({
        loading: true,
        currentWishlist: null,
        currentWishlistId: null,
        publicWishlist: null,
        wishlists: [],
        previewItems: [],
        importErrors: [],
        setCurrentWishlist: () =>
            set((state) => ({
                currentWishlist: state.wishlists.find((wishlist: WishlistResponseItem) => (wishlist['mtg.wishlist'] ? wishlist['mtg.wishlist'].id == state.currentWishlistId : false)),
            })),
        setCurrentWishlistId: (id) => set((state) => ({ currentWishlistId: id })),
        setWishlists: (wishlists) => set((state) => ({ wishlists: wishlists })),
        remove: (id) =>
            set((state) => ({
                wishlists: state.wishlists.filter((wishlist: WishlistResponseItem) => (wishlist['mtg.wishlist'] ? wishlist['mtg.wishlist'].id !== id : false)),
            })),
        setLoading: (loading) => set((state) => ({ loading: loading })),

        refresh() {
            set((state) => ({ loading: true }));
            apiRequest(ENDPOINTS.API.WISHLISTS.GET_ALL).then((data: any) => {
                set((state) => ({
                    wishlists: data.wishlists,
                    loading: false,
                    currentWishlist: data.wishlists.find((wishlist: WishlistResponseItem) => (wishlist['mtg.wishlist'] ? wishlist['mtg.wishlist'].id == state.currentWishlistId : false)),
                }));
            });
        },
        add: (name, description) => {
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.WISHLISTS.ADD, 'POST', { name: name, description: description }).then((data: any) => {
                    resolve(data);
                });
            });
        },
        addItem: (item) => {
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.WISHLISTS.ADD_ITEM, 'POST', { item }).then((data: any) => {
                    resolve(data);
                });
            });
        },
        deleteItem: (id) => {
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.WISHLISTS.DELETE_ITEM, 'DELETE', { id: id }).then((data: any) => {
                    resolve(data);
                });
            });
        },
        editItem: (item) => {
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.WISHLISTS.ADD_ITEM, 'POST', { item }).then((data: any) => {
                    resolve(data);
                });
            });
        },
        addItemsList: (wishlistId, items) => {
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.WISHLISTS.ADD_ITEMLIST, 'POST', { id: wishlistId, list: items }).then((data: any) => {
                    resolve(data);
                });
            });
        },
        MassEditItems: (id, selectedIds, values) => {
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.WISHLISTS.MASS_EDIT_ITEM, 'POST', { id: id, selectedIds: selectedIds, values: values }).then((data: any) => {
                    resolve(data);
                });
            });
        },
        sortItems: (column, order) => {
            if (get().currentWishlist === null || get().currentWishlist?.items === undefined) return;
            set((state): any => ({
                currentWishlist: {
                    ...state.currentWishlist,
                    items:
                        state.currentWishlist && state.currentWishlist.items
                            ? state.currentWishlist.items.sort((a: any, b: any) => {
                                  if (order === 'asc') {
                                      return a[column] > b[column] ? 1 : -1;
                                  } else {
                                      return a[column] < b[column] ? 1 : -1;
                                  }
                              })
                            : null,
                },
            }));
        },
        refreshPublicWishlist: (hash) => {
            set((state) => ({ loading: true }));
            apiRequest(`${ENDPOINTS.API.WISHLISTS.GET_PUBLIC}/${hash}`).then((data: any) => {
                set((state) => ({ loading: false, publicWishlist: data }));
            });
        },
        sortPublicItems: (column, order) => {
            if (get().publicWishlist === null || get().publicWishlist?.items === undefined) return;
            set((state): any => ({
                publicWishlist: {
                    ...state.publicWishlist,
                    items:
                        state.publicWishlist && state.publicWishlist.items
                            ? state.publicWishlist.items.sort((a: any, b: any) => {
                                  if (order === 'asc') {
                                      return a[column] > b[column] ? 1 : -1;
                                  } else {
                                      return a[column] < b[column] ? 1 : -1;
                                  }
                              })
                            : null,
                },
            }));
        },
        setPreviewItems: (items) => {
            set((state) => ({ previewItems: items }));
        },
        setImportErrors: (errors) => {
            set((state) => ({ importErrors: errors }));
        },
    }))
);
