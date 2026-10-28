import db from '@/src/db/mysql';
import { inventoryData } from '@/src/db/schema/inventory';
import { mtgCards } from '@/src/db/schema/magic';
import { shoppingCartData, shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { profileData } from '@/src/db/schema/user';
import { eq, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession();
    const email = session?.user.email;

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

        const itemRows = await db
            .select()
            .from(shoppingCartItemData)
            .leftJoin(shoppingCartData, eq(shoppingCartItemData.cartId, shoppingCartData.id))
            .where(eq(shoppingCartData.userId, userId))
            .leftJoin(profileData, eq(profileData.id, shoppingCartItemData.sellerId))
            .leftJoin(inventoryData, eq(shoppingCartItemData.foreignKey, inventoryData.id))
            .leftJoin(mtgCards, eq(mtgCards.uuid, inventoryData.foreignKey));

        const itemsBySeller = itemRows.reduce((acc: any, item: any) => {
            const sellerId = item.shoppingCartItems.sellerId;

            if (!acc[sellerId]) {
                acc[sellerId] = [];
            }

            acc[sellerId].push({ ...item.shoppingCartItems, sellerName: item.profiledata.userName, type: item['mtg.inventory']?.type, card: item['mtg.cards'] });
            return acc;
        }, {});

        const items = Object.values(itemsBySeller);

        return NextResponse.json(
            {
                success: true,
                cart: itemRows.length > 0 ? itemRows[0].shoppingCart : null,
                items: items,
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
