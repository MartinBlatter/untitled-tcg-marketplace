import { CardSet } from '@/src/types/AllMTGJSONTypes';

export interface Order {
    id?: number;
    orderItems: OrderItem[];
    orderAddress?: OrderAddress | null;
    orderShipping?: OrderShipping | null;
    orderCancellation?: OrderCancellation | null;
    buyerId: number | null;
    game: string | null;
    sellerId: number | null;
    status: string | null;
    paymentStatus: string | null;
    shippingStatus: string | null;
    totalPrice: number | null;
    paidAt: Date | null;
    shippedAt: Date | null;
    arrivedAt: Date | null;
    cancelledAt: Date | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deactivatedAt?: Date | null;
}

export interface OrderItem {
    id?: number;
    orderId: number | null;
    foreignKey: number | null;
    foreignKeySource: string | null;
    quantity: number | null;
    price: number | null;
    displayName: string | null;
    game: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deactivatedAt?: Date | null;
    type?: string;
    card?: CardSet;
    originalItem?: any; // Store complete inventory item data
}

export interface OrderAddress {
    id?: number;
    orderId: number | null;
    address: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deactivatedAt?: Date | null;
}

export interface OrderShipping {
    id?: number;
    orderId: number | null;
    displayName: string | null;
    price: number | null;
    trackingNumber: string | null;
    tracking?: number | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deactivatedAt?: Date | null;
}

export interface OrderCancellation {
    id?: number;
    orderId: number | null;
    message: string | null;
    status: string | null;
    requestedByUserId: number | null;
    acceptedAt: Date | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deactivatedAt?: Date | null;
}
