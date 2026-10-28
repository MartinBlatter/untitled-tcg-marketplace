import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { ENDPOINTS } from '../constants/endpoints';
import { PurchasesState } from './types';

export const usePurchasesStore = create<PurchasesState>()(
    devtools((set, get) => ({
        loading: true,
        newPurchases: [],
        unpaidPurchases: [],
        unpaidPage: 1,
        unpaidCount: 0,
        unpaidLoading: true,
        unpaidSum: 0,
        paidPurchases: [],
        paidPage: 1,
        paidCount: 0,
        paidLoading: true,
        paidSum: 0,
        shippedPurchases: [],
        shippedPage: 1,
        shippedCount: 0,
        shippedLoading: true,
        shippedSum: 0,
        deliveredPurchases: [],
        deliveredPage: 1,
        deliveredCount: 0,
        deliveredLoading: true,
        deliveredSum: 0,
        deliveredFilters: {
            sellerName: '',
            minPrice: '',
            maxPrice: '',
            createdAtStart: '',
            createdAtEnd: '',
            itemName: '',
            orderId: '',
        },
        cancelledPurchases: [],
        cancelledPage: 1,
        cancelledCount: 0,
        cancelledLoading: true,
        cancelledSum: 0,
        cancelledFilters: {
            sellerName: '',
            minPrice: '',
            maxPrice: '',
            createdAtStart: '',
            createdAtEnd: '',
            itemName: '',
            orderId: '',
        },
        notArrivedPurchases: [],
        notArrivedPage: 1,
        notArrivedCount: 0,
        notArrivedLoading: true,
        notArrivedSum: 0,
        notArrivedFilters: {
            sellerName: '',
            minPrice: '',
            maxPrice: '',
            createdAtStart: '',
            createdAtEnd: '',
            itemName: '',
            orderId: '',
        },
        setLoading: (loading: boolean) => set((state) => ({ loading: loading })),
        refreshNewPurchases: async () => {
            set((state) => ({ loading: true }));
            apiRequest(ENDPOINTS.API.PURCHASES.NEW).then((data: any) => {
                set((state) => ({ loading: false, newPurchases: data.orders }));
            });
        },
        refreshUnpaidPurchases: async () => {
            set((state) => ({ unpaidLoading: true }));
            apiRequest(`${ENDPOINTS.API.PURCHASES.UNPAID}?page=${get().unpaidPage}`).then((data: any) => {
                set((state) => ({ loading: false, unpaidLoading: false, unpaidPurchases: data.orders, unpaidCount: data.count, unpaidSum: data.sum }));
            });
        },
        setUnpaidPage: (page: number) => {
            set((state) => ({ unpaidPage: page }));
            get().refreshUnpaidPurchases();
        },
        refreshPaidPurchases: async () => {
            set((state) => ({ loading: true }));
            apiRequest(`${ENDPOINTS.API.PURCHASES.PAID}?page=${get().paidPage}`).then((data: any) => {
                set((state) => ({ loading: false, paidLoading: false, paidPurchases: data.orders, paidCount: data.count, paidSum: data.sum }));
            });
        },
        setPaidPage: (page: number) => {
            set((state) => ({ paidPage: page }));
            get().refreshPaidPurchases();
        },
        refreshShippedPurchases: async () => {
            set((state) => ({ loading: true }));
            apiRequest(`${ENDPOINTS.API.PURCHASES.SHIPPED}?page=${get().shippedPage}`).then((data: any) => {
                set((state) => ({ loading: false, shippedLoading: false, shippedPurchases: data.orders, shippedCount: data.count, shippedSum: data.sum }));
            });
        },
        setShippedPage: (page: number) => {
            set((state) => ({ shippedPage: page }));
            get().refreshShippedPurchases();
        },
        refreshDeliveredPurchases: async () => {
            set((state) => ({ loading: true }));
            const { deliveredPage, deliveredFilters } = get();
            const queryParams = new URLSearchParams({
                page: deliveredPage.toString(),
                ...deliveredFilters,
            });
            apiRequest(`${ENDPOINTS.API.PURCHASES.DELIVERED}?${queryParams}`).then((data: any) => {
                set((state) => ({
                    loading: false,
                    deliveredLoading: false,
                    deliveredPurchases: data.orders,
                    deliveredCount: data.count,
                    deliveredSum: data.sum,
                }));
            });
        },
        setDeliveredPage: (page: number) => {
            set((state) => ({ deliveredPage: page }));
            get().refreshDeliveredPurchases();
        },
        setDeliveredFilters: (filters) => {
            set((state) => ({
                deliveredFilters: { ...state.deliveredFilters, ...filters },
                deliveredPage: 1, // Reset page when filters change
            }));
            get().refreshDeliveredPurchases();
        },
        resetDeliveredFilters: () => {
            set((state) => ({
                deliveredFilters: {
                    sellerName: '',
                    minPrice: '',
                    maxPrice: '',
                    createdAtStart: '',
                    createdAtEnd: '',
                    itemName: '',
                    orderId: '',
                },
                deliveredPage: 1, // Reset page when filters are reset
            }));
            get().refreshDeliveredPurchases();
        },
        refreshCancelledPurchases: async () => {
            set((state) => ({ loading: true }));
            const { cancelledPage, cancelledFilters } = get();
            const queryParams = new URLSearchParams({
                page: cancelledPage.toString(),
                ...cancelledFilters,
            });
            apiRequest(`${ENDPOINTS.API.PURCHASES.CANCELLED}?${queryParams}`).then((data: any) => {
                set((state) => ({ loading: false, cancelledLoading: false, cancelledPurchases: data.orders, cancelledCount: data.count, cancelledSum: data.sum }));
            });
        },
        setCancelledPage: (page: number) => {
            set((state) => ({ cancelledPage: page }));
            get().refreshCancelledPurchases();
        },
        setCancelledFilters: (filters) => {
            set((state) => ({
                cancelledFilters: { ...state.cancelledFilters, ...filters },
                cancelledPage: 1, // Reset page when filters change
            }));
            get().refreshCancelledPurchases();
        },
        resetCancelledFilters: () => {
            set((state) => ({
                cancelledFilters: {
                    sellerName: '',
                    minPrice: '',
                    maxPrice: '',
                    createdAtStart: '',
                    createdAtEnd: '',
                    itemName: '',
                    orderId: '',
                },
                cancelledPage: 1, // Reset page when filters are reset
            }));
            get().refreshCancelledPurchases();
        },
        refreshNotArrivedPurchases: async () => {
            set((state) => ({ loading: true }));
            const { notArrivedPage, notArrivedFilters } = get();
            const queryParams = new URLSearchParams({
                page: notArrivedPage.toString(),
                ...notArrivedFilters,
            });
            apiRequest(`${ENDPOINTS.API.PURCHASES.NOT_ARRIVED}?${queryParams}`).then((data: any) => {
                set((state) => ({ loading: false, notArrivedLoading: false, notArrivedPurchases: data.orders, notArrivedCount: data.count, notArrivedSum: data.sum }));
            });
        },
        setNotArrivedPage: (page: number) => {
            set((state) => ({ notArrivedPage: page }));
            get().refreshNotArrivedPurchases();
        },
        setNotArrivedFilters: (filters) => {
            set((state) => ({
                notArrivedFilters: { ...state.notArrivedFilters, ...filters },
                notArrivedPage: 1, // Reset page when filters change
            }));
            get().refreshNotArrivedPurchases();
        },
        resetNotArrivedFilters: () => {
            set((state) => ({
                notArrivedFilters: {
                    sellerName: '',
                    minPrice: '',
                    maxPrice: '',
                    createdAtStart: '',
                    createdAtEnd: '',
                    itemName: '',
                    orderId: '',
                },
                notArrivedPage: 1, // Reset page when filters are reset
            }));
            get().refreshNotArrivedPurchases();
        },
    }))
);
