import db from '@/src/db/mysql';
import { shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { eq, like, and } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { profileData } from '@/src/db/schema/user';
import { calculateCartShippingCosts } from '@/src/utils/shipping.helper';

export async function DELETE(request: NextRequest) {
    const body = await request.json();
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

    if (!body.id) {
        return NextResponse.json(
            {
                error: true,
                message: 'Missing required fields',
            },
            { status: 500 }
        );
    }

    const userRow = await db
        .select()
        .from(profileData)
        .where(like(profileData.eMail, session.user.email as string));
    const buyerCountry = userRow[0].country;

    try {
        const item = await db.select().from(shoppingCartItemData).where(eq(shoppingCartItemData.id, body.id));
        await db.delete(shoppingCartItemData).where(eq(shoppingCartItemData.id, body.id));
        await calculateCartShippingCosts(item[0].cartId as number, buyerCountry);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error,
                user: {},
            },
            { status: 500 }
        );
    }
}
