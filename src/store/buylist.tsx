import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { ENDPOINTS } from '../constants/endpoints';
import { Buylist, BuylistItem, BuylistItemCreate, BuylistStoreState, BuylistUpdateParams } from './types';

// Implement the buylist store using Zustand
export const useBuylistStore = create<BuylistStoreState>()(
    devtools((set, get) => ({
        buylists: [],
        currentBuylist: null,
        isLoading: false,
        error: null,

        fetchBuylists: () => {
            set({ isLoading: true, error: null });
            apiRequest(ENDPOINTS.API.BUYLISTS.GET_ALL).then((data: any) => {
                set({
                    buylists: data.buylists || [],
                    isLoading: false,
                    error: data.error || null,
                });
            });
        },

        fetchBuylistById: (id: number) => {
            set({ isLoading: true, error: null });
            apiRequest(ENDPOINTS.API.BUYLISTS.GET_BY_ID(id)).then((data: any) => {
                set({
                    currentBuylist: data.buylist || null,
                    isLoading: false,
                    error: data.error || null,
                });
            });
        },

        createBuylist: (name: string, description: string, isPublic: boolean) => {
            set({ isLoading: true, error: null });
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.BUYLISTS.CREATE, 'POST', {
                    name,
                    description: description || null,
                    isPublic,
                }).then((data: any) => {
                    if (data.error) {
                        set({ error: data.error, isLoading: false });
                        reject(data.error);
                    } else {
                        set((state: BuylistStoreState) => ({
                            buylists: [...state.buylists, data.buylist],
                            isLoading: false,
                            currentBuylist: state.currentBuylist,
                            error: state.error,
                        }));
                        resolve(data);
                    }
                });
            });
        },

        updateBuylist: (id: number, params: BuylistUpdateParams) => {
            set({ isLoading: true, error: null });
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.BUYLISTS.UPDATE(id), 'PUT', params).then((data: any) => {
                    if (data.error) {
                        set({ error: data.error, isLoading: false });
                        reject(data.error);
                    } else {
                        set((state: any) => ({
                            buylists: state.buylists.map((buylist: Buylist) => (buylist.id === id ? { ...buylist, ...params } : buylist)),
                            currentBuylist: state.currentBuylist?.id === id ? { ...state.currentBuylist, ...params } : state.currentBuylist,
                            isLoading: false,
                            error: state.error,
                        }));
                        resolve(data);
                    }
                });
            });
        },

        deleteBuylist: (id: number) => {
            set({ isLoading: true, error: null });
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.BUYLISTS.DELETE(id), 'DELETE').then((data: any) => {
                    if (data.error) {
                        set({ error: data.error, isLoading: false });
                        reject(data.error);
                    } else {
                        set((state: BuylistStoreState) => ({
                            buylists: state.buylists.filter((buylist) => buylist.id !== id),
                            currentBuylist: state.currentBuylist?.id === id ? null : state.currentBuylist,
                            isLoading: false,
                            error: state.error,
                        }));
                        resolve(data);
                    }
                });
            });
        },

        addBuylistItem: (buylistId: number, item: BuylistItemCreate) => {
            set({ isLoading: true, error: null });
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.BUYLISTS.ADD_ITEM(buylistId), 'POST', item).then((data: any) => {
                    if (data.error) {
                        set({ error: data.error, isLoading: false });
                        reject(data.error);
                    } else {
                        // Update the current buylist if we're viewing it
                        if (get().currentBuylist?.id === buylistId) {
                            set((state: BuylistStoreState) => ({
                                currentBuylist: state.currentBuylist
                                    ? {
                                          ...state.currentBuylist,
                                          items: [...(state.currentBuylist.items || []), data.item],
                                      }
                                    : state.currentBuylist,
                                isLoading: false,
                                error: state.error,
                                buylists: state.buylists,
                            }));
                        } else {
                            set({ isLoading: false });
                        }
                        resolve(data);
                    }
                });
            });
        },

        deleteBuylistItem: (buylistId: number, itemId: number) => {
            set({ isLoading: true, error: null });
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.BUYLISTS.DELETE_ITEM(buylistId, itemId), 'DELETE').then((data: any) => {
                    if (data.error) {
                        set({ error: data.error, isLoading: false });
                        reject(data.error);
                    } else {
                        // Update the current buylist if we're viewing it
                        if (get().currentBuylist?.id === buylistId) {
                            set((state: BuylistStoreState) => ({
                                currentBuylist: state.currentBuylist
                                    ? {
                                          ...state.currentBuylist,
                                          items: (state.currentBuylist.items || []).filter((item: BuylistItem) => item.id !== itemId),
                                      }
                                    : state.currentBuylist,
                                isLoading: false,
                                error: state.error,
                                buylists: state.buylists,
                            }));
                        } else {
                            set({ isLoading: false });
                        }
                        resolve(data);
                    }
                });
            });
        },

        updateBuylistItem: (buylistId: number, itemId: number, item: Partial<BuylistItemCreate>) => {
            set({ isLoading: true, error: null });
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.BUYLISTS.UPDATE_ITEM(buylistId, itemId), 'PUT', item).then((data: any) => {
                    if (data.error) {
                        set({ error: data.error, isLoading: false });
                        reject(data.error);
                    } else {
                        // Update the current buylist if we're viewing it
                        if (get().currentBuylist?.id === buylistId) {
                            set((state: BuylistStoreState) => ({
                                currentBuylist: state.currentBuylist
                                    ? {
                                          ...state.currentBuylist,
                                          items: (state.currentBuylist.items || []).map((i: BuylistItem) => (i.id === itemId ? { ...i, ...item } : i)),
                                      }
                                    : state.currentBuylist,
                                isLoading: false,
                                error: state.error,
                                buylists: state.buylists,
                            }));
                        } else {
                            set({ isLoading: false });
                        }
                        resolve(data);
                    }
                });
            });
        },
    }))
);
