import db from '@/src/db/mysql';
import { WishlistData, WishlistItemData } from '@/src/db/schema/wishlist';
import { like } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ hash: string }> }) {
    const params = await props.params;
    const hash = params ? params.hash : '';
    const id = atob(hash).replace('THIS_1S_A_S4L7_TO_HIDE_TH3_ID_J|_|ST_IN_C^SE_', '');

    try {
        const result = await db.select().from(WishlistData).where(like(WishlistData.id, id));

        const wishlistItems = await db.select().from(WishlistItemData).where(like(WishlistItemData.wishlistId, id));

        const wishlist = {
            name: result[0].name,
            description: result[0].description,
            type: result[0].type,
            items: wishlistItems,
        };
        return NextResponse.json({ wishlist: wishlist, success: true });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error,
                wishlist: {},
            },
            { status: 500 }
        );
    }
}
