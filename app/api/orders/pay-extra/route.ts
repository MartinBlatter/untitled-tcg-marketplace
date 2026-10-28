import db from '@/src/db/mysql';
import { fundsData, fundsHistoryData } from '@/src/db/schema/funds';
import { orderData } from '@/src/db/schema/order';

import { profileData } from '@/src/db/schema/user';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

    try {
        const { orderId, amount } = await request.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
        }

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Check if order exists and belongs to the user
        const orderRow = await db
            .select()
            .from(orderData)
            .where(and(eq(orderData.id, orderId), eq(orderData.buyerId, user.id)));

        if (!orderRow.length) {
            return NextResponse.json({ success: false, message: 'Order not found or does not belong to the user' }, { status: 404 });
        }

        const order = orderRow[0];
        if (!order.sellerId || !order.buyerId) {
            return NextResponse.json({ success: false, message: 'Invalid seller ID or buyer ID' }, { status: 400 });
        }

        // Get user's funds
        const buyerFunds = await db
            .select()
            .from(fundsData)
            .where(eq(fundsData.userId, user.id));

        if (buyerFunds.length === 0) {
            await db.insert(fundsData).values({ userId: user.id, funds: '0' });
            return NextResponse.json({ success: false, message: 'Insufficient funds' }, { status: 400 });
        }

        const currentFunds = Number(buyerFunds[0].funds || 0);
        if (currentFunds < amount) {
            return NextResponse.json({ success: false, message: 'Insufficient funds' }, { status: 400 });
        }

        // Update user's funds
        await db
            .update(fundsData)
            .set({ funds: (currentFunds - amount).toFixed(2) })
            .where(eq(fundsData.userId, user.id));

        // Record the transaction in funds history
        await db.insert(fundsHistoryData).values({
            fundsId: buyerFunds[0].id,
            amount: amount.toFixed(2),
            type: 'extra_payment',
            addOrSub: 'sub',
            orderId: orderId,
        });

        // update seller's funds
        const sellerFunds = await db
            .select()
            .from(fundsData)
            .where(eq(fundsData.userId, order.sellerId));

        if (sellerFunds.length === 0) {
            await db.insert(fundsData).values({ userId: order.sellerId, funds: '0' });
        }

        const currentSellerFunds = Number(sellerFunds[0].funds || 0);
        await db
            .update(fundsData)
            .set({ funds: (currentSellerFunds + amount).toFixed(2) })
            .where(eq(fundsData.userId, order.sellerId));

        // Record the transaction in funds history
        await db.insert(fundsHistoryData).values({
            fundsId: sellerFunds[0].id,
            amount: amount.toFixed(2),
            type: 'extra_payment',
            addOrSub: 'add',
            orderId: orderId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing extra payment:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}