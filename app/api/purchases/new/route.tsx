import { and } from 'drizzle-orm';

import { ORDER_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { payOrder } from '@/src/utils/cart.helper';
import { buildOrderObject } from '@/src/utils/orders.helper';
import { eq, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '../../orders/types';

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

    const orders = await db
        .select()
        .from(orderData)
        .where(and(eq(orderData.buyerId, user.id), like(orderData.status, ORDER_STATUS.NEW)));

    // Update status to PROCESSING for all fetched new orders
    if (orders.length > 0) {
        await db
            .update(orderData)
            .set({ status: ORDER_STATUS.PENDING })
            .where(and(eq(orderData.buyerId, user.id), like(orderData.status, ORDER_STATUS.NEW)));
    }

    for (const order of orders) {
        await payOrder(order as Order);
    }

    const formattedOrders = await Promise.all(
        orders.map(async (order) => {
            // Cast the order to include required properties
            const fullOrder: Order = {
                ...order,
                orderItems: [],
            };
            return await buildOrderObject(fullOrder);
        })
    );

    return NextResponse.json({ orders: formattedOrders, success: true });
}
