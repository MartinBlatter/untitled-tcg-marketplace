import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { AddShoppingCart, Checklist, Favorite, LocalShipping, Mail, ShoppingBasket, ShoppingCart } from '@mui/icons-material';
import AppsIcon from '@mui/icons-material/Apps';
import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';

export const firstList = [
    { text: 'home', url: INTERNAL_ROUTES.HOME, icon: <HomeIcon /> },
    { text: 'products', url: INTERNAL_ROUTES.MAGIC.PRODUCTS, icon: <AppsIcon /> },
    { text: 'detailedSearch', url: INTERNAL_ROUTES.MAGIC.SEARCH, icon: <SearchIcon /> },
];

export const secondList = [
    {
        text: 'purchases',
        url: '',
        icon: <ShoppingCart />,
        nestedList: [
            { text: 'unpaid', url: INTERNAL_ROUTES.PURCHASES.UNPAID },
            { text: 'paid', url: INTERNAL_ROUTES.PURCHASES.PAID },
            { text: 'shipped', url: INTERNAL_ROUTES.PURCHASES.SHIPPED },
            { text: 'delivered', url: INTERNAL_ROUTES.PURCHASES.DELIVERED },
            { text: 'cancelled', url: INTERNAL_ROUTES.PURCHASES.CANCELLED },
        ],
    },
    {
        text: 'sales',
        url: '',
        icon: <ShoppingBasket />,
        nestedList: [
            { text: 'inShoppingCart', url: INTERNAL_ROUTES.SALES.IN_CART },
            { text: 'unpaid', url: INTERNAL_ROUTES.SALES.UNPAID },
            { text: 'paid', url: INTERNAL_ROUTES.SALES.PAID },
            { text: 'packed', url: INTERNAL_ROUTES.SALES.PACKED },
            { text: 'shipped', url: INTERNAL_ROUTES.SALES.SHIPPED },
            { text: 'delivered', url: INTERNAL_ROUTES.SALES.DELIVERED },
            { text: 'cancelled', url: INTERNAL_ROUTES.SALES.CANCELLED },
            { text: 'notArrived', url: INTERNAL_ROUTES.SALES.NOT_ARRIVED },
        ],
    },
    {
        text: 'pickingLists',
        url: INTERNAL_ROUTES.PICKING_LISTS,
        icon: <Checklist />,
    },
];

export const thirdList = [
    { text: 'inventory', url: INTERNAL_ROUTES.INVENTORY, icon: <InventoryIcon /> },
    { text: 'wishlists', url: INTERNAL_ROUTES.WISHLISTS, icon: <Favorite /> },
    { text: 'messages', url: INTERNAL_ROUTES.MESSAGES, icon: <Mail /> },
    {
        text: 'statistics',
        url: '',
        icon: <BarChartIcon />,
        nestedList: [
            { text: 'salesStats', url: INTERNAL_ROUTES.STATISTICS.SALES },
            { text: 'purchasesStats', url: INTERNAL_ROUTES.STATISTICS.PURCHASES },
        ],
    },
];

export const fourthList = [
    { text: 'shipping', url: INTERNAL_ROUTES.PROFILE.SHIPPING, icon: <LocalShipping /> },
    { text: 'buylists', url: INTERNAL_ROUTES.BUYLIST.ROOT, icon: <AddShoppingCart /> },
];
