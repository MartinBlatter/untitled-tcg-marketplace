import { CANCELLATION_STATUS, ORDER_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { fundsData, fundsHistoryData } from '@/src/db/schema/funds';
import { orderCancellationData, orderData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { and, eq, ne, or, sql } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();

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
    const order = await db
        .select()
        .from(orderData)
        .where(and(eq(orderData.id, body.orderId), or(eq(orderData.buyerId, user.id), eq(orderData.sellerId, user.id))));

    if (!order) {
        return NextResponse.json(
            {
                error: true,
                message: 'Order not found',
            },
            { status: 404 }
        );
    }

    await db
        .update(orderCancellationData)
        .set({
            status: CANCELLATION_STATUS.ACCEPTED,
            acceptedAt: new Date(),
        })
        .where(and(eq(orderCancellationData.orderId, body.orderId), ne(orderCancellationData.requestedByUserId, userRow[0].id)));

    let newStatus = ORDER_STATUS.CANCELLED_BY_ADMIN;
    // buyer is accepting so it was requested by seller
    if (order[0].buyerId === user.id) newStatus = ORDER_STATUS.CANCELLED_BY_SELLER;
    // seller is accepting so it was requested by buyer
    if (order[0].sellerId === user.id) newStatus = ORDER_STATUS.CANCELLED_BY_BUYER;

    await db
        .update(orderData)
        .set({
            status: newStatus,
            cancelledAt: new Date(),
        })
        .where(eq(orderData.id, body.orderId));

    await db
        .update(fundsData)
        .set({ funds: sql`funds + ${order[0].totalPrice}` })
        .where(eq(fundsData.userId, Number(order[0].buyerId)));

    const buyerFunds = await db
        .select()
        .from(fundsData)
        .where(eq(fundsData.userId, Number(order[0].buyerId)));

    await db.insert(fundsHistoryData).values({
        fundsId: buyerFunds[0].id,
        amount: (order[0].totalPrice as Number).toFixed(2),
        type: 'refund',
        addOrSub: 'add',
        orderId: order[0].id,
    });

    return NextResponse.json({ success: true }, { status: 200 });
}
