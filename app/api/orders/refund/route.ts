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

        // Check if order exists and belongs to the seller
        const orderRow = await db
            .select()
            .from(orderData)
            .where(and(eq(orderData.id, orderId), eq(orderData.sellerId, user.id)));

        if (!orderRow.length) {
            return NextResponse.json({ success: false, message: 'Order not found or does not belong to the seller' }, { status: 404 });
        }

        const order = orderRow[0];
        if (!order.sellerId || !order.buyerId || !order.totalPrice) {
            return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
        }

        if (amount > order.totalPrice) {
            return NextResponse.json({ success: false, message: 'Refund amount cannot exceed order total' }, { status: 400 });
        }

        // Get seller's funds
        const sellerFunds = await db
            .select()
            .from(fundsData)
            .where(eq(fundsData.userId, user.id));

        if (sellerFunds.length === 0) {
            await db.insert(fundsData).values({ userId: user.id, funds: '0' });
        }

        const currentFunds = Number(sellerFunds[0].funds || 0);
        if (currentFunds < amount) {
            return NextResponse.json({ success: false, message: 'Insufficient funds' }, { status: 400 });
        }

        // Update seller's funds
        await db
            .update(fundsData)
            .set({ funds: (currentFunds - amount).toFixed(2) })
            .where(eq(fundsData.userId, user.id));

        // Record the transaction in seller's funds history
        await db.insert(fundsHistoryData).values({
            fundsId: sellerFunds[0].id,
            amount: amount.toFixed(2),
            type: 'refund',
            addOrSub: 'sub',
            orderId: orderId,
        });

        // Get buyer's funds
        const buyerFunds = await db
            .select()
            .from(fundsData)
            .where(eq(fundsData.userId, order.buyerId));

        if (buyerFunds.length === 0) {
            await db.insert(fundsData).values({ userId: order.buyerId, funds: '0' });
        }

        // Update buyer's funds
        const currentBuyerFunds = Number(buyerFunds[0]?.funds || 0);
        await db
            .update(fundsData)
            .set({ funds: (currentBuyerFunds + amount).toFixed(2) })
            .where(eq(fundsData.userId, order.buyerId));

        // Record the transaction in buyer's funds history
        await db.insert(fundsHistoryData).values({
            fundsId: buyerFunds[0]?.id,
            amount: amount.toFixed(2),
            type: 'refund',
            addOrSub: 'add',
            orderId: orderId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing refund:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}