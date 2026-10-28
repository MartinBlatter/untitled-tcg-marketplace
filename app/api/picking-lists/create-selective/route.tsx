import { PAYMENT_STATUS, SHIPPING_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderData, orderItemData } from '@/src/db/schema/order';
import { PicklistData, PicklistItemData } from '@/src/db/schema/pickinglists';
import { profileData } from '@/src/db/schema/user';
import { and, desc, eq, inArray, ne } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();
    const { orderIds } = body;

    if (!session) {
        return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    const userRow = await db
        .select()
        .from(profileData)
        .where(eq(profileData.eMail, session.user.email as string));

    if (!userRow || userRow.length === 0) {
        return NextResponse.json({ error: true, message: 'User not found' }, { status: 404 });
    }

    const user = userRow[0];

    // Check if order IDs were provided
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json({ error: true, message: 'No orders selected' }, { status: 400 });
    }

    // Verify the orders belong to this user and are in the correct state
    const orders = await db
        .select()
        .from(orderData)
        .where(and(eq(orderData.sellerId, user.id), eq(orderData.paymentStatus, PAYMENT_STATUS.PAID), eq(orderData.shippingStatus, SHIPPING_STATUS.PENDING), inArray(orderData.id, orderIds)));

    if (!orders || orders.length === 0) {
        return NextResponse.json({ error: true, message: 'No valid orders found' }, { status: 404 });
    }

    // Create a new picking list
    const newList = await db
        .insert(PicklistData)
        .values({
            userId: user.id,
        })
        .$returningId();

    const name = `Picking List ${newList[0].id}`;

    await db.update(PicklistData).set({ name }).where(eq(PicklistData.id, newList[0].id));

    // Get the created picklist
    const [newPicklist] = await db.select().from(PicklistData).where(eq(PicklistData.id, newList[0].id)).orderBy(desc(PicklistData.id)).limit(1);

    if (!newPicklist) {
        return NextResponse.json({ error: true, message: 'Failed to create picking list' }, { status: 500 });
    }

    // Get all order items for these orders
    const orderItems = await db
        .select()
        .from(orderItemData)
        .where(
            and(
                ne(orderItemData.game, 'shipping'),
                inArray(
                    orderItemData.orderId,
                    orders.map((o) => o.id)
                )
            )
        );

    // Create picking list items for each order item
    if (orderItems.length > 0) {
        await db.insert(PicklistItemData).values(
            orderItems.map((item) => ({
                picklistId: newPicklist.id,
                orderItemId: item.id,
            }))
        );
    }

    return NextResponse.json({ success: true, picklistId: newPicklist.id });
}
