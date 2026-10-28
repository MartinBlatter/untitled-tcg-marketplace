import { ORDER_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { fundsData, fundsHistoryData } from '@/src/db/schema/funds';
import { inventoryData } from '@/src/db/schema/inventory';
import { orderData, orderItemData, orderShippingData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { and, eq, ne, sql } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();
    const orderId = body.orderId;
    const date = body.date;
    const addToInventory = body.addToInventory;

    if (!session) {
        return NextResponse.json(
            {
                error: true,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    if (!orderId) {
        return NextResponse.json(
            {
                error: true,
                message: 'Missing required fields',
            },
            { status: 500 }
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
        await db
            .update(orderData)
            .set({ shippingStatus: SHIPPING_STATUS.DELIVERED, arrivedAt: sql`${date}`, status: ORDER_STATUS.DELIVERED })
            .where(and(eq(orderData.id, orderId), eq(orderData.buyerId, user.id)));

        const orderRow = await db.select().from(orderData).leftJoin(orderShippingData, eq(orderData.id, orderShippingData.orderId)).where(eq(orderData.id, orderId));

        if (orderRow.length > 0) {
            const order = orderRow[0].order;
            const shipping = orderRow[0].orderShipping;

            if (shipping?.tracking === 1) {
                const sellerFunds = await db
                    .select()
                    .from(fundsData)
                    .where(eq(fundsData.userId, order.sellerId ?? 0));

                await db
                    .update(fundsData)
                    .set({ funds: (Number(sellerFunds[0].funds) + Number(order.totalPrice)).toFixed(2) })
                    .where(eq(fundsData.userId, order.sellerId ?? 0));
                await db.insert(fundsHistoryData).values([
                    {
                        fundsId: sellerFunds[0].id,
                        amount: order.totalPrice?.toFixed(2),
                        type: 'sale',
                        addOrSub: 'add',
                        orderId: order.id,
                    },
                ]);
            }

            if (addToInventory) {
                // Get order items for this order
                const orderItems = await db
                    .select()
                    .from(orderItemData)
                    .where(and(eq(orderItemData.orderId, orderId), ne(orderItemData.game, 'shipping')));

                // Prepare inventory items from original items
                const inventoryItems = orderItems
                    .filter((item) => item && item.originalItem)
                    .map((item) => {
                        // We know orderItem is not null because of the filter
                        const originalItem = JSON.parse(item.originalItem as string);
                        delete originalItem.id; // Remove the ID to avoid conflicts
                        delete originalItem.updatedAt; // Remove the updatedAt to avoid conflicts
                        delete originalItem.createdAt; // Remove the createdAt to avoid conflicts
                        delete originalItem.deactivatedAt;

                        return {
                            ...originalItem,
                            userId: user.id, // Set the new owner
                            quantity: item.quantity,
                            isListed: 0, // Reset listing status
                        };
                    });

                if (inventoryItems.length > 0) {
                    await db.insert(inventoryData).values(inventoryItems);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
