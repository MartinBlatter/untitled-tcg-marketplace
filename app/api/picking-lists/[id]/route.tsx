import db from '@/src/db/mysql';
import { matchesCardUuid } from '@/src/db/joins';
import { mtgCards } from '@/src/db/schema/magic';
import { orderAddressData, orderData, orderItemData, orderShippingData } from '@/src/db/schema/order';
import { PicklistData, PicklistItemData } from '@/src/db/schema/pickinglists';
import { profileData } from '@/src/db/schema/user';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const params = await props.params;

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

    // First get the specific picklist
    const [list] = await db
        .select()
        .from(PicklistData)
        .where(and(eq(PicklistData.id, parseInt(params.id)), eq(PicklistData.userId, user.id)));

    if (!list) {
        return NextResponse.json(
            {
                error: true,
                message: 'Picking list not found',
            },
            { status: 404 }
        );
    }

    // Then get all items for this list with their corresponding order items and card data
    const items = await db
        .select()
        .from(PicklistItemData)
        .leftJoin(orderItemData, eq(PicklistItemData.orderItemId, orderItemData.id))
        .leftJoin(orderShippingData, eq(orderItemData.orderId, orderShippingData.orderId))
        .leftJoin(orderAddressData, eq(orderItemData.orderId, orderAddressData.orderId))
        .leftJoin(mtgCards, matchesCardUuid(orderItemData.foreignKey))
        .leftJoin(orderData, eq(orderItemData.orderId, orderData.id))
        .leftJoin(profileData, eq(orderData.buyerId, profileData.id))
        .where(eq(PicklistItemData.picklistId, list.id));

    // Process items to match the original structure while adding card data
    const processedItems = items.map((item) => ({
        ...item.picklistItems,
        orderItem: {
            ...item.orderItem,
            originalItem: item.orderItem?.originalItem ? JSON.parse(item.orderItem.originalItem as string) : null,
        },
        card: item['mtg.cards'],
        order: item.order,
        orderShipping: item.orderShipping,
        orderAddress: item.orderAddress,
        buyer: {
            name: item.profiledata?.userName,
            country: item.profiledata?.country,
        },
    }));

    // Return the list with its items
    const processedList = {
        ...list,
        orderAmount: processedItems.filter((item) => item.orderItem?.orderId).length,
        items: processedItems,
    };

    return NextResponse.json({ list: processedList, success: true });
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const params = await props.params;

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

    if (!userRow || userRow.length === 0) {
        return NextResponse.json(
            {
                error: true,
                message: 'User not found',
            },
            { status: 404 }
        );
    }

    const user = userRow[0];

    // First verify the list exists and belongs to the user
    const [list] = await db
        .select()
        .from(PicklistData)
        .where(and(eq(PicklistData.id, parseInt(params.id)), eq(PicklistData.userId, user.id)));

    if (!list) {
        return NextResponse.json(
            {
                error: true,
                message: 'Picking list not found or not authorized to delete',
            },
            { status: 404 }
        );
    }

    try {
        // Delete all picking list items first
        await db.delete(PicklistItemData).where(eq(PicklistItemData.picklistId, list.id));

        // Then delete the picking list itself
        await db.delete(PicklistData).where(eq(PicklistData.id, list.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting picking list:', error);
        return NextResponse.json(
            {
                error: true,
                message: 'Error deleting picking list',
            },
            { status: 500 }
        );
    }
}
