import { and } from 'drizzle-orm';

import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { SHIPPING_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { buildOrderObject } from '@/src/utils/orders.helper';
import { desc, eq, like, sum } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '../../orders/types';

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    const page = request.nextUrl.searchParams.get('page') || 1;

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
        .where(and(eq(orderData.sellerId, user.id), like(orderData.shippingStatus, SHIPPING_STATUS.SHIPPED)))
        .limit(ORDER_TABLE_ROWS_PER_PAGE)
        .offset((Number(page) - 1) * ORDER_TABLE_ROWS_PER_PAGE)
        .orderBy(desc(orderData.createdAt));

    const count = await db.$count(orderData, and(eq(orderData.sellerId, user.id), like(orderData.shippingStatus, SHIPPING_STATUS.SHIPPED)));

    const sumRow = await db
        .select({ value: sum(orderData.totalPrice) })
        .from(orderData)
        .where(and(eq(orderData.sellerId, user.id), like(orderData.shippingStatus, SHIPPING_STATUS.SHIPPED)));

    const formattedOrders = await Promise.all(orders.map(async (order) => await buildOrderObject(order as Order)));

    // Filter out null orders (those with no items)
    const validOrders = formattedOrders.filter((order): order is NonNullable<typeof order> => order !== null);

    return NextResponse.json({ orders: validOrders, success: true, count, sum: (Number(sumRow[0].value) ?? 0).toFixed(2) });
}
