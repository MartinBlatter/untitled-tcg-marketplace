export const INTERNAL_ROUTES = {
    PROFILE: {
        ROOT: '/profile',
        SETTINGS: '/profile/settings',
        SHIPPING: '/profile/shipping',
        BUSINESS: '/profile/business',
    },
    BUYLIST: {
        ROOT: '/buylists',
        BY_ID: (id: string | number) => `/buylists/${id}`,
    },
    MAGIC: {
        PRODUCTS: '/magic/products',
        SEARCH: '/magic/search',
        PRODUCTS_BY_CATEGORY: (category: string) => `/magic/products/${category}`,
        SET_PRODUCTS: (set: string) => `/magic/${set}/products`,
        SET_PRODUCTS_BY_CATEGORY: (set: string, category: string) => `/magic/${set}/products/${category}`,
    },
    USER: {
        PROFILE: (username: string) => `/user/${username}`,
        INVENTORY: (username: string) => `/user/${username}/inventory`,
        INVENTORY_BY_CATEGORY: (username: string, category: string) => `/user/${username}/inventory/magic/${category}`,
    },
    SHARED: {
        WISHLIST: (hash: string) => `/shared/wishlist/${hash}`,
    },
    LOGIN: '/login',
    REGISTER: '/register',
    HOME: '/',
    INVENTORY: '/inventory',
    WISHLISTS: '/wishlists',
    MESSAGES: '/messages',
    STATIC: {
        IMAGES: {
            MAGIC: {
                EDITIONS: '/images/magic/editions',
            },
            FLAGS: '/images/flags',
        },
    },
    PURCHASES: {
        UNPAID: '/purchases/unpaid',
        PAID: '/purchases/paid',
        SHIPPED: '/purchases/shipped',
        DELIVERED: '/purchases/delivered',
        CANCELLED: '/purchases/cancelled',
        NOT_ARRIVED: '/purchases/not-arrived',
    },
    SALES: {
        UNPAID: '/sales/unpaid',
        PAID: '/sales/paid',
        SHIPPED: '/sales/shipped',
        DELIVERED: '/sales/delivered',
        CANCELLED: '/sales/cancelled',
        NOT_ARRIVED: '/sales/not-arrived',
        IN_CART: '/sales/in-cart',
        PACKED: '/sales/packed',
    },
    STATISTICS: {
        ROOT: '/statistics',
        SALES: '/statistics/sales',
        PURCHASES: '/statistics/purchases',
    },
    PICKING_LISTS: '/picking-lists',
} as const;
