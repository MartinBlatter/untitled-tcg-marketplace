import { eq } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

import db from '@/src/db/mysql';
import { orderShippingData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();
    const { orderId, trackingNumber } = body;

    if (!session) {
        return NextResponse.json(
            {
                error: true,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    // Validate orderId is a valid number
    if (!orderId || typeof orderId !== 'number') {
        return NextResponse.json(
            {
                error: true,
                message: 'Invalid or missing orderId',
            },
            { status: 400 }
        );
    }

    // Validate trackingNumber (can be empty string if clearing it)
    if (trackingNumber === undefined) {
        return NextResponse.json(
            {
                error: true,
                message: 'Missing trackingNumber field',
            },
            { status: 400 }
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

    try {
        // Verify shipping data exists for this order
        const shipping = await db.select().from(orderShippingData).where(eq(orderShippingData.orderId, orderId));

        if (!shipping || shipping.length === 0) {
            return NextResponse.json(
                {
                    error: true,
                    message: 'Shipping data not found for this order',
                },
                { status: 404 }
            );
        }

        // Update the tracking number for the specified order
        await db.update(orderShippingData).set({ trackingNumber }).where(eq(orderShippingData.orderId, orderId));

        return NextResponse.json({
            success: true,
            message: 'Tracking number updated successfully',
            trackingNumber,
        });
    } catch (error) {
        console.error('Error updating tracking number:', error);
        return NextResponse.json(
            {
                error: true,
                message: 'Failed to update tracking number',
            },
            { status: 500 }
        );
    }
}
