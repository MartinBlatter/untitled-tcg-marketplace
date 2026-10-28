import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { ENDPOINTS } from '../constants/endpoints';
import { SalesState } from './types';

export const useSalesStore = create<SalesState>()(
    devtools((set, get) => ({
        loading: true,
        inCartSales: [],
        inCartPage: 1,
        inCartCount: 0,
        inCartLoading: true,
        inCartSum: 0,
        unpaidSales: [],
        unpaidPage: 1,
        unpaidCount: 0,
        unpaidLoading: true,
        unpaidSum: 0,
        paidSales: [],
        paidPage: 1,
        paidCount: 0,
        paidLoading: true,
        paidSum: 0,
        packedSales: [],
        packedPage: 1,
        packedCount: 0,
        packedLoading: true,
        packedSum: 0,
        shippedSales: [],
        shippedPage: 1,
        shippedCount: 0,
        shippedLoading: true,
        shippedSum: 0,
        deliveredSales: [],
        deliveredPage: 1,
        deliveredCount: 0,
        deliveredLoading: true,
        deliveredSum: 0,
        deliveredFilters: {
            buyerName: '',
            minPrice: '',
            maxPrice: '',
            createdAtStart: '',
            createdAtEnd: '',
            itemName: '',
            orderId: '',
        },
        cancelledSales: [],
        cancelledPage: 1,
        cancelledCount: 0,
        cancelledLoading: true,
        cancelledSum: 0,
        cancelledFilters: {
            buyerName: '',
            minPrice: '',
            maxPrice: '',
            createdAtStart: '',
            createdAtEnd: '',
            itemName: '',
            orderId: '',
        },
        notArrivedSales: [],
        notArrivedPage: 1,
        notArrivedCount: 0,
        notArrivedLoading: true,
        notArrivedSum: 0,
        notArrivedFilters: {
            buyerName: '',
            minPrice: '',
            maxPrice: '',
            createdAtStart: '',
            createdAtEnd: '',
            itemName: '',
            orderId: '',
        },
        setLoading: (loading: boolean) => set((state) => ({ loading: loading })),
        refreshInCartSales: async () => {
            set((state) => ({ inCartLoading: true }));
            apiRequest(`${ENDPOINTS.API.SALES.IN_CART}?page=${get().inCartPage}`).then((data: any) => {
                set((state) => ({ loading: false, inCartLoading: false, inCartSales: data.carts, inCartCount: data.count, inCartSum: data.sum }));
            });
        },
        setInCartPage: (page: number) => {
            set((state) => ({ inCartPage: page }));
            get().refreshInCartSales();
        },
        refreshUnpaidSales: async () => {
            set((state) => ({ unpaidLoading: true }));
            apiRequest(`${ENDPOINTS.API.SALES.UNPAID}?page=${get().unpaidPage}`).then((data: any) => {
                set((state) => ({ loading: false, unpaidLoading: false, unpaidSales: data.orders, unpaidCount: data.count, unpaidSum: data.sum }));
            });
        },
        setUnpaidPage: (page: number) => {
            set((state) => ({ unpaidPage: page }));
            get().refreshUnpaidSales();
        },
        refreshPaidSales: async () => {
            set((state) => ({ paidLoading: true }));
            apiRequest(`${ENDPOINTS.API.SALES.PAID}?page=${get().paidPage}`).then((data: any) => {
                set((state) => ({ loading: false, paidLoading: false, paidSales: data.orders, paidCount: data.count, paidSum: data.sum }));
            });
        },
        setPaidPage: (page: number) => {
            set((state) => ({ paidPage: page }));
            get().refreshPaidSales();
        },
        refreshPackedSales: async () => {
            set((state) => ({ packedLoading: true }));
            apiRequest(`${ENDPOINTS.API.SALES.PACKED}?page=${get().packedPage}`).then((data: any) => {
                set((state) => ({ loading: false, packedLoading: false, packedSales: data.orders, packedCount: data.count, packedSum: data.sum }));
            });
        },
        setPackedPage: (page: number) => {
            set((state) => ({ packedPage: page }));
            get().refreshPackedSales();
        },
        refreshShippedSales: async () => {
            set((state) => ({ shippedLoading: true }));
            apiRequest(`${ENDPOINTS.API.SALES.SHIPPED}?page=${get().shippedPage}`).then((data: any) => {
                set((state) => ({ loading: false, shippedLoading: false, shippedSales: data.orders, shippedCount: data.count, shippedSum: data.sum }));
            });
        },
        setShippedPage: (page: number) => {
            set((state) => ({ shippedPage: page }));
            get().refreshShippedSales();
        },
        refreshDeliveredSales: async () => {
            set((state) => ({ deliveredLoading: true }));
            const queryParams = new URLSearchParams({
                page: get().deliveredPage.toString(),
                ...get().deliveredFilters,
            });
            apiRequest(`${ENDPOINTS.API.SALES.DELIVERED}?${queryParams}`).then((data: any) => {
                set((state) => ({ loading: false, deliveredLoading: false, deliveredSales: data.orders, deliveredCount: data.count, deliveredSum: data.sum }));
            });
        },
        setDeliveredPage: (page: number) => {
            set((state) => ({ deliveredPage: page }));
            get().refreshDeliveredSales();
        },
        setDeliveredFilters: (filters) => {
            set((state) => ({
                deliveredFilters: { ...state.deliveredFilters, ...filters },
                deliveredPage: 1,
            }));
            get().refreshDeliveredSales();
        },
        resetDeliveredFilters: () => {
            set((state) => ({
                deliveredFilters: {
                    buyerName: '',
                    minPrice: '',
                    maxPrice: '',
                    createdAtStart: '',
                    createdAtEnd: '',
                    itemName: '',
                    orderId: '',
                },
                deliveredPage: 1,
            }));
            get().refreshDeliveredSales();
        },
        refreshCancelledSales: async () => {
            set((state) => ({ cancelledLoading: true }));
            const queryParams = new URLSearchParams({
                page: get().cancelledPage.toString(),
                ...get().cancelledFilters,
            });
            apiRequest(`${ENDPOINTS.API.SALES.CANCELLED}?${queryParams}`).then((data: any) => {
                set((state) => ({ loading: false, cancelledLoading: false, cancelledSales: data.orders, cancelledCount: data.count, cancelledSum: data.sum }));
            });
        },
        setCancelledPage: (page: number) => {
            set((state) => ({ cancelledPage: page }));
            get().refreshCancelledSales();
        },
        setCancelledFilters: (filters) => {
            set((state) => ({
                cancelledFilters: { ...state.cancelledFilters, ...filters },
                cancelledPage: 1,
            }));
            get().refreshCancelledSales();
        },
        resetCancelledFilters: () => {
            set((state) => ({
                cancelledFilters: {
                    buyerName: '',
                    minPrice: '',
                    maxPrice: '',
                    createdAtStart: '',
                    createdAtEnd: '',
                    itemName: '',
                    orderId: '',
                },
                cancelledPage: 1,
            }));
            get().refreshCancelledSales();
        },
        refreshNotArrivedSales: async () => {
            set((state) => ({ notArrivedLoading: true }));
            const queryParams = new URLSearchParams({
                page: get().notArrivedPage.toString(),
                ...get().notArrivedFilters,
            });
            apiRequest(`${ENDPOINTS.API.SALES.NOT_ARRIVED}?${queryParams}`).then((data: any) => {
                set((state) => ({ loading: false, notArrivedLoading: false, notArrivedSales: data.orders, notArrivedCount: data.count, notArrivedSum: data.sum }));
            });
        },
        setNotArrivedPage: (page: number) => {
            set((state) => ({ notArrivedPage: page }));
            get().refreshNotArrivedSales();
        },
        setNotArrivedFilters: (filters) => {
            set((state) => ({
                notArrivedFilters: { ...state.notArrivedFilters, ...filters },
                notArrivedPage: 1,
            }));
            get().refreshNotArrivedSales();
        },
        resetNotArrivedFilters: () => {
            set((state) => ({
                notArrivedFilters: {
                    buyerName: '',
                    minPrice: '',
                    maxPrice: '',
                    createdAtStart: '',
                    createdAtEnd: '',
                    itemName: '',
                    orderId: '',
                },
                notArrivedPage: 1,
            }));
            get().refreshNotArrivedSales();
        },
        setShippingStatus: (orderId: number, status: string) => {
            return new Promise((resolve, reject) => {
                apiRequest(ENDPOINTS.API.ORDERS.SET_SHIPPING_STATUS, 'POST', { orderId, status })
                    .then((data: any) => {
                        if (data.success) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
    }))
);
