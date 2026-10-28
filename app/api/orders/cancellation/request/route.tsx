import { CANCELLATION_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderCancellationData, orderData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { and, eq, or } from 'drizzle-orm';
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
        return NextResponse.json({ error: true, message: 'Order not found' }, { status: 404 });
    }

    await db.insert(orderCancellationData).values({
        orderId: body.orderId,
        message: body.message,
        status: CANCELLATION_STATUS.REQUESTED,
        requestedByUserId: user.id,
    });

    return NextResponse.json({ success: true }, { status: 200 });
}
