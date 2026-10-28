import db from '@/src/db/mysql';
import { profileData } from '@/src/db/schema/user';
import { WishlistData, WishlistItemData } from '@/src/db/schema/wishlist';
import { like, eq, and } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

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
        let result = null;
        if (!body.id) {
            result = await db
                .insert(WishlistItemData)
                .values({
                    uuid: body.uuid,
                    wishlistId: body.wishlist | body.wishlistId,
                    name: body.name,
                    quantity: body.quantity,
                    price: body.price,
                    setCodes: Array.isArray(body.setCodes) ? body.setCodes.join(',') : body.setCodes,
                    language: Array.isArray(body.language) ? body.language.join(',') : body.language,
                    quality: body.quality,
                    comment: body.comment,
                    isFoil: body.isFoil === 'true' || body.isFoil === true || body.isFoil === 1 ? 1 : 0,
                    isAltered: body.isAltered === 'true' || body.isAltered === true || body.isAltered === 1 ? 1 : 0,
                    isSigned: body.isSigned === 'true' || body.isSigned === true || body.isSigned === 1 ? 1 : 0,
                    isMisprint: body.isMisprint === 'true' || body.isMisprint === true || body.isMisprint === 1 ? 1 : 0,
                    isGraded: body.isGraded === 'true' || body.isGraded === true || body.isGraded === 1 ? 1 : 0,
                })
                .$returningId();
        } else {
            result = await db
                .update(WishlistItemData)
                .set({
                    uuid: body.uuid,
                    wishlistId: body.wishlist,
                    name: body.name,
                    quantity: body.quantity,
                    price: body.price,
                    setCodes: body.setCodes.join(','),
                    language: body.language.join(','),
                    quality: body.quality,
                    comment: body.comment,
                    isFoil: body.isFoil === 'true' || body.isFoil === true || body.isFoil === 1 ? 1 : 0,
                    isAltered: body.isAltered === 'true' || body.isAltered === true || body.isAltered === 1 ? 1 : 0,
                    isSigned: body.isSigned === 'true' || body.isSigned === true || body.isSigned === 1 ? 1 : 0,
                    isMisprint: body.isMisprint === 'true' || body.isMisprint === true || body.isMisprint === 1 ? 1 : 0,
                    isGraded: body.isGraded === 'true' || body.isGraded === true || body.isGraded === 1 ? 1 : 0,
                })
                .where(eq(WishlistItemData.id, body.id));
        }

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

export async function DELETE(request: NextRequest) {
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
        let result = await db
            .select()
            .from(WishlistItemData)
            .leftJoin(WishlistData, eq(WishlistItemData.wishlistId, WishlistData.id))
            .where(and(eq(WishlistData.userId, userId), eq(WishlistItemData.id, body.id)));
        if (result.length === 0) {
            return NextResponse.json(
                {
                    error: true,
                },
                { status: 500 }
            );
        } else {
            await db.delete(WishlistItemData).where(eq(WishlistItemData.id, body.id));
        }

        return NextResponse.json({ success: true });
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
