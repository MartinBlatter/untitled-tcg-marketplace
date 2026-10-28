import db from '@/src/db/mysql';
import { shoppingCartData, shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { profileData } from '@/src/db/schema/user';
import { calculateCartShippingCosts } from '@/src/utils/shipping.helper';
import { and, eq, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    try {
        const userRow = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, session.user.email as string));
        const userId = userRow[0].id;
        const buyerCountry = userRow[0].country;

        if (!userId || !buyerCountry) {
            return NextResponse.json(
                {
                    error: true,
                    message: 'User or country not found',
                },
                { status: 500 }
            );
        }

        let rows = await db.select().from(shoppingCartData).where(eq(shoppingCartData.userId, userId)).limit(1);

        if ((rows as any).length === 0) {
            await db.insert(shoppingCartData).values({ userId: userId });
            rows = await db.select().from(shoppingCartData).where(eq(shoppingCartData.userId, userId)).limit(1);
        }

        const cartId = (rows as any)[0].id;

        const existingRows = await db
            .select()
            .from(shoppingCartItemData)
            .where(and(eq(shoppingCartItemData.foreignKeySource, body.foreignKeySource), eq(shoppingCartItemData.foreignKey, body.foreignKey)));

        if (existingRows.length > 0) {
            return NextResponse.json(
                {
                    error: true,
                    message: 'Item already exists in cart',
                },
                { status: 500 }
            );
        }

        const itemId = await db
            .insert(shoppingCartItemData)
            .values({
                cartId: cartId,
                game: body.game,
                foreignKeySource: body.foreignKeySource,
                foreignKey: body.foreignKey,
                quantity: body.quantity,
                price: body.price,
                displayName: body.displayName,
                sellerId: body.sellerId,
            })
            .$returningId();

        await calculateCartShippingCosts(cartId, buyerCountry);

        return NextResponse.json({
            success: true,
            id: itemId[0].id,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: true,
                message: error,
            },
            { status: 500 }
        );
    }
}
