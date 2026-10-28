import { ORDER_STATUS, PAYMENT_STATUS } from "@/src/constants/status";
import db from "@/src/db/mysql";
import { orderData } from "@/src/db/schema/order";
import { payOrder } from "@/src/utils/cart.helper";
import { rejectUnauthorizedCron } from "@/src/utils/cron.auth";
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from "next/server";
import { Order } from "../../orders/types";

// The cron guard uses node:crypto.
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const unauthorized = rejectUnauthorizedCron(request);
    if (unauthorized) return unauthorized;

    const orders = await db.select()
        .from(orderData)
        .where(and(eq(orderData.status, ORDER_STATUS.PENDING), eq(orderData.paymentStatus, PAYMENT_STATUS.PENDING)));

    for (const order of orders) {
        await payOrder(order as Order);
    }

    return NextResponse.json({ success: true });
}
