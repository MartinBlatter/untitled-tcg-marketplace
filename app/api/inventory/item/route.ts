import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";
import { getServerSession } from "@/src/lib/auth/session";
import { and, eq, like } from "drizzle-orm";
import { inventoryData } from "@/src/db/schema/inventory";
import { profileData } from "@/src/db/schema/user";

export async function POST(
    request: NextRequest
) {
    const session = await getServerSession();
    const body = await request.json();
    const id = body.id;
    const price = body.price;
    const quantity = body.quantity;
    const isListed = body.isListed;

    try {
        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, session?.user.email as string));
        const userId = rows.id;

        if (!userId) {
            return NextResponse.json({
                error: true
            }, { status: 500 })
        }

        await db.update(inventoryData).set({ price: price, isListed: isListed, quantity: quantity }).where(and(eq(inventoryData.id, id), eq(inventoryData.userId, userId)));

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest
) {
    const session = await getServerSession();
    const body = await request.json();
    const id = body.id;

    try {
        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, session?.user.email as string));
        const userId = rows.id;

        if (!userId) {
            return NextResponse.json({
                error: true
            }, { status: 500 })
        }

        await db.delete(inventoryData).where(and(eq(inventoryData.id, id), eq(inventoryData.userId, userId)));

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}