import db from '@/src/db/mysql';
import { profileData } from '@/src/db/schema/user';
import { WishlistData, WishlistItemData } from '@/src/db/schema/wishlist';
import { eq, like, and } from 'drizzle-orm';
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
        const result = await db
            .select()
            .from(WishlistData)
            .leftJoin(profileData, eq(WishlistData.userId, profileData.id))
            .where(and(like(profileData.eMail, email as string), like(WishlistData.id, id)));

        if (result.length === 0) {
            return NextResponse.json({
                error: true,
            });
        }

        const wishlistItems = await db.select().from(WishlistItemData).where(like(WishlistItemData.wishlistId, id));

        let csvData = ['name', 'setCodes', 'language', 'quality', 'quantity', 'foil', 'altered', 'signed', 'misprint', 'graded', 'price', 'comment', 'uuid'].join(',') + '\r\n';

        wishlistItems.forEach((item: any) => {
            csvData +=
                [
                    `"${item.name}"`,
                    `"${item.setCodes}"`,
                    `"${item.language}"`,
                    `"${item.quality}"`,
                    `"${item.quantity}"`,
                    `"${item.isFoil}"`,
                    `"${item.isAltered}"`,
                    `"${item.isSigned}"`,
                    `"${item.isMisprint}"`,
                    `"${item.isGraded}"`,
                    `"${item.price}"`,
                    `"${item.comment}"`,
                    `"${item.uuid}"`,
                ].join(',') + '\r\n';
        });

        const headers = new Headers();
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', `attachment; filename="wishlist_${id}.csv"`);

        return new NextResponse(csvData, {
            status: 200,
            statusText: 'OK',
            headers,
        });
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
