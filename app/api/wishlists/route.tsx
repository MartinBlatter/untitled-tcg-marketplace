import { NextRequest, NextResponse } from 'next/server';
import db from '../../../src/db/mysql';
import { eq, inArray, like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { WishlistData, WishlistItemData } from '@/src/db/schema/wishlist';
import { profileData } from '@/src/db/schema/user';

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    const email = session?.user.email;

    try {
        const wishlistIds: number[] = [];
        const result = await db
            .select()
            .from(WishlistData)
            .leftJoin(profileData, eq(WishlistData.userId, profileData.id))
            .where(like(profileData.eMail, email as string));

        result.forEach((item: any) => {
            wishlistIds.push(item['mtg.wishlist'].id);
        });
        const wishlistItems = await db.select().from(WishlistItemData).where(inArray(WishlistItemData.wishlistId, wishlistIds));

        const finalResult: any[] = [];
        result.forEach((item: any) => {
            finalResult.push({
                ...item,
                items: wishlistItems.filter((i: any) => i.wishlistId === item['mtg.wishlist'].id),
            });
        });

        return NextResponse.json({ wishlists: finalResult, success: true });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error,
                wishlists: {},
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const email = session?.user.email;
    const body = await request.json();

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
            },
            { status: 500 }
        );
    }

    try {
        const result = await db
            .insert(WishlistData)
            .values({
                userId: userId,
                name: body.name,
                description: body.description,
                type: 'mtg',
            })
            .$returningId();

        return NextResponse.json({ wishlist: result, success: true });
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
