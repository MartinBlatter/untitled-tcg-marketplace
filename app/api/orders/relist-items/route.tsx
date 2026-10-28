import { ORDER_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { inventoryData } from '@/src/db/schema/inventory';
import { orderData, orderItemData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { and, eq, ne, or } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();
    const orderId = body.orderId;

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
            { status: 400 }
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

    // Get the order and verify it's cancelled and belongs to this seller
    const order = await db
        .select()
        .from(orderData)
        .where(
            and(
                eq(orderData.id, orderId),
                eq(orderData.sellerId, user.id),
                or(eq(orderData.status, ORDER_STATUS.CANCELLED_BY_BUYER), eq(orderData.status, ORDER_STATUS.CANCELLED_BY_SELLER), eq(orderData.status, ORDER_STATUS.CANCELLED_BY_ADMIN))
            )
        );

    if (!order || order.length === 0) {
        return NextResponse.json(
            {
                error: true,
                message: 'Order not found or not cancelled',
            },
            { status: 404 }
        );
    }

    // Get all items from the order except shipping
    const items = await db
        .select()
        .from(orderItemData)
        .where(and(eq(orderItemData.orderId, orderId), ne(orderItemData.game, 'shipping')));

    try {
        // Create inventory entries for each item
        const inventoryEntries = items.map((item) => {
            const originalItem = JSON.parse(item.originalItem as string); // Parse the originalItem JSON string
            if (!originalItem) {
                // Fallback to basic data if no originalItem stored
                return {
                    userId: user.id,
                    foreignKey: item.foreignKey,
                    foreignKeySource: item.foreignKeySource,
                    quantity: item.quantity,
                    price: item.price,
                    displayName: item.displayName,
                    game: item.game,
                };
            }

            delete originalItem.id; // Remove id to avoid conflicts
            delete originalItem.createdAt; // Remove createdAt to avoid conflicts
            delete originalItem.updatedAt; // Remove updatedAt to avoid conflicts
            delete originalItem.deactivatedAt; // Remove deactivatedAt to avoid conflicts
            // Use stored originalItem data to recreate inventory item with all details
            return {
                ...originalItem,
                userId: user.id, // Update to current user
                quantity: item.quantity, // Use quantity from order
                price: item.price, // Use price from order
            };
        });

        await db.insert(inventoryData).values(inventoryEntries);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                error: true,
                message: 'Error relisting items',
            },
            { status: 500 }
        );
    }
}
