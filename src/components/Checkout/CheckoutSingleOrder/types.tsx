import { ShippingData } from '@/app/api/shipping/[id]/types';
import { ShoppingCartItem } from '@/src/store/types';

export type CheckoutSingleOrderProps = {
    sellerItem: ShoppingCartItem[];
    index: number;
    addressData: any;
    loadingAddressData: boolean;
};

export interface OrderHeadlineProps {
    userName: string;
    country: string;
}

export interface ShippingBoxProps {
    shippingData: ShippingData[];
    requiresTracking: boolean;
    initialPrice: number;
    cartId: string;
    sellerId: string;
}

export interface SellerBoxProps {
    userData: {
        userName: string;
        firstName: string;
        country: string;
    };
    businessData?: {
        name: string;
    };
}

export interface AddressBoxProps {
    addressData: string;
    minHeight?: number;
    country: string;
}
