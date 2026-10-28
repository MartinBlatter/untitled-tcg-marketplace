import { Order, OrderAddress, OrderItem, OrderShipping } from '@/app/api/orders/types';
import { CardSet } from '../types/AllMTGJSONTypes';

export interface WishlistsState {
    loading: boolean;
    currentWishlist: WishlistResponseItem | null;
    currentWishlistId: number | null;
    publicWishlist: Wishlist | null;
    wishlists: WishlistResponseItem[];
    previewItems: WishlistItem[];
    importErrors: string[];
    refresh: () => void;
    setCurrentWishlist: (id: number) => void;
    setCurrentWishlistId: (id: number) => void;
    setWishlists: (wishlists: Wishlist[]) => void;
    sortItems: (column: string, order: string) => void;
    add: (name: string, description: string) => Promise<any>;
    remove: (id: number) => void;
    setLoading: (loading: boolean) => void;
    addItem: (item: any) => Promise<any>;
    deleteItem: (id: number) => Promise<any>;
    editItem: (item: any) => Promise<any>;
    addItemsList: (wishlistId: number, items: string) => Promise<any>;
    MassEditItems: (id: number, selectedIds: number[], values: any) => Promise<any>;
    refreshPublicWishlist: (hash: string) => void;
    sortPublicItems: (column: string, order: string) => void;
    setPreviewItems: (items: WishlistItem[]) => void;
    setImportErrors: (errors: string[]) => void;
}

export interface Wishlist {
    id: number;
    userId: number;
    type: string;
    name: string;
    description: string;
    items: WishlistItem[];
    updatedAt: String;
    createdAt: String;
    deactivatedAt: String;
}

export interface WishlistItem {
    id: number | null;
    uuid: string;
    wishlistId: number;
    name: string;
    setCodes: string[];
    quantity: number;
    language: string;
    quality: string;
    isFoil: boolean;
    isAltered: boolean;
    isSigned: boolean;
    isMisprint: boolean;
    isGraded: boolean;
    price: number;
    comment: string;
    updatedAt: String;
    createdAt: String;
    deactivatedAt: String;
}

export interface WishlistResponseItem {
    'mtg.wishlist'?: {
        id: number;
        userId: number;
        type: string;
        name: string;
        description?: string;
        updatedAt?: String;
        createdAt?: String;
        deactivatedAt?: String;
    };
    profiledata?: {
        id: number;
        userName: string;
        firstName: string;
        lastName: string;
        company?: string;
        address?: string;
        shippingAddress?: string;
        type: string;
        eMail: string;
        active: number;
        onVacation: string;
        lastLogin?: string;
        updatedAt?: string;
        createdAt?: string;
        deactivatedAt?: string;
    };
    items?: WishlistItem[];
}

export interface BuyableItemsState {
    loading: boolean;
    items: BuylistItem[];
    hasFilters: boolean;
    filters: any;
    filteredItems: BuylistItem[];
    setFilter: (column: string, value: string | string[]) => void;
    refresh: (uuid: string) => void;
    filterItems: () => void;
    resetFilters: () => void;
    removeItem: (id: number, amount: number) => void;
}

export interface BuylistItem {
    id: number;
    name?: string;
    uuid?: string;
    user: string;
    country: string;
    quantity: number;
    language: string;
    quality: string;
    isFoil: boolean | number;
    isAltered: boolean | number;
    isSigned: boolean | number;
    isMisprint: boolean | number;
    isGraded: boolean | number;
    price: number;
    comment?: string;
    imagePath?: string;
    grading?: string;
    gradingCompany?: string;
}

export interface Buylist {
    id: number;
    name: string;
    description: string | null;
    isPublic: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    items?: BuylistItem[];
}

export interface BuylistUpdateParams {
    name?: string;
    description?: string | null;
    isPublic?: boolean;
}

export interface BuylistStoreState {
    buylists: Buylist[];
    currentBuylist: Buylist | null;
    isLoading: boolean;
    error: string | null;

    // Fetch all buylists
    fetchBuylists: () => void;

    // Fetch a specific buylist by ID
    fetchBuylistById: (id: number) => void;

    // Create a new buylist
    createBuylist: (name: string, description: string, isPublic: boolean) => Promise<any>;

    // Update an existing buylist
    updateBuylist: (id: number, params: BuylistUpdateParams) => Promise<any>;

    // Delete a buylist
    deleteBuylist: (id: number) => Promise<any>;

    // Add an item to a buylist
    addBuylistItem: (buylistId: number, item: BuylistItemCreate) => Promise<any>;

    // Delete an item from a buylist
    deleteBuylistItem: (buylistId: number, itemId: number) => Promise<any>;

    // Update an item in a buylist
    updateBuylistItem: (buylistId: number, itemId: number, item: Partial<BuylistItemCreate>) => Promise<any>;
}

export interface BuylistItemCreate {
    uuid: string;
    name: string;
    quantity: number;
    maxBuys?: number;
    bought?: number;
    price: number;
    language?: string;
    quality?: string;
    isFoil?: boolean;
    isAltered?: boolean;
    isSigned?: boolean;
    isMisprint?: boolean;
    isGraded?: boolean;
    comment?: string;
    setCodes?: string | string[];
}

export interface CardOption {
    uuid: string;
    name: string;
    setName: string;
    setCode: string;
    imageUrl?: string;
}

export interface MessagesState {
    loading: boolean;
    conversationsLoading: boolean;
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    page: number;
    size: number;
    count: number;
    refresh: () => void;
    refreshWithoutLoading: () => void;
    setSelectedConversation: (conversation: Conversation) => void;
    setConversationRead: (conversation: Conversation) => void;
    setPage: (page: number) => void;
    setSize: (size: number) => void;
}

export interface Conversation {
    userName: string;
    userId: number;
    messages: Message[];
    unread: boolean;
}

export interface Message {
    id: number;
    senderId: number;
    recipientId: number;
    title: string;
    text: string;
    createdAt: string;
    read: number;
}

export interface InventoryState {
    loading: boolean;
    page: number;
    size: number;
    privatePage: number;
    privateSize: number;
    forSalePage: number;
    forSaleSize: number;
    sortBy: string;
    sortOrder: string;
    filters: any;
    setFilter: (column: string, value: string | string[]) => void;
    resetFilters: () => void;
    setLoading: (loading: boolean) => void;
    viewMode: string;
    setViewMode: (viewMode: string) => void;
    fullInventory: any[];
    setFullInventory: (inventory: any[]) => void;
    fullInventoryCount: number;
    setFullInventoryCount: (count: number) => void;
    privateInventory: any[];
    setPrivateInventory: (inventory: any[]) => void;
    privateInventoryCount: number;
    setPrivateInventoryCount: (count: number) => void;
    forSaleInventory: any[];
    setForSaleInventory: (inventory: any[]) => void;
    forSaleInventoryCount: number;
    setForSaleInventoryCount: (count: number) => void;
    setPage: (page: number) => void;
    setSize: (size: number) => void;
    setPrivatePage: (page: number) => void;
    setPrivateSize: (size: number) => void;
    setForSalePage: (page: number) => void;
    setForSaleSize: (size: number) => void;
    setSortBy: (sortBy: string) => void;
    setSortOrder: (sortOrder: string) => void;
    setSorting: (column: string) => void;
    refreshFullInventory: () => void;
    refreshPrivateInventory: () => void;
    refreshSaleInventory: () => void;
    resetPages: () => void;
}

export interface ShoppingCartState {
    loading: boolean;
    adding: boolean;
    removing: boolean;
    items: ShoppingCartItem[][];
    funds: number;
    addShoppingCartItem: (item: ShoppingCartItem) => Promise<any>;
    removeShoppingCartItem: (id: number) => Promise<any>;
    getShoppingCartPrice: () => number;
    refreshShoppingCartItems: () => void;
    refreshFunds: () => void;
}

export interface ShoppingCartItem {
    cartId?: string;
    id?: number;
    status?: string;
    game: string;
    foreignKeySource: string;
    foreignKey: string;
    quantity: number;
    price: string;
    displayName?: string;
    sellerId?: number;
    sellerName?: string;
    type?: string;
    card?: CardSet;
}

export interface ShippingState {
    loading: boolean;
    defaultShippingMap: any;
    usesCustom: boolean;
    CustomShippingItems: CustomShipping[];
    setLoading: (loading: boolean) => void;
    refresh: (email: string) => void;
    setUsesCustom: (usesCustom: boolean) => void;
    addCustomShippingItem: (item: CustomShipping) => void;
    removeCustomShippingItem: (id: number) => void;
    insuredShippingMandatory: boolean;
    setInsuredShippingMandatory: (insuredShippingMandatory: boolean) => void;
}

export interface CustomShipping {
    id?: number;
    range: string;
    type: string;
    cards?: number;
    maxValue?: number;
    weight?: number;
    price: number;
    tracking?: number;
}

export interface PurchasesState {
    loading: boolean;
    newPurchases: Order[];
    unpaidPurchases: Order[];
    unpaidPage: number;
    unpaidCount: number;
    unpaidLoading: boolean;
    unpaidSum: number;
    paidPurchases: Order[];
    paidPage: number;
    paidCount: number;
    paidLoading: boolean;
    paidSum: number;
    shippedPurchases: Order[];
    shippedPage: number;
    shippedCount: number;
    shippedLoading: boolean;
    shippedSum: number;
    deliveredPurchases: Order[];
    deliveredPage: number;
    deliveredCount: number;
    deliveredLoading: boolean;
    deliveredSum: number;
    deliveredFilters: {
        sellerName: string;
        minPrice: string;
        maxPrice: string;
        createdAtStart: string;
        createdAtEnd: string;
        itemName: string;
        orderId: string;
    };
    cancelledPurchases: Order[];
    cancelledPage: number;
    cancelledCount: number;
    cancelledLoading: boolean;
    cancelledSum: number;
    cancelledFilters: {
        sellerName: string;
        minPrice: string;
        maxPrice: string;
        createdAtStart: string;
        createdAtEnd: string;
        itemName: string;
        orderId: string;
    };
    notArrivedPurchases: Order[];
    notArrivedPage: number;
    notArrivedCount: number;
    notArrivedLoading: boolean;
    notArrivedSum: number;
    notArrivedFilters: {
        sellerName: string;
        minPrice: string;
        maxPrice: string;
        createdAtStart: string;
        createdAtEnd: string;
        itemName: string;
        orderId: string;
    };
    setLoading: (loading: boolean) => void;
    refreshNewPurchases: () => void;
    refreshUnpaidPurchases: () => void;
    setUnpaidPage: (page: number) => void;
    refreshPaidPurchases: () => void;
    setPaidPage: (page: number) => void;
    refreshShippedPurchases: () => void;
    setShippedPage: (page: number) => void;
    refreshDeliveredPurchases: () => void;
    setDeliveredPage: (page: number) => void;
    setDeliveredFilters: (filters: any) => void;
    resetDeliveredFilters: () => void;
    refreshCancelledPurchases: () => void;
    setCancelledPage: (page: number) => void;
    setCancelledFilters: (filters: any) => void;
    resetCancelledFilters: () => void;
    refreshNotArrivedPurchases: () => void;
    setNotArrivedPage: (page: number) => void;
    setNotArrivedFilters: (filters: any) => void;
    resetNotArrivedFilters: () => void;
}

export interface SalesState {
    loading: boolean;
    inCartSales: any[];
    inCartPage: number;
    inCartCount: number;
    inCartLoading: boolean;
    inCartSum: number;
    unpaidSales: Order[];
    unpaidPage: number;
    unpaidCount: number;
    unpaidLoading: boolean;
    unpaidSum: number;
    paidSales: Order[];
    paidPage: number;
    paidCount: number;
    paidLoading: boolean;
    paidSum: number;
    packedSales: Order[];
    packedPage: number;
    packedCount: number;
    packedLoading: boolean;
    packedSum: number;
    shippedSales: Order[];
    shippedPage: number;
    shippedCount: number;
    shippedLoading: boolean;
    shippedSum: number;
    deliveredSales: Order[];
    deliveredPage: number;
    deliveredCount: number;
    deliveredLoading: boolean;
    deliveredSum: number;
    deliveredFilters: {
        buyerName: string;
        minPrice: string;
        maxPrice: string;
        createdAtStart: string;
        createdAtEnd: string;
        itemName: string;
        orderId: string;
    };
    cancelledSales: Order[];
    cancelledPage: number;
    cancelledCount: number;
    cancelledLoading: boolean;
    cancelledSum: number;
    cancelledFilters: {
        buyerName: string;
        minPrice: string;
        maxPrice: string;
        createdAtStart: string;
        createdAtEnd: string;
        itemName: string;
        orderId: string;
    };
    notArrivedSales: Order[];
    notArrivedPage: number;
    notArrivedCount: number;
    notArrivedLoading: boolean;
    notArrivedSum: number;
    notArrivedFilters: {
        buyerName: string;
        minPrice: string;
        maxPrice: string;
        createdAtStart: string;
        createdAtEnd: string;
        itemName: string;
        orderId: string;
    };
    setLoading: (loading: boolean) => void;
    refreshInCartSales: () => void;
    setInCartPage: (page: number) => void;
    refreshUnpaidSales: () => void;
    setUnpaidPage: (page: number) => void;
    refreshPaidSales: () => void;
    setPaidPage: (page: number) => void;
    refreshPackedSales: () => void;
    setPackedPage: (page: number) => void;
    refreshShippedSales: () => void;
    setShippedPage: (page: number) => void;
    refreshDeliveredSales: () => void;
    setDeliveredPage: (page: number) => void;
    setDeliveredFilters: (filters: any) => void;
    resetDeliveredFilters: () => void;
    refreshCancelledSales: () => void;
    setCancelledPage: (page: number) => void;
    setCancelledFilters: (filters: any) => void;
    resetCancelledFilters: () => void;
    refreshNotArrivedSales: () => void;
    setNotArrivedPage: (page: number) => void;
    setNotArrivedFilters: (filters: any) => void;
    resetNotArrivedFilters: () => void;
    setShippingStatus: (orderId: number, status: string) => Promise<any>;
}

export interface PickingList {
    id: number;
    userId: number;
    name: string;
    orderAmount: number;
    createdAt?: string;
    updatedAt?: string;
    items: PickingListItem[];
}

export interface PickingListItem {
    id: number;
    picklistId: number;
    orderItemId: number;
    status: string;
    problem?: string;
    createdAt?: string;
    updatedAt?: string;
    orderItem?: OrderItem;
    card?: CardSet;
    order?: Order;
    orderAddress?: OrderAddress;
    orderShipping?: OrderShipping;
    buyer?: {
        name?: string;
        country?: string;
    };
}

export interface PickingListState {
    loading: boolean;
    lists: PickingList[];
    list: PickingList;
    pickedItems: PickingListItem[];
    orderIndexList: number[];
    refresh: () => void;
    createFromPaidOrders: () => Promise<any>;
    createFromSelectedOrders: (orderIds: number[]) => Promise<any>;
    deleteList: (id: number) => Promise<any>;
    getListById: (id: number) => Promise<void>;
    setPickedItems: (items: PickingListItem[]) => void;
    setListItems: (items: PickingListItem[]) => void;
    setItemToPicked: (item: PickingListItem) => void;
    setItemToUnpicked: (item: PickingListItem) => void;
    setItemStatus: (item: PickingListItem | undefined, status: string) => void;
    setItemProblem: (item: PickingListItem | undefined, problem: string) => void;
}
