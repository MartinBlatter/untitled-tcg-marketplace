import db from '@/src/db/mysql';
import { shoppingCartData, shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { profileData } from '@/src/db/schema/user';
import { and, eq, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { cartId, sellerId, displayName, price } = await request.json();
    const session = await getServerSession();
    const email = session?.user.email;

    try {
        const user = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const cart = await db
            .select()
            .from(shoppingCartData)
            .where(and(eq(shoppingCartData.userId, user[0].id), eq(shoppingCartData.id, cartId)));

        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        const update = await db
            .update(shoppingCartItemData)
            .set({
                price: Number(price).toFixed(2),
                displayName: displayName,
            })
            .where(and(eq(shoppingCartItemData.cartId, cartId), like(shoppingCartItemData.game, 'shipping'), eq(shoppingCartItemData.sellerId, sellerId)));

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
