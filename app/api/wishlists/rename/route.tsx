import db from '@/src/db/mysql';
import { profileData } from '@/src/db/schema/user';
import { WishlistData } from '@/src/db/schema/wishlist';
import { and, eq, like } from 'drizzle-orm';
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
        const result = await db
            .update(WishlistData)
            .set({ name: body.name })
            .where(and(eq(WishlistData.userId, userId), eq(WishlistData.id, body.id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: true }, { status: 500 });
    }
}
