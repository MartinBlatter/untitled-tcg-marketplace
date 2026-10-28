import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import { SHIPPING_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderData, orderItemData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { buildOrderObject } from '@/src/utils/orders.helper';
import { and, desc, eq, like, sql, sum } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '../../orders/types';

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    const email = session?.user.email;
    const page = request.nextUrl.searchParams.get('page') || 1;
    const buyerName = request.nextUrl.searchParams.get('buyerName') || '';
    const itemName = request.nextUrl.searchParams.get('itemName') || '';
    const minPrice = request.nextUrl.searchParams.get('minPrice') || '';
    const maxPrice = request.nextUrl.searchParams.get('maxPrice') || '';
    const createdAtStart = request.nextUrl.searchParams.get('createdAtStart') || '';
    const createdAtEnd = request.nextUrl.searchParams.get('createdAtEnd') || '';
    const orderId = request.nextUrl.searchParams.get('orderId') || '';

    if (!email) {
        return NextResponse.json(
            {
                error: true,
                message: 'Not logged in',
            },
            { status: 401 }
        );
    }

    const [userRow] = await db
        .select()
        .from(profileData)
        .where(like(profileData.eMail, email as string));

    if (!userRow) {
        return NextResponse.json(
            {
                error: true,
                message: 'User not found',
            },
            { status: 404 }
        );
    }

    const user = userRow;

    let conditions = [eq(orderData.sellerId, user.id), like(orderData.shippingStatus, SHIPPING_STATUS.DELIVERED)];

    if (buyerName) {
        const buyerRow = await db
            .select()
            .from(profileData)
            .where(like(profileData.userName, `%${buyerName}%`));
        if (buyerRow.length > 0) {
            conditions.push(eq(orderData.buyerId, buyerRow[0].id));
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

    let orders;
    if (itemName) {
        orders = await db
            .select()
            .from(orderData)
            .leftJoin(orderItemData, eq(orderData.id, orderItemData.orderId))
            .where(and(...conditions, like(orderItemData.displayName, `%${itemName}%`)))
            .orderBy(desc(orderData.createdAt))
            .limit(ORDER_TABLE_ROWS_PER_PAGE)
            .offset((Number(page) - 1) * ORDER_TABLE_ROWS_PER_PAGE);
    } else {
        orders = await db
            .select()
            .from(orderData)
            .where(and(...conditions))
            .limit(ORDER_TABLE_ROWS_PER_PAGE)
            .offset((Number(page) - 1) * ORDER_TABLE_ROWS_PER_PAGE)
            .orderBy(desc(orderData.createdAt));
    }

    const count = itemName
        ? await db
              .select({ count: sql`count(*)` })
              .from(orderData)
              .leftJoin(orderItemData, eq(orderData.id, orderItemData.orderId))
              .where(and(...conditions, like(orderItemData.displayName, `%${itemName}%`)))
              .then((result) => result[0].count)
        : await db.$count(orderData, and(...conditions));

    const sumRow = itemName
        ? await db
              .select({ value: sql`sum(${orderData.totalPrice})` })
              .from(orderData)
              .leftJoin(orderItemData, eq(orderData.id, orderItemData.orderId))
              .where(and(...conditions, like(orderItemData.displayName, `%${itemName}%`)))
        : await db
              .select({ value: sum(orderData.totalPrice) })
              .from(orderData)
              .where(and(...conditions));

    const formattedOrders = await Promise.all(orders.map(async (order) => await buildOrderObject(order as Order)));

    // Filter out null orders (those with no items)
    const validOrders = formattedOrders.filter((order): order is NonNullable<typeof order> => order !== null);

    return NextResponse.json({ orders: validOrders, success: true, count: count, sum: (Number(sumRow[0].value) ?? 0).toFixed(2) });
}
