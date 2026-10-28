import db from "@/src/db/mysql";
import { BuylistData, BuylistItemData } from "@/src/db/schema/buylist";
import { profileData } from "@/src/db/schema/user";
import { and, eq, isNull, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const params = await props.params;

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const buylistId = parseInt(params.id);
        const email = session.user.email;

        // Get the user's ID
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || !user.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if the buylist exists and user has access
        const [buylist] = await db
            .select()
            .from(BuylistData)
            .where(and(eq(BuylistData.id, buylistId), isNull(BuylistData.deactivatedAt)));

        if (!buylist) {
            return NextResponse.json({ error: "Buylist not found" }, { status: 404 });
        }

        // Check if user owns the buylist or if it's public
        if (buylist.userId !== user.id && buylist.isPublic !== 1) {
            return NextResponse.json({ error: "Unauthorized access to buylist" }, { status: 403 });
        }

        // Get all items for this buylist
        const items = await db
            .select()
            .from(BuylistItemData)
            .where(and(eq(BuylistItemData.buylistId, buylistId), isNull(BuylistItemData.deactivatedAt)));

        return NextResponse.json({ items, success: true });
    } catch (error) {
        console.error("Error fetching buylist items:", error);
        return NextResponse.json({ error: "Failed to fetch buylist items" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const params = await props.params;

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const buylistId = parseInt(params.id);
        const email = session.user.email;
        const data = await request.json();
        
        const { 
            uuid, 
            name, 
            quantity, 
            maxBuys, 
            language, 
            quality, 
            isFoil, 
            isAltered, 
            isSigned, 
            isMisprint, 
            isGraded, 
            price, 
            comment,
            setCodes
        } = data;

        // Get the user's ID
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || !user.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if the buylist belongs to the user
        const [buylist] = await db
            .select()
            .from(BuylistData)
            .where(and(
                eq(BuylistData.id, buylistId), 
                eq(BuylistData.userId, user.id),
                isNull(BuylistData.deactivatedAt)
            ));

        if (!buylist) {
            return NextResponse.json({ error: "Buylist not found or not authorized" }, { status: 404 });
        }

        // Create the buylist item
        const result = await db.insert(BuylistItemData).values({
            buylistId,
            uuid,
            name,
            quantity: quantity || 1,
            maxBuys: maxBuys || 0,
            bought: 0,
            language,
            quality,
            isFoil: isFoil ? 1 : 0,
            isAltered: isAltered ? 1 : 0,
            isSigned: isSigned ? 1 : 0,
            isMisprint: isMisprint ? 1 : 0,
            isGraded: isGraded ? 1 : 0,
            price,
            comment,
            setCodes
        }).$returningId();
        
        // Get the newly created item
        const [item] = await db
            .select()
            .from(BuylistItemData)
            .where(eq(BuylistItemData.id, result[0].id));

        return NextResponse.json({ item, success: true });
    } catch (error) {
        console.error("Error adding buylist item:", error);
        return NextResponse.json({ error: "Failed to add item to buylist" }, { status: 500 });
    }
}