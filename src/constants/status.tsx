export const ORDER_STATUS = {
    NEW: 'new',
    PENDING: 'pending',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED_BY_BUYER: 'cancelled_by_buyer',
    CANCELLED_BY_SELLER: 'cancelled_by_seller',
    CANCELLED_BY_ADMIN: 'cancelled_by_admin',
    FAILED: 'failed',
    EXPIRED: 'expired',
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded',
    FAILED: 'failed',
};

export const SHIPPING_STATUS = {
    PENDING: 'pending',
    PACKED: 'packed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    NOT_ARRIVED: 'not_arrived',
};

export const CANCELLATION_STATUS = {
    REQUESTED: 'requested',
    ACCEPTED: 'accepted',
    CANCELLED: 'cancelled',
};

export const PICKING_LIST_ITEM_STATUS = {
    PICKED: 'picked',
    PROBLEM: 'problem',
    UNPICKED: '',
    FOUND: 'found',
};
