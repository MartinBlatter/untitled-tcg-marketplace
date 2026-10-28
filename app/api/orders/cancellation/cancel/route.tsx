import db from '@/src/db/mysql';
import { orderCancellationData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { and, eq } from 'drizzle-orm';
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

    await db.delete(orderCancellationData).where(and(eq(orderCancellationData.orderId, body.orderId), eq(orderCancellationData.requestedByUserId, userRow[0].id)));

    return NextResponse.json({ success: true }, { status: 200 });
}
