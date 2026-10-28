import { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import { tableMap } from '@/src/constants/tables';
import db from '@/src/db/mysql';
import { orderAddressData, orderData, orderItemData, orderShippingData } from '@/src/db/schema/order';
import { shoppingCartData, shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { addressData, profileData, profileSettingsData } from '@/src/db/schema/user';
import { validateItemAvailability } from '@/src/utils/cart.helper';
import { getCheapestShipping, validateShipping } from '@/src/utils/shipping.helper';
import { and, eq, sql } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json(
            {
                error: true,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    const userRow = await db
        .select()
        .from(profileData)
        .where(eq(profileData.eMail, session.user.email as string));

    if (!userRow) {
        return NextResponse.json(
            {
                error: true,
                message: 'User not found',
            },
            { status: 404 }
        );
    }

    const user = userRow[0];

    try {
        const cartRow = await db.select().from(shoppingCartData).where(eq(shoppingCartData.userId, user.id));
        const cart = cartRow[0];

        const items = await db.select().from(shoppingCartItemData).where(eq(shoppingCartItemData.cartId, cart.id));
        const itemsBySellerIds: { [key: string]: any[] } = {};
        const itemsArray = Array.isArray(items) ? items : [items];
        itemsArray.forEach((item: any) => {
            const sellerId = item.sellerId;
            if (!itemsBySellerIds[sellerId]) {
                itemsBySellerIds[sellerId] = [];
            }
            itemsBySellerIds[sellerId].push(item);
        });

        let address = user.address;
        const settingsRow = await db
            .select()
            .from(profileSettingsData)
            .where(and(eq(profileSettingsData.userId, user.id), eq(profileSettingsData.name, 'defaultAddress')));

        if (settingsRow.length > 0) {
            const defaultAddress = settingsRow[0].value;
            const addressRow = await db
                .select()
                .from(addressData)
                .where(eq(addressData.id, Number(defaultAddress)));
            address = addressRow[0].address;
        }

        for (const sellerId in itemsBySellerIds) {
            const items = itemsBySellerIds[sellerId];
            const itemsAreBuyable = await validateItemAvailability(items, user.country);

            if (!itemsAreBuyable) {
                return NextResponse.json({
                    error: true,
                    message: 'item_not_available',
                });
            }

            const totalPrice = items.reduce((acc: number, item: any) => acc + Number(item.price) * Number(item.quantity), 0);
            const shippingCartItem = items.filter((item: any) => item.game === 'shipping');

            const orderId = await insertOrderAndReturnId(user, items[0].game, sellerId, totalPrice);
            const orderShippingId = await insertOrderShippingAndReturnId(orderId, shippingCartItem[0].displayName, shippingCartItem[0].price, user, sellerId);
            const orderAddressId = await insertOrderAddressAndReturnId(orderId, address);
            await insertOrderItems(orderId, items);
        }

        await db.delete(shoppingCartData).where(eq(shoppingCartData.userId, user.id));
        await db.delete(shoppingCartItemData).where(eq(shoppingCartItemData.cartId, cart.id));

        return NextResponse.json({
            success: true,
            error: false,
            message: 'Orders placed successfully',
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: true,
                message: 'Error placing orders',
            },
            { status: 500 }
        );
    }
}

async function insertOrderItems(orderId: number, items: any) {
    // Track items to update/delete by table
    const tableUpdates: { [key: string]: { delete: number[]; update: { id: number; quantity: number }[] } } = {};
    const orderItems = await Promise.all(
        items.map(async (item: any) => {
            if (item.game === 'shipping') {
                return {
                    orderId: orderId,
                    foreignKey: item.sellerId,
                    foreignKeySource: 'sellerId',
                    quantity: item.quantity,
                    price: item.price,
                    displayName: item.displayName,
                    game: item.game,
                };
            }

            const sourceTable = `${item.game}.${item.foreignKeySource}`;
            const query = sql`SELECT * FROM ${tableMap[sourceTable]} WHERE id = ${item.foreignKey}`;
            const [inventoryItem] = await db.execute(query);

            if (!inventoryItem || (inventoryItem as any).length === 0) {
                return;
            }

            // Initialize table tracking if not exists
            if (!tableUpdates[sourceTable]) {
                tableUpdates[sourceTable] = { delete: [], update: [] };
            }

            // Track items for update/delete
            if ((inventoryItem as any)[0].quantity === item.quantity) {
                tableUpdates[sourceTable].delete.push(Number(item.foreignKey));
            } else if ((inventoryItem as any)[0].quantity > item.quantity) {
                tableUpdates[sourceTable].update.push({
                    id: Number(item.foreignKey),
                    quantity: item.quantity,
                });
            } else if ((inventoryItem as any)[0].quantity < item.quantity) {
                return;
            }

            return {
                orderId: orderId,
                foreignKey: (inventoryItem as any)[0].foreignKey,
                foreignKeySource: (inventoryItem as any)[0].foreignKeySource,
                quantity: item.quantity,
                price: item.price,
                displayName: item.displayName,
                game: item.game,
                originalItem: (inventoryItem as any)[0],
            };
        })
    );

    // Filter out undefined items (in case of errors)
    const validOrderItems = orderItems.filter((item) => item !== undefined);
    await db.insert(orderItemData).values(validOrderItems);

    // Build and execute SQL queries for each table
    for (const [sourceTable, operations] of Object.entries(tableUpdates)) {
        if (operations.delete.length > 0) {
            await db.execute(sql`DELETE FROM ${tableMap[sourceTable]} WHERE id IN (${sql.join(operations.delete, sql`, `)});`);
        }
        if (operations.update.length > 0) {
            for (const { id, quantity } of operations.update) {
                await db.execute(sql`UPDATE ${tableMap[sourceTable]} SET quantity = quantity - ${quantity} WHERE id = ${id};`);
            }
        }
    }
}

async function insertOrderAddressAndReturnId(orderId: number, address: string | null) {
    const orderAddress = {
        orderId: orderId,
        address: address,
    };

    const insertOrderAddress = await db.insert(orderAddressData).values(orderAddress).$returningId();

    return insertOrderAddress[0].id;
}

async function insertOrderShippingAndReturnId(orderId: number, displayName: string, price: number, user: any, sellerId: string) {
    const isValid = validateShipping(price, user, sellerId, displayName.includes('tracking') ? 1 : 0);

    if (!isValid) {
        const { price: cheapestPrice, displayName: cheapestDisplayName } = await getCheapestShipping(user, sellerId);
        price = cheapestPrice;
        displayName = cheapestDisplayName;
    }

    const shippingItem = {
        orderId: orderId,
        displayName: displayName,
        price: price,
        trackingNumber: null,
        tracking: displayName.includes('tracking') ? 1 : 0,
    };

    const insertShipping = await db.insert(orderShippingData).values(shippingItem).$returningId();

    return insertShipping[0].id;
}

async function insertOrderAndReturnId(user: any, game: string, sellerId: string, totalPrice: number) {
    const order = {
        buyerId: user.id,
        game: game,
        sellerId: Number(sellerId),
        status: ORDER_STATUS.NEW,
        paymentStatus: PAYMENT_STATUS.PENDING,
        shippingStatus: SHIPPING_STATUS.PENDING,
        totalPrice: totalPrice,
    };

    const insertOrder = await db.insert(orderData).values(order).$returningId();

    return insertOrder[0].id;
}
