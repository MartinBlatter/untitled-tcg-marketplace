import * as R from 'ramda';
import { CardSet } from '../types/AllMTGJSONTypes';

export default function formatEditionNameForIcon(edition: string) {
    return edition.replace(/\s/g, '_').toLowerCase();
}

export function formatStringForUrl(str: string) {
    if (!str) return '';
    return str.replace(/[^a-zA-Z]/g, '-').toLowerCase();
}

export function buildUrl(baseUrl: string, params: any): string {
    const queryParts = getQueryParts(params);

    return `${baseUrl}?${queryParts.join('&')}`;
}

export type FilterQueryParams = {
    name?: string;
    quality?: string;
    language?: string[];
    set?: string[];
    rarity?: string[];
    minPrice?: string;
    maxPrice?: string;
    isFoil?: string;
    isSigned?: string;
    isAltered?: string;
    isMisprint?: string;
    isGraded?: string;
    comment?: string;
    internalComment?: string;
    quantity?: string;
};

export function getQueryParts(params: any) {
    const queryParts: string[] = [];

    for (const key in params) {
        const value = params[key as keyof FilterQueryParams];

        if (value !== undefined && value !== '' && value !== null) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`);
                }
            } else {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }
    }

    return queryParts;
}

export function getAutocompleteMultipleOptionsObjects(values: string, names: any, anyString: string, addValueInName: boolean = false) {
    const options: any = [];
    values.split(',').map((value: string) => {
        if (value === '%') {
            options.push({ code: '%', name: anyString });
        } else {
            options.push({
                code: value,
                name: addValueInName ? names[value as keyof typeof names] + ` (${value})` : names[value as keyof typeof names],
            });
        }
    });
    return options;
}

export function getImageHint(card: CardSet) {
    if (card.finishes && card.finishes?.indexOf('etched') !== -1) return 'imageHints.etched';

    if (card.promoTypes) {
        if (card.promoTypes?.indexOf('textured') !== -1) return 'imageHints.textured';
        if (card.promoTypes?.indexOf('surgefoil') !== -1) return 'imageHints.surgefoil';
        if (card.promoTypes?.indexOf('confettifoil') !== -1) return 'imageHints.confettifoil';
        if (card.promoTypes?.indexOf('datestamped') !== -1) return 'imageHints.datestamped';
        if (card.promoTypes?.indexOf('doubleexposure') !== -1) return 'imageHints.doubleexposure';
        if (card.promoTypes?.indexOf('doublerainbow') !== -1) return 'imageHints.doublerainbow';
        if (card.promoTypes?.indexOf('embossed') !== -1) return 'imageHints.embossed';
        if (card.promoTypes?.indexOf('fracturefoil') !== -1) return 'imageHints.fracturefoil';
        if (card.promoTypes?.indexOf('galaxyfoil') !== -1) return 'imageHints.galaxyfoil';
        if (card.promoTypes?.indexOf('gilded') !== -1) return 'imageHints.gilded';
        if (card.promoTypes?.indexOf('glossy') !== -1) return 'imageHints.glossy';
        if (card.promoTypes?.indexOf('halofoil') !== -1) return 'imageHints.halofoil';
        if (card.promoTypes?.indexOf('invisibleink') !== -1) return 'imageHints.invisibleink';
        if (card.promoTypes?.indexOf('magnified') !== -1) return 'imageHints.magnified';
        if (card.promoTypes?.indexOf('manafoil') !== -1) return 'imageHints.manafoil';
        if (card.promoTypes?.indexOf('oilslick') !== -1) return 'imageHints.oilslick';
        if (card.promoTypes?.indexOf('rainbowfoil') !== -1) return 'imageHints.rainbowfoil';
        if (card.promoTypes?.indexOf('raisedfoil') !== -1) return 'imageHints.raisedfoil';
        if (card.promoTypes?.indexOf('ripplefoil') !== -1) return 'imageHints.ripplefoil';
        if (card.promoTypes?.indexOf('serialized') !== -1) return 'imageHints.serialized';
        if (card.promoTypes?.indexOf('silverfoil') !== -1) return 'imageHints.silverfoil';
        if (card.promoTypes?.indexOf('stamped') !== -1) return 'imageHints.stamped';
        if (card.promoTypes?.indexOf('stepandcompleat') !== -1) return 'imageHints.stepandcompleat';
    }

    return null;
}

export function groupBy(list: any, keyGetter: any) {
    const map = new Map();
    list.forEach((item: any) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

export function splitTrimUniqArray(arr: { value: string | null }[]) {
    const result: string[] = [];

    arr.forEach((element) => {
        const splitElements = element.value?.split(',');
        splitElements?.forEach((splitElement) => {
            splitElement !== '' && result.push(R.trim(splitElement));
        });
    });

    return R.uniq(result).sort();
}

export function formatCurrency(price: number) {
    const string = String(parseFloat(price as unknown as string).toFixed(2));
    return `${string.replace('.', ',').replace(/\d(?=(\d{3})+\.)/g, '$&.')} €`;
}

/**
 * Format a JavaScript Date object to a MySQL compatible date string (YYYY-MM-DD HH:MM:SS)
 * @param date - The date to format
 * @returns Formatted date string for SQL queries
 */
export function dateToSqlFormat(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function buildProductLink(game: string, setCode: string, product: string, name: string, uuid: string) {
    return `/${game}/${setCode}/products/${product}/${formatStringForUrl(name)}?uuid=${uuid}`;
}
