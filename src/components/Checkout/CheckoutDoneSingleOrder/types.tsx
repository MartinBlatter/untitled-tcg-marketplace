import { Order, OrderShipping } from '@/app/api/orders/types';

export interface CheckoutDoneSingleOrderProps {
    order: Order;
    hideHeader?: boolean;
    expanded?: boolean;
    refresh?: () => void;
}

export interface DoneOrderSellerBoxProps {
    userData: {
        userName: string;
        firstName: string;
        lastName: string;
        country: string;
        address: string;
    };
    businessData?: {
        name: string;
        address: string;
    };
    type: string;
}

export interface DoneOrderShippingBoxProps {
    orderShipping: OrderShipping | null;
}

export interface OrderStatusPaperProps {
    status: string | null;
    shippingStatus: string | null;
    arrivedAt?: string | Date | null;
    cancelledAt?: string | Date | null;
    shippedAt?: string | Date | null;
    orderId?: string | number;
    onSuccess?: () => void;
    orderItems?: any[]; // Added for AddToInventoryDialog
}

export type PaymentStatusPaperProps = {
    status: string | null;
    paidAt?: string | Date | null;
    orderId?: string | number;
};

export interface ShippingStatusPaperProps {
    status: string | null;
    shippedAt?: string | Date | null;
}

export interface ConfirmArrivalDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: string | number;
    onSuccess?: () => void;
}

export interface ExtraPaymentResponse {
    success: boolean;
    message?: string;
}
