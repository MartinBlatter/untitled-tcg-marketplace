import { Order, OrderShipping } from '@/app/api/orders/types';
import { ShoppingCartItem } from '@/src/store/types';

export type SalesNavBarProps = {
    selectedIndex: number;
};

export type SalesSingleOrderProps = {
    order: Order;
    expanded?: boolean;
    refresh: () => void;
};

export type SalesAccordionProps = {
    sale: Order;
    loading: boolean;
    expanded: boolean;
    handleChange: (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
    refresh: () => void;
};

export type SalesSummaryProps = {
    title: string;
    count: number;
    sum: number;
};

export type InCartSaleProps = {
    index: number;
    cart: Cart;
    loading: boolean;
    expanded: boolean;
    handleChange: (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
};

export type Cart = {
    id: number;
    createdAt: string;
    updatedAt: string;
    deactivatedAt: string;
    status: string;
    userId: number;
    items: ShoppingCartItem[];
};
export interface ShippingStatusPaperProps {
    status: string;
    orderStatus: string;
    shippedAt?: string;
    onStatusChange: (status: string) => void;
    paymentStatus?: string;
    orderId?: number;
    orderShipping?: OrderShipping | null;
}

export interface PaymentStatusPaperProps {
    status: string;
    paidAt?: string;
    orderId: number;
    totalPrice: number;
}

export interface OrderStatusPaperProps {
    status: string;
    arrivedAt?: string;
    cancelledAt?: string;
    onRelistItems?: () => void;
}

export interface SalesFiltersType {
    buyerName: string;
    minPrice: string;
    maxPrice: string;
    createdAtStart: string;
    createdAtEnd: string;
    itemName: string;
    orderId: string;
}

export interface SalesFiltersProps {
    filters: SalesFiltersType;
    setFilters: (filters: SalesFiltersType) => void;
    resetFilters: () => void;
    loading?: boolean;
    autoExpand?: boolean;
}

export interface RefundResponse {
    success: boolean;
    message?: string;
}
