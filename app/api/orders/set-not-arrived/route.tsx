import { ORDER_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { fundsData, fundsHistoryData } from '@/src/db/schema/funds';
import { orderData, orderShippingData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { and, eq, sql } from 'drizzle-orm';
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

    // Check if order exists and when it was shipped
    const orderRow = await db
        .select()
        .from(orderData)
        .leftJoin(orderShippingData, eq(orderData.id, orderShippingData.orderId))
        .where(and(eq(orderData.id, orderId), eq(orderData.buyerId, user.id)));

    if (orderRow.length === 0) {
        return NextResponse.json(
            {
                error: true,
                message: 'Order not found',
            },
            { status: 404 }
        );
    }

    const order = orderRow[0].order;
    const shipping = orderRow[0].orderShipping;

    if (!order.shippedAt) {
        return NextResponse.json(
            {
                error: true,
                message: 'Order has not been shipped yet',
            },
            { status: 400 }
        );
    }

    // Calculate if 14 days have passed since shipping
    const shippedDate = new Date(order.shippedAt);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    if (shippedDate > fourteenDaysAgo) {
        return NextResponse.json(
            {
                error: true,
                message: 'Order must be shipped for at least 14 days before marking as not arrived',
            },
            { status: 400 }
        );
    }

    try {
        await db
            .update(orderData)
            .set({ shippingStatus: SHIPPING_STATUS.NOT_ARRIVED, arrivedAt: sql`NOW()`, status: ORDER_STATUS.FAILED })
            .where(and(eq(orderData.id, orderId), eq(orderData.buyerId, user.id)));

        if (shipping?.tracking === 1) {
            const buyerFunds = await db
                .select()
                .from(fundsData)
                .where(eq(fundsData.userId, order.buyerId ?? 0));

            await db
                .update(fundsData)
                .set({ funds: (Number(buyerFunds[0].funds) + Number(order.totalPrice)).toFixed(2) })
                .where(eq(fundsData.userId, order.sellerId ?? 0));
            await db.insert(fundsHistoryData).values([
                {
                    fundsId: buyerFunds[0].id,
                    amount: order.totalPrice?.toFixed(2),
                    type: 'refund',
                    addOrSub: 'add',
                    orderId: order.id,
                },
            ]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
