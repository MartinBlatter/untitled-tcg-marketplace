import db from '@/src/db/mysql';
import { mtgCards } from '@/src/db/schema/magic';
import { profileData } from '@/src/db/schema/user';
import { WishlistData, WishlistItemData } from '@/src/db/schema/wishlist';
import { like, eq, and, SQL } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const email = session?.user.email;
    const body = await request.json();
    const id = body.id;
    const list = body.list;

    let rows = null;
    [rows] = await db
        .select()
        .from(profileData)
        .where(like(profileData.eMail, email as string));
    const userId = rows.id;

    if (!userId || !id || !list) {
        return NextResponse.json(
            {
                error: true,
            },
            { status: 500 }
        );
    }

    [rows] = await db
        .select()
        .from(WishlistData)
        .where(and(eq(WishlistData.userId, userId), eq(WishlistData.id, id)));
    const wishlistId = rows.id;

    if (!wishlistId) {
        return NextResponse.json(
            {
                error: true,
            },
            { status: 500 }
        );
    }

    try {
        const newItems: any[] = [];
        const addedItems: string[] = [];
        const notAddedItems: string[] = [];
        const cardRegex = /^(?:(\d+)\s+)?(.+?)(?:\s+\((\w+)\))?(?:\s+(\d+))?$/;

        const items = list.split(/\r?\n/);
        for await (const item of items) {
            let quantity = 1;
            let name = '';
            let nameSearch = '';
            let setCode = '';
            let number = '';
            const match = item.match(cardRegex);

            if (match) {
                const [_, matchQuantity, matchName, matchSetCode, matchNumber] = match;
                quantity = parseInt(matchQuantity) || 1;
                name = matchName || '';
                nameSearch = `%${matchName}%` || '';
                setCode = matchSetCode || '%';
                number = matchNumber || '';
            }

            if (!name) {
                notAddedItems.push(item);
                continue;
            }

            const filters: SQL[] = [like(mtgCards.name, nameSearch)];
            if (setCode && setCode !== '%') filters.push(eq(mtgCards.setCode, setCode));
            if (number) filters.push(eq(mtgCards.number, number));

            const [cardResult] = await db
                .select({ uuid: mtgCards.uuid })
                .from(mtgCards)
                .where(and(...filters));

            if (!cardResult || !cardResult.uuid) {
                notAddedItems.push(item);
                continue;
            } else {
                addedItems.push(name);
            }

            newItems.push({
                uuid: cardResult.uuid,
                wishlistId: id,
                name: name,
                quantity: quantity,
                price: 0,
                setCodes: '%',
                language: '%',
                quality: 'NM',
                comment: '',
                isFoil: false,
                isAltered: false,
                isSigned: false,
                isMisprint: false,
                isGraded: false,
            });
        }

        if (newItems.length === 0) return NextResponse.json({ success: true, addedItems: addedItems, notAddedItems: notAddedItems });

        await db.insert(WishlistItemData).values(newItems);

        return NextResponse.json({ success: true, addedItems: addedItems, notAddedItems: notAddedItems });
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
