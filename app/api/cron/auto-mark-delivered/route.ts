import { ORDER_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { fundsData, fundsHistoryData } from '@/src/db/schema/funds';
import { orderData, orderShippingData } from '@/src/db/schema/order';
import { rejectUnauthorizedCron } from '@/src/utils/cron.auth';
import { and, eq, lt, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// The cron guard uses node:crypto.
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const unauthorized = rejectUnauthorizedCron(request);
    if (unauthorized) return unauthorized;

    try {
        // Get all orders that are shipped and older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await db.select()
            .from(orderData)
            .leftJoin(orderShippingData, eq(orderData.id, orderShippingData.orderId))
            .where(
                and(
                    eq(orderData.shippingStatus, SHIPPING_STATUS.SHIPPED),
                    lt(orderData.shippedAt as any, sql`${thirtyDaysAgo}`)
                )
            );

        for (const orderRow of orders) {
            const order = orderRow.order;
            const shipping = orderRow.orderShipping;

            // Update order status
            await db
                .update(orderData)
                .set({ 
                    shippingStatus: SHIPPING_STATUS.DELIVERED, 
                    status: ORDER_STATUS.DELIVERED,
                    arrivedAt: sql`CURRENT_TIMESTAMP`
                })
                .where(eq(orderData.id, order.id));

            // If order has tracking, add funds to seller
            if (shipping?.tracking === 1) {
                const sellerFunds = await db
                    .select()
                    .from(fundsData)
                    .where(eq(fundsData.userId, order.sellerId ?? 0));

                if (sellerFunds.length > 0) {
                    await db
                        .update(fundsData)
                        .set({ funds: (Number(sellerFunds[0].funds) + Number(order.totalPrice)).toFixed(2) })
                        .where(eq(fundsData.userId, order.sellerId ?? 0));

                    await db.insert(fundsHistoryData).values([
                        {
                            fundsId: sellerFunds[0].id,
                            amount: order.totalPrice?.toFixed(2),
                            type: 'sale',
                            addOrSub: 'add',
                            orderId: order.id,
                        },
                    ]);
                }
            }
        }

        return NextResponse.json({ 
            success: true,
            processedOrders: orders.length
        });

    } catch (error) {
        console.error('Error in auto-mark-delivered cron:', error);
        return NextResponse.json({ error: true }, { status: 500 });
    }
}