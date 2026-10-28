import { ORDER_TABLE_ROWS_PER_PAGE } from '@/src/constants/pagination';
import db from '@/src/db/mysql';
import { shoppingCartData, shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { profileData } from '@/src/db/schema/user';
import { eq, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    const email = session?.user.email;
    const page = request.nextUrl.searchParams.get('page') || 1;

    if (!email) {
        return NextResponse.json(
            {
                error: true,
                message: 'Not logged in',
            },
            { status: 500 }
        );
    }

    try {
        let rows = null;
        [rows] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));
        const userId = rows.id;

        if (!userId) {
            return NextResponse.json(
                {
                    error: true,
                    message: 'User not found',
                },
                { status: 500 }
            );
        }

        const itemRows = await db.select().from(shoppingCartItemData).leftJoin(shoppingCartData, eq(shoppingCartItemData.cartId, shoppingCartData.id)).where(eq(shoppingCartItemData.sellerId, userId));

        const carts: any[] = [];
        let sum = 0;
        for (const item of itemRows) {
            const cartId = item.shoppingCartItems.cartId;
            if (cartId !== null) {
                if (!carts[cartId]) {
                    carts[cartId] = {
                        ...item.shoppingCart,
                        items: [],
                    };
                }
                carts[cartId].items.push(item.shoppingCartItems);
                sum += Number(item.shoppingCartItems.price) * Number(item.shoppingCartItems.quantity);
            }
        }

        const filteredCarts: any[] = [];
        for (const cart of Object.values(carts)) {
            if (cart.items.length > 0) {
                filteredCarts.push(cart);
            }
        }

        return NextResponse.json(
            {
                success: true,
                carts: filteredCarts.slice((Number(page) - 1) * ORDER_TABLE_ROWS_PER_PAGE, Number(page) * ORDER_TABLE_ROWS_PER_PAGE),
                count: filteredCarts.length,
                sum: sum,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error,
            },
            { status: 500 }
        );
    }
}
