import db from '@/src/db/mysql';
import { PicklistData, PicklistItemData } from '@/src/db/schema/pickinglists';
import { profileData } from '@/src/db/schema/user';
import { eq, inArray } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json(
            {
                error: true,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    const userRow = await db
        .select()
        .from(profileData)
        .where(eq(profileData.eMail, session.user.email as string));

    if (!userRow) {
        return NextResponse.json(
            {
                error: true,
                message: 'User not found',
            },
            { status: 404 }
        );
    }

    const user = userRow[0];

    // First get all picklists
    const lists = await db.select().from(PicklistData).where(eq(PicklistData.userId, user.id));

    if (lists.length === 0) {
        return NextResponse.json([]);
    }

    // Then get all items for these lists
    const items = await db
        .select()
        .from(PicklistItemData)
        .where(
            inArray(
                PicklistItemData.picklistId,
                lists.map((list) => list.id)
            )
        );

    // Group items by list
    const processedLists = lists.map((list) => ({
        ...list,
        items: items.filter((item) => item.picklistId === list.id),
    }));

    return NextResponse.json(processedLists);
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();
    const id = body.id;

    if (!session) {
        return NextResponse.json(
            {
                error: true,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    const userRow = await db
        .select()
        .from(profileData)
        .where(eq(profileData.eMail, session.user.email as string));

    if (!userRow) {
        return NextResponse.json(
            {
                error: true,
                message: 'User not found',
            },
            { status: 404 }
        );
    }

    const user = userRow[0];

    try {
        // First delete all items in this list
        await db.delete(PicklistItemData).where(eq(PicklistItemData.picklistId, id));

        // Then delete the list itself
        await db.delete(PicklistData).where(eq(PicklistData.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                error: true,
                message: 'Error deleting picking list',
            },
            { status: 500 }
        );
    }
}
