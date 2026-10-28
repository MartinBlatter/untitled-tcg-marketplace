import { cardTypesEnum } from './cardTypes';
import { countriesEnum } from './countries';
import { languagesEnum } from './languages';
import { qualitiesEnum } from './qualities';
import { raritiesEnum } from './rarities';
import { staticSets } from './sets'; // Import staticSets (formerly sets) as a fallback

// Note: The sets array here is only used as a default placeholder for the UI settings.
// Actual set data will be fetched dynamically from the database when the components render.
// See src/actions/sets.tsx for the implementation of database fetching.

export const defaultUserSettings = [
    {
        category: 'productView',
        items: [
            {
                name: 'productView',
                default: 'list',
                type: 'radio',
                options: ['list', 'tiles'],
            },
            {
                name: 'defaultProductSort',
                default: 'name',
                type: 'select',
                options: ['name', 'setCode', 'number', 'rarity'],
            },
            {
                name: 'defaultProductSortDirection',
                default: 'asc',
                type: 'select',
                options: ['asc', 'desc'],
            },
            {
                name: 'productsRarityFilter',
                default: '',
                type: 'select',
                options: raritiesEnum,
                additionalTranslationNs: 'rarities',
            },
            {
                name: 'productsTypeFilter',
                default: '',
                type: 'select',
                options: cardTypesEnum,
                additionalTranslationNs: 'cardTypes',
            },
            {
                name: 'productsSetFilter',
                default: [],
                type: 'multi',
                options: staticSets, // Using staticSets as a fallback
                keySource: 'magicSetCodeToNameMapping',
            },
        ],
    },
    {
        category: 'productDetailView',
        items: [
            {
                name: 'productDetailViewFilterCountry',
                default: [],
                type: 'select',
                options: countriesEnum,
                additionalTranslationNs: 'countries',
            },
            {
                name: 'productDetailViewFilterQuality',
                default: [],
                type: 'select',
                options: qualitiesEnum,
                additionalTranslationNs: 'qualityStrings',
            },
            {
                name: 'productDetailViewFilterLanguage',
                default: [],
                type: 'multi',
                options: languagesEnum,
                additionalTranslationNs: 'localeStrings',
            },
            {
                name: 'productDetailViewFilterFoil',
                default: [],
                type: 'select',
                options: ['1', '0', ''],
            },
            {
                name: 'productDetailViewFilterSigned',
                default: [],
                type: 'select',
                options: ['1', '0', ''],
            },
            {
                name: 'productDetailViewFilterAltered',
                default: [],
                type: 'select',
                options: ['1', '0', ''],
            },
            {
                name: 'productDetailViewFilterMisprint',
                default: [],
                type: 'select',
                options: ['1', '0', ''],
            },
            {
                name: 'productDetailViewFilterGraded',
                default: [],
                type: 'select',
                options: ['1', '0', ''],
            },
        ],
    },
    {
        category: 'searchView',
        items: [
            {
                name: 'searchView',
                default: 'list',
                type: 'radio',
                options: ['list', 'tiles'],
            },
            {
                name: 'defaultSearchSort',
                default: 'name',
                type: 'select',
                options: ['name', 'setCode', 'number', 'rarity', 'price'],
            },
            {
                name: 'defaultSearchSortDirection',
                default: 'asc',
                type: 'select',
                options: ['asc', 'desc'],
            },
        ],
    },
    {
        category: 'inventoryView',
        items: [
            {
                name: 'inventoryView',
                default: 'list',
                type: 'radio',
                options: ['list', 'tiles'],
            },
            {
                name: 'defaultInventorySort',
                default: 'name',
                type: 'select',
                options: ['name', 'setCode', 'number', 'rarity', 'price'],
            },
            {
                name: 'defaultInventorySortDirection',
                default: 'asc',
                type: 'select',
                options: ['asc', 'desc'],
            },
        ],
    },
    {
        category: 'wishlistView',
        items: [
            {
                name: 'wishlistView',
                default: 'list',
                type: 'radio',
                options: ['list', 'tiles'],
            },
            {
                name: 'defaultWishlistSort',
                default: 'name',
                type: 'select',
                options: ['name', 'setCode', 'language'],
            },
            {
                name: 'defaultWishlistSortDirection',
                default: 'asc',
                type: 'select',
                options: ['asc', 'desc'],
            },
        ],
    },
    {
        category: 'others',
        items: [],
    },
];
