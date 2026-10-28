import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { ENDPOINTS } from '../constants/endpoints';
import { shipping } from '../constants/shipping';
import { ShippingState } from './types';

export const useShippingStore = create<ShippingState>()(
    devtools((set, get) => ({
        loading: true,
        defaultShippingMap: shipping['DE'],
        CustomShippingItems: [],
        usesCustom: false,
        insuredShippingMandatory: false,
        setLoading: (loading: boolean) => set((state) => ({ loading: loading })),
        refresh: async (email: string) => {
            if (!email) return;
            set((state) => ({ loading: true }));
            apiRequest(`${ENDPOINTS.API.PROFILE.GET}/${encodeURI(email)}`).then((data: any) => {
                set((state) => ({ defaultShippingMap: shipping[data.user.country as keyof typeof shipping] }));
            });
            apiRequest(`${ENDPOINTS.API.PROFILE.SETTINGS}/customShipping`).then((data: any) => {
                data === 'true' ? set((state) => ({ usesCustom: true })) : set((state) => ({ usesCustom: false }));
            });
            apiRequest(`${ENDPOINTS.API.PROFILE.SETTINGS}/insuredShippingMandatory`).then((data: any) => {
                data === 'true' ? set((state) => ({ insuredShippingMandatory: true })) : set((state) => ({ insuredShippingMandatory: false }));
            });
            apiRequest(ENDPOINTS.API.PROFILE.SHIPPING).then((data: any) => {
                set((state) => ({ CustomShippingItems: data.shipping, loading: false }));
            });
        },
        setUsesCustom: (usesCustom: boolean) => {
            if (usesCustom !== (get().usesCustom as unknown as boolean)) {
                set((state) => ({ usesCustom: usesCustom }));
                const value = usesCustom ? 'true' : 'false';
                apiRequest(`${ENDPOINTS.API.PROFILE.SETTINGS}/defaultcustomShippingAddress`, 'POST', { value: value });
            }
        },
        addCustomShippingItem: (item: any) => {
            apiRequest(ENDPOINTS.API.PROFILE.SHIPPING, 'POST', item).then((data: any) => {
                set((state) => ({ CustomShippingItems: data.shipping }));
            });
        },
        removeCustomShippingItem: (id: number) => {
            set((state) => ({ CustomShippingItems: state.CustomShippingItems.filter((item: any) => item.id !== id) }));
        },
        setInsuredShippingMandatory: (insuredShippingMandatory: boolean) => {
            set((state) => ({ insuredShippingMandatory: insuredShippingMandatory }));
            apiRequest(`${ENDPOINTS.API.PROFILE.SETTINGS}/insuredShippingMandatory`, 'POST', { value: insuredShippingMandatory ? 'true' : 'false' });
        },
    }))
);
