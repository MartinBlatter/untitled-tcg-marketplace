import db from '@/src/db/mysql';
import { shoppingCartData, shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { profileData } from '@/src/db/schema/user';
import { and, eq, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { cartId, sellerId } = await request.json();
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

    if (!cartId || !sellerId) {
        return NextResponse.json(
            {
                error: true,
            },
            { status: 500 }
        );
    }

    try {
        const userRow = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, session.user.email as string));

        if (!userRow) {
            return NextResponse.json(
                {
                    error: true,
                },
                { status: 500 }
            );
        }

        const userId = userRow[0].id;

        if (!userId) {
            return NextResponse.json(
                {
                    error: true,
                },
                { status: 500 }
            );
        }

        await db.delete(shoppingCartItemData).where(and(eq(shoppingCartItemData.sellerId, sellerId), eq(shoppingCartItemData.cartId, cartId)));
        await db.delete(shoppingCartData).where(and(eq(shoppingCartData.userId, userId), eq(shoppingCartData.id, cartId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                error: true,
            },
            { status: 500 }
        );
    }
}
