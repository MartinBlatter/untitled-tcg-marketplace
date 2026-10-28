import { ORDER_STATUS, PAYMENT_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { payOrder } from '@/src/utils/cart.helper';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '../types';

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

    try {
        let res = false;
        if (body.orderId) {
            const order = await db
                .select()
                .from(orderData)
                .where(and(eq(orderData.id, body.orderId), eq(orderData.paymentStatus, PAYMENT_STATUS.PENDING)));
            res = await payOrder(order[0] as Order);
        } else {
            const orders = await db
                .select()
                .from(orderData)
                .where(and(eq(orderData.status, ORDER_STATUS.PENDING), eq(orderData.paymentStatus, PAYMENT_STATUS.PENDING), eq(orderData.buyerId, userRow[0].id)));

            for (const order of orders) {
                res = await payOrder(order as Order);
            }
        }

        return NextResponse.json({ success: true, paid: res });
    } catch (error) {
        return NextResponse.json(
            {
                error: true,
                message: 'Error paying',
            },
            { status: 500 }
        );
    }
}
