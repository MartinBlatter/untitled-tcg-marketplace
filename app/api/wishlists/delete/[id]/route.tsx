import db from '@/src/db/mysql';
import { WishlistData, WishlistItemData } from '@/src/db/schema/wishlist';
import { eq } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const email = session?.user.email;
    const params = await props.params;
    const id = params.id;

    if (!email) {
        return NextResponse.json({
            error: true,
        });
    }

    if (!id) {
        return NextResponse.json({
            error: true,
        });
    }

    try {
        await db.delete(WishlistItemData).where(eq(WishlistItemData.wishlistId, id as unknown as number));
        await db.delete(WishlistData).where(eq(WishlistData.id, id as unknown as number));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error,
        });
    }
}
