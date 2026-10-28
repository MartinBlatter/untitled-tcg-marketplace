import { SHIPPING_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { setShipped } from '@/src/utils/orders.helper';
import { and, eq, or } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();
    const orderId = body.orderId;
    const status = body.status;

    if (!session) {
        return NextResponse.json(
            {
                error: true,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    if (!orderId || !status) {
        return NextResponse.json(
            {
                error: true,
                message: 'Missing required fields',
            },
            { status: 500 }
        );
    }

    if (
        status !== SHIPPING_STATUS.PENDING &&
        status !== SHIPPING_STATUS.PACKED &&
        status !== SHIPPING_STATUS.SHIPPED &&
        status !== SHIPPING_STATUS.DELIVERED &&
        status !== SHIPPING_STATUS.NOT_ARRIVED
    ) {
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
        if (status === SHIPPING_STATUS.PACKED || status === SHIPPING_STATUS.SHIPPED) {
            await db
                .update(orderData)
                .set({ shippingStatus: status })
                .where(and(eq(orderData.id, orderId), or(eq(orderData.sellerId, user.id))));

            if (status === SHIPPING_STATUS.SHIPPED) {
                await setShipped(orderId, user.id);
            }
        } else if (status === SHIPPING_STATUS.DELIVERED || status === SHIPPING_STATUS.NOT_ARRIVED) {
            await db
                .update(orderData)
                .set({ shippingStatus: status })
                .where(and(eq(orderData.id, orderId), or(eq(orderData.buyerId, user.id))));
        } else {
            await db
                .update(orderData)
                .set({ shippingStatus: status })
                .where(and(eq(orderData.id, orderId), or(eq(orderData.sellerId, user.id), eq(orderData.buyerId, user.id))));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
