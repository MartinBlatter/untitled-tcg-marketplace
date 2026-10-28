import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { ENDPOINTS } from '../constants/endpoints';
import { PICKING_LIST_ITEM_STATUS } from '../constants/status';
import { PickingList, PickingListItem, PickingListState } from './types';

export const usePickingListStore = create<PickingListState>()(
    devtools((set, get) => ({
        loading: false,
        lists: [] as PickingList[],
        list: {} as PickingList,
        pickedItems: [] as PickingListItem[],
        orderIndexList: [],
        refresh: async () => {
            set({ loading: true });
            const data = await apiRequest(ENDPOINTS.API.PICKING_LISTS.GET);
            set({ lists: data as PickingList[], loading: false });
        },
        createFromPaidOrders: async () => {
            set({ loading: true });
            const data = await apiRequest(ENDPOINTS.API.PICKING_LISTS.CREATE, 'POST');
            await get().refresh();
            return data;
        },
        createFromSelectedOrders: async (orderIds: number[]) => {
            set({ loading: true });
            const data = await apiRequest(ENDPOINTS.API.PICKING_LISTS.CREATE_SELECTIVE, 'POST', {
                orderIds: orderIds,
            });
            await get().refresh();
            return data;
        },
        deleteList: async (id: number) => {
            set({ loading: true });
            const data = await apiRequest(`${ENDPOINTS.API.PICKING_LISTS.DELETE}/${id}`, 'DELETE');
            await get().refresh();
            return data;
        },
        getListById: async (id: number) => {
            set({ loading: true });
            await apiRequest(`${ENDPOINTS.API.PICKING_LISTS.GET}/${id}`).then((data: any) => {
                const orderIndexList = [...new Set(data.list.items.map((item: any) => item.orderItem?.orderId))];
                const newPickedItems = data.list.items.filter((item: any) => item.status === PICKING_LIST_ITEM_STATUS.PICKED);
                const newListItems = data.list.items.filter((item: any) => item.status !== PICKING_LIST_ITEM_STATUS.PICKED);
                set((state) => ({ loading: false, list: { ...data.list, items: newListItems }, orderIndexList: orderIndexList as number[], pickedItems: newPickedItems }));
            });
        },
        setPickedItems: (items: PickingListItem[]) => {
            set({ pickedItems: items });
        },
        setListItems: (items: PickingListItem[]) => {
            set((state) => ({ list: { ...state.list, items } }));
        },
        setItemToPicked: (item: PickingListItem) => {
            item.status = PICKING_LIST_ITEM_STATUS.PICKED;
            const pickedItems = get().pickedItems;
            const newPickedItems = [...pickedItems, item];
            const newList = get().list.items.filter((listItem) => listItem.id !== item.id);
            set({ pickedItems: newPickedItems, list: { ...get().list, items: newList } });

            // Save to database
            apiRequest(ENDPOINTS.API.PICKING_LISTS.ITEM.UPDATE, 'POST', {
                id: item.id,
                status: PICKING_LIST_ITEM_STATUS.PICKED,
            });
        },
        setItemToUnpicked: (item: PickingListItem) => {
            const pickedItems = get().pickedItems.filter((pickedItem) => pickedItem.id !== item.id);
            const newList = [...get().list.items, item];
            set({ pickedItems, list: { ...get().list, items: newList } });

            // Save to database
            apiRequest(ENDPOINTS.API.PICKING_LISTS.ITEM.UPDATE, 'POST', {
                id: item.id,
                status: null,
            });
        },
        setItemStatus: (item: PickingListItem | undefined, status: string) => {
            if (!item) return;
            const updatedItems = get().list.items.map((i) => (i.id === item.id ? { ...i, status } : i));
            set((state) => ({ list: { ...state.list, items: updatedItems } }));

            // Save to database
            apiRequest(ENDPOINTS.API.PICKING_LISTS.ITEM.UPDATE, 'POST', {
                id: item.id,
                status: status,
            });
        },
        setItemProblem: (item: PickingListItem | undefined, problem: string) => {
            if (!item) return;
            const updatedItems = get().list.items.map((i) => (i.id === item.id ? { ...i, problem: problem, status: PICKING_LIST_ITEM_STATUS.PROBLEM } : i));
            set((state) => ({ list: { ...state.list, items: updatedItems } }));

            // Save to database
            apiRequest(ENDPOINTS.API.PICKING_LISTS.ITEM.UPDATE, 'POST', {
                id: item.id,
                problem: problem,
                status: PICKING_LIST_ITEM_STATUS.PROBLEM,
            });
        },
    }))
);
