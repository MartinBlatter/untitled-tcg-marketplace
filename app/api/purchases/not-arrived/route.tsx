import { and, sql } from 'drizzle-orm';

import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { ORDER_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderData, orderItemData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { buildOrderObject } from '@/src/utils/orders.helper';
import { desc, eq, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    const page = request.nextUrl.searchParams.get('page') || 1;
    const sellerName = request.nextUrl.searchParams.get('sellerName') || '';
    const minPrice = request.nextUrl.searchParams.get('minPrice') || '';
    const maxPrice = request.nextUrl.searchParams.get('maxPrice') || '';
    const createdAtStart = request.nextUrl.searchParams.get('createdAtStart') || '';
    const createdAtEnd = request.nextUrl.searchParams.get('createdAtEnd') || '';
    const itemName = request.nextUrl.searchParams.get('itemName') || '';
    const orderId = request.nextUrl.searchParams.get('orderId') || '';

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

    let conditions = [eq(orderData.buyerId, user.id), eq(orderData.status, ORDER_STATUS.PENDING), eq(orderData.shippingStatus, SHIPPING_STATUS.SHIPPED)];

    // Add filter conditions if they exist
    if (sellerName) {
        const sellerRow = await db
            .select()
            .from(profileData)
            .where(like(profileData.userName, `%${sellerName}%`));
        if (sellerRow.length > 0) {
            conditions.push(eq(orderData.sellerId, sellerRow[0].id));
        } else {
            return NextResponse.json({ orders: [], success: true, count: 0, sum: 0 });
        }
    }

    if (minPrice) {
        conditions.push(sql`${orderData.totalPrice} >= ${Number(minPrice)}`);
    }

    if (maxPrice) {
        conditions.push(sql`${orderData.totalPrice} <= ${Number(maxPrice)}`);
    }

    if (createdAtStart) {
        conditions.push(sql`${orderData.createdAt} >= ${createdAtStart}`);
    }

    if (createdAtEnd) {
        conditions.push(sql`${orderData.createdAt} <= ${createdAtEnd}`);
    }

    if (orderId) {
        conditions.push(eq(orderData.id, Number(orderId)));
    }

    // Handle itemName filter by joining with orderItemData
    let orders;

    if (itemName) {
        orders = await db
            .select({
                order: orderData,
            })
            .from(orderData)
            .leftJoin(orderItemData, eq(orderData.id, orderItemData.orderId))
            .where(and(...conditions, like(orderItemData.displayName, `%${itemName}%`)))
            .orderBy(desc(orderData.createdAt))
            .limit(ORDER_TABLE_ROWS_PER_PAGE)
            .offset((Number(page) - 1) * ORDER_TABLE_ROWS_PER_PAGE);
    } else {
        orders = await db
            .select({
                order: orderData,
            })
            .from(orderData)
            .where(and(...conditions))
            .orderBy(desc(orderData.createdAt))
            .limit(ORDER_TABLE_ROWS_PER_PAGE)
            .offset((Number(page) - 1) * ORDER_TABLE_ROWS_PER_PAGE);
    }

    const count = itemName
        ? await db
              .select({ count: sql<number>`count(*)` })
              .from(orderData)
              .leftJoin(orderItemData, eq(orderData.id, orderItemData.orderId))
              .where(and(...conditions, like(orderItemData.displayName, `%${itemName}%`)))
              .then((result) => result[0].count)
        : await db
              .select({ count: sql<number>`count(*)` })
              .from(orderData)
              .where(and(...conditions))
              .then((result) => result[0].count);

    const sumRow = itemName
        ? await db
              .select({ value: sql<number>`sum(${orderData.totalPrice})` })
              .from(orderData)
              .leftJoin(orderItemData, eq(orderData.id, orderItemData.orderId))
              .where(and(...conditions, like(orderItemData.displayName, `%${itemName}%`)))
        : await db
              .select({ value: sql<number>`sum(${orderData.totalPrice})` })
              .from(orderData)
              .where(and(...conditions));

    const formattedOrders = await Promise.all(
        orders.map(async ({ order }) => {
            const orderItems = await db.select().from(orderItemData).where(eq(orderItemData.orderId, order.id));
            return await buildOrderObject({
                ...order,
                orderItems: orderItems.map((item) => ({
                    ...item,
                    foreignKey: item.foreignKey ? Number(item.foreignKey) : null,
                    type: item.type ?? undefined,
                })),
            });
        })
    );

    return NextResponse.json({ count: count, orders: formattedOrders, success: true, sum: (Number(sumRow[0].value) ?? 0).toFixed(2) });
}
