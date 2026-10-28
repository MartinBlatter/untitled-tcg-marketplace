import { ShippingData } from '@/app/api/shipping/[id]/types';
import { and, asc, eq, inArray, like, ne } from 'drizzle-orm';
import { shipping, SHIPPING_LETTER_VALUE_LIMIT, SHIPPING_PACKAGING_COST, SHIPPING_PACKAGING_WEIGHT, SHIPPING_SINGLE_CARD_WEIGHT, SHIPPING_TRACKING_LIMIT } from '../constants/shipping';
import db from '../db/mysql';
import { inventoryData } from '../db/schema/inventory';
import { shoppingCartData, shoppingCartItemData } from '../db/schema/shoppingcart';
import { customShippingData, profileData, profileSettingsData } from '../db/schema/user';

export async function calculateCartShippingCosts(cartId: number, buyerCountry: string | null) {
    const rows = await db
        .select()
        .from(shoppingCartItemData)
        .leftJoin(inventoryData, eq(inventoryData.id, shoppingCartItemData.foreignKey))
        .leftJoin(profileData, eq(profileData.id, inventoryData.userId))
        .where(and(eq(shoppingCartItemData.cartId, cartId), ne(shoppingCartItemData.game, 'shipping')));
    await db.delete(shoppingCartItemData).where(and(eq(shoppingCartItemData.game, 'shipping'), eq(shoppingCartItemData.cartId, cartId)));

    const [ItemsGroupedBySellerIdAndCountryAndTypeWithDefaultShipping, ItemsGroupedBySellerIdAndCountryAndTypeWithCustomShipping] = await groupBySellerIdAndCountryAndType(rows);
    const pricesByUser = await calculatePriceByUserWithDefaultShipping(ItemsGroupedBySellerIdAndCountryAndTypeWithDefaultShipping, buyerCountry);
    const pricesByUserWithCustomShipping = await calculatePriceByUserWithCustomShipping(ItemsGroupedBySellerIdAndCountryAndTypeWithCustomShipping, buyerCountry);

    for (const [userId, value] of Object.entries(pricesByUser)) {
        const price = Number((value as { price: any }).price).toFixed(2);
        const displayName = (value as { displayName: string }).displayName;
        await db.insert(shoppingCartItemData).values({
            cartId: cartId,
            status: 'pending',
            game: 'shipping',
            foreignKeySource: 'sellerId',
            foreignKey: userId,
            quantity: 1,
            price: price.toString(),
            displayName: displayName,
            sellerId: Number(userId),
        });
    }
    for (const [userId, value] of Object.entries(pricesByUserWithCustomShipping)) {
        const price = Number((value as { price: any }).price).toFixed(2);
        const displayName = (value as { displayName: string }).displayName;
        await db.insert(shoppingCartItemData).values({
            cartId: cartId,
            status: 'pending',
            game: 'shipping',
            foreignKeySource: 'sellerId',
            foreignKey: userId,
            quantity: 1,
            price: price.toString(),
            displayName: displayName,
            sellerId: Number(userId),
        });
    }
}

export async function getCheapestShipping(user: any, sellerId: string) {
    const cartRows = await db.select().from(shoppingCartData).where(eq(shoppingCartData.userId, user.id));
    const cartId = cartRows[0].id;

    const rows = await db
        .select()
        .from(shoppingCartItemData)
        .leftJoin(inventoryData, eq(inventoryData.id, shoppingCartItemData.foreignKey))
        .leftJoin(profileData, eq(profileData.id, inventoryData.userId))
        .where(and(eq(shoppingCartItemData.cartId, cartId), ne(shoppingCartItemData.game, 'shipping'), eq(shoppingCartItemData.sellerId, Number(sellerId))));

    const [ItemsGroupedBySellerIdAndCountryAndTypeWithDefaultShipping, ItemsGroupedBySellerIdAndCountryAndTypeWithCustomShipping] = await groupBySellerIdAndCountryAndType(rows);
    const pricesByUser = await calculatePriceByUserWithDefaultShipping(ItemsGroupedBySellerIdAndCountryAndTypeWithDefaultShipping, user.country);
    const pricesByUserWithCustomShipping = await calculatePriceByUserWithCustomShipping(ItemsGroupedBySellerIdAndCountryAndTypeWithCustomShipping, user.country);

    let price = null;
    let displayName = '';
    for (const [userId, value] of Object.entries(pricesByUser)) {
        price = Number((value as { price: any }).price).toFixed(2);
        displayName = (value as { displayName: string }).displayName;
    }
    for (const [userId, value] of Object.entries(pricesByUserWithCustomShipping)) {
        price = Number((value as { price: any }).price).toFixed(2);
        displayName = (value as { displayName: string }).displayName;
    }

    return { price: Number(price), displayName: displayName };
}

async function groupBySellerIdAndCountryAndType(array: any) {
    const groupedItemsCustom: any = {};
    const groupedItems: any = {};
    const userIds: any[] = [];
    array.forEach((item: any) => {
        const userId = item['mtg.inventory'].userId;
        userIds.push(userId);
        const country = item['profiledata'].country;
        const type = item['mtg.inventory'].type;

        if (!groupedItems[userId]) {
            groupedItems[userId] = {};
            groupedItems[userId][country] = {};
        }
        if (!groupedItems[userId][country][type]) {
            groupedItems[userId][country][type] = [];
        }
        groupedItems[userId][country][type].push(item.shoppingCartItems);
    });

    const rows = await db
        .select()
        .from(profileSettingsData)
        .where(and(eq(profileSettingsData.value, 'true'), eq(profileSettingsData.name, 'customShipping'), inArray(profileSettingsData.userId, userIds)));

    rows.forEach((row: any) => {
        const userId = row.userId;
        if (inArray(userId, Object.keys(groupedItems))) {
            groupedItemsCustom[userId] = groupedItems[userId];
            delete groupedItems[userId];
        }
    });
    const groupedItemsDefault = groupedItems;
    return [groupedItemsDefault, groupedItemsCustom];
}

async function calculatePriceByUserWithDefaultShipping(ItemsGroupedBySellerIdAndCountryAndType: any, buyerCountry: string | null) {
    const pricesByUser: any = {};

    for (const userId of Object.keys(ItemsGroupedBySellerIdAndCountryAndType)) {
        const countries = Object.keys(ItemsGroupedBySellerIdAndCountryAndType[userId]);
        const sellerCountry = countries[0];
        const ItemsByTypes = ItemsGroupedBySellerIdAndCountryAndType[userId][sellerCountry];

        const settings = await db
            .select()
            .from(profileSettingsData)
            .where(and(eq(profileSettingsData.userId, Number(userId)), eq(profileSettingsData.name, 'insuredShippingMandatory')));

        let insuredShippingMandatory = false;
        if (settings.length > 0) {
            insuredShippingMandatory = settings[0].value === 'true';
        }

        let weight: number = SHIPPING_PACKAGING_WEIGHT;
        let totalValue = 0;
        Object.keys(ItemsByTypes).forEach((type) => {
            const items = ItemsByTypes[type];
            items.forEach((item: any) => {
                if (type === 'single') {
                    weight += SHIPPING_SINGLE_CARD_WEIGHT * (item.quantity as number);
                    totalValue += (item.quantity as number) * (item.price as number);
                }
            });
        });

        let shippingPrices: any;
        const shippingRange = buyerCountry === sellerCountry ? 'domestic' : 'international';
        if (buyerCountry === sellerCountry) {
            shippingPrices = shipping[sellerCountry as keyof typeof shipping].domestic;
        } else {
            shippingPrices = shipping[sellerCountry as keyof typeof shipping].international;
        }

        let added = 0;

        let shippingPricesToUse = shippingPrices.letter;
        let shippingType = 'letter';
        if (totalValue > SHIPPING_LETTER_VALUE_LIMIT) {
            shippingPricesToUse = shippingPrices.package;
            shippingType = 'package';
        }

        let trackingHint = '';
        Object.entries(shippingPricesToUse).forEach(([key, value]) => {
            if (weight <= (key as unknown as number) && added === 0) {
                added = 1;
                let price: number = value as number;
                if ((totalValue < SHIPPING_LETTER_VALUE_LIMIT && totalValue >= SHIPPING_TRACKING_LIMIT) || insuredShippingMandatory) {
                    price += shippingPrices.tracking;
                    trackingHint = ' with tracking';
                }
                price += SHIPPING_PACKAGING_COST as number;
                pricesByUser[userId] = { price: price / 100, displayName: `${shippingRange} - ${shippingType}${trackingHint} - ${(price / 100).toFixed(2)}€` };
            }
        });
    }

    return pricesByUser;
}

export async function getUserCustomShippingPrices(userId: number, type: 'domestic' | 'international') {
    const rows = await db
        .select()
        .from(customShippingData)
        .where(and(eq(customShippingData.userId, userId), eq(customShippingData.range, type)))
        .orderBy(asc(customShippingData.price));
    return rows;
}

async function calculatePriceByUserWithCustomShipping(ItemsGroupedBySellerIdAndCountryAndType: any, buyerCountry: string | null) {
    const pricesByUser: any = {};

    for (const userId of Object.keys(ItemsGroupedBySellerIdAndCountryAndType)) {
        const countries = Object.keys(ItemsGroupedBySellerIdAndCountryAndType[userId]);
        const sellerCountry = countries[0];
        const ItemsByTypes = ItemsGroupedBySellerIdAndCountryAndType[userId][sellerCountry];

        const settings = await db
            .select()
            .from(profileSettingsData)
            .where(and(eq(profileSettingsData.userId, Number(userId)), eq(profileSettingsData.name, 'insuredShippingMandatory')));

        let insuredShippingMandatory = false;
        if (settings.length > 0) {
            insuredShippingMandatory = settings[0].value === 'true';
        }

        let weight: number = SHIPPING_PACKAGING_WEIGHT;
        let totalValue = 0;
        let numberOfCards = 0;
        Object.keys(ItemsByTypes).forEach((type) => {
            const items = ItemsByTypes[type];
            items.forEach((item: any) => {
                if (type === 'single') {
                    weight += SHIPPING_SINGLE_CARD_WEIGHT * (item.quantity as number);
                    totalValue += (item.quantity as number) * (item.price as number);
                    numberOfCards += item.quantity as number;
                }
            });
        });

        let shippingPrices: any;
        let shippingRange = buyerCountry === sellerCountry ? 'domestic' : 'international';
        if (buyerCountry === sellerCountry) {
            shippingPrices = await getUserCustomShippingPrices(Number(userId), 'domestic');
        } else {
            shippingPrices = await getUserCustomShippingPrices(Number(userId), 'international');
        }

        let selectedPrice = null;
        let shippingType = 'letter';
        // Find cheapest matching price
        for (const price of shippingPrices) {
            if (weight <= price.weight && totalValue <= price.maxValue && numberOfCards <= price.cards) {
                selectedPrice = price;
                shippingType = price.type;
                break;
            }
        }
        // If no matching price found, use most expensive
        if (!selectedPrice && shippingPrices.length > 0) {
            selectedPrice = shippingPrices[shippingPrices.length - 1]; // Last one is most expensive due to ASC ordering
        }

        if (selectedPrice) {
            let price = selectedPrice.price + SHIPPING_PACKAGING_COST / 100;
            if (totalValue >= SHIPPING_TRACKING_LIMIT || insuredShippingMandatory) {
                price += selectedPrice.tracking;
                pricesByUser[userId] = {
                    price: price.toFixed(2),
                    displayName: `${shippingRange} - ${shippingType} with tracking - ${price.toFixed(2)}€`,
                };
            } else {
                pricesByUser[userId] = {
                    price: price.toFixed(2),
                    displayName: `${shippingRange} - ${shippingType} - ${price.toFixed(2)}€`,
                };
            }
        }
    }

    return pricesByUser;
}

export async function getAvailableShippingShippingDataForUserShoppingCartOrder(user: any, id: string) {
    let shippingData: ShippingData[] = [];

    const seller = await db
        .select()
        .from(profileData)
        .where(like(profileData.id, id as string));

    const isDomestic = seller[0].country === user.country;

    const setting = await db
        .select()
        .from(profileSettingsData)
        .where(and(eq(profileSettingsData.value, 'true'), eq(profileSettingsData.name, 'customShipping'), like(profileSettingsData.userId, id)));

    const isCustomShipping = setting.length > 0;

    let shippingPrices = null;
    let customShippingPrices = null;
    if (!isCustomShipping) {
        shippingPrices = shipping[seller[0].country as keyof typeof shipping][isDomestic ? 'domestic' : 'international'];
    } else {
        customShippingPrices = await db
            .select()
            .from(customShippingData)
            .where(and(like(customShippingData.userId, id), like(customShippingData.range, isDomestic ? 'domestic' : 'international')));
    }

    const cart = await db.select().from(shoppingCartData).where(eq(shoppingCartData.userId, user.id));

    const cartItems = await db
        .select()
        .from(shoppingCartItemData)
        .where(and(eq(shoppingCartItemData.cartId, cart[0].id), eq(shoppingCartItemData.sellerId, Number(id)), ne(shoppingCartItemData.game, 'shipping')));

    const totalWeight = SHIPPING_PACKAGING_WEIGHT + cartItems.reduce((acc, item) => acc + (item.quantity ?? 0) * SHIPPING_SINGLE_CARD_WEIGHT, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.quantity ?? 0) * (Number(item.price) ?? 0), 0);
    const totalCards = cartItems.filter((item) => item.game !== 'shipping').reduce((acc, item) => acc + (item.quantity ?? 0), 0);

    let requiresTracking = totalPrice > SHIPPING_TRACKING_LIMIT;

    const sellerRequiresTrackingRow = await db
        .select()
        .from(profileSettingsData)
        .where(and(like(profileSettingsData.userId, id), like(profileSettingsData.name, 'insuredShippingMandatory'), eq(profileSettingsData.value, 'true')));

    if (sellerRequiresTrackingRow.length > 0) {
        requiresTracking = sellerRequiresTrackingRow[0].value === 'true';
    }

    if (isCustomShipping && customShippingPrices) {
        customShippingPrices.map((price) => {
            if (price.weight && price.weight >= totalWeight && price.maxValue && price.maxValue >= totalPrice && price.cards && price.cards >= totalCards) {
                shippingData.push({
                    type: price.type ?? '',
                    weight: price.weight ?? 0,
                    price: price.price ?? 0,
                    tracking: price.tracking ?? 0,
                });
            }
        });
    } else {
        if (shippingPrices && 'letter' in shippingPrices && 'package' in shippingPrices) {
            // Handle letter prices
            Object.entries(shippingPrices.letter).forEach(([weight, price]) => {
                if (Number(weight) >= totalWeight) {
                    shippingData.push({
                        type: 'letter',
                        weight: Number(weight),
                        price: Number((Number(price) / 100).toFixed(2)),
                        tracking: Number((Number(shippingPrices.tracking) / 100).toFixed(2)),
                    });
                }
            });
            // Handle package prices
            Object.entries(shippingPrices.package).forEach(([weight, price]) => {
                if (Number(weight) >= totalWeight) {
                    shippingData.push({
                        type: 'package',
                        weight: Number(weight),
                        price: Number((Number(price) / 100).toFixed(2)),
                        tracking: Number((Number(shippingPrices.tracking) / 100).toFixed(2)),
                    });
                }
            });
        }
    }

    return { requiresTracking: requiresTracking, shippingData: shippingData };
}

export async function validateShipping(price: number, user: any, sellerId: string, tracking: number) {
    const { requiresTracking, shippingData } = await getAvailableShippingShippingDataForUserShoppingCartOrder(user, sellerId);

    let existingPrice = null;
    if (tracking || requiresTracking) {
        existingPrice = shippingData.find((shipping) => Number((shipping.price ?? 0) + (shipping.tracking ?? 0) + SHIPPING_PACKAGING_COST / 100) === Number(price));
    } else {
        existingPrice = shippingData.find((shipping) => Number(shipping.price ?? 0 + SHIPPING_PACKAGING_COST / 100) === Number(price));
    }

    if (!existingPrice) {
        return false;
    }

    return true;
}
