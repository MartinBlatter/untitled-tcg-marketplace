import db from "@/src/db/mysql";
import { BuylistData, BuylistItemData } from "@/src/db/schema/buylist";
import { profileData } from "@/src/db/schema/user";
import { and, eq, isNull, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest,  props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const params = await props.params;

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const itemId = parseInt(params.id);
        const email = session.user.email;

        // Get the user's ID
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || !user.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get the item
        const [item] = await db
            .select()
            .from(BuylistItemData)
            .where(and(eq(BuylistItemData.id, itemId), isNull(BuylistItemData.deactivatedAt)));

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        // Check if the user owns the buylist this item belongs to
        const [buylist] = await db
            .select()
            .from(BuylistData)
            .where(and(eq(BuylistData.id, item.buylistId), isNull(BuylistData.deactivatedAt)))

        if (!buylist || (buylist.userId !== user.id && buylist.isPublic !== 1)) {
            return NextResponse.json({ error: "Unauthorized access to buylist item" }, { status: 403 });
        }

        return NextResponse.json({ item, success: true });
    } catch (error) {
        console.error("Error fetching buylist item:", error);
        return NextResponse.json({ error: "Failed to fetch buylist item" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const params = await props.params;

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const itemId = parseInt(params.id);
        const email = session.user.email;
        const data = await request.json();
        
        const { 
            quantity, 
            maxBuys, 
            bought,
            language, 
            quality, 
            isFoil, 
            isAltered, 
            isSigned, 
            isMisprint, 
            isGraded, 
            price, 
            comment 
        } = data;

        // Get the user's ID
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || !user.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get the item
        const [item] = await db
            .select()
            .from(BuylistItemData)
            .where(and(eq(BuylistItemData.id, itemId), isNull(BuylistItemData.deactivatedAt)));

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        // Check if the user owns the buylist this item belongs to
        const [buylist] = await db
            .select()
            .from(BuylistData)
            .where(and(
                eq(BuylistData.id, item.buylistId), 
                eq(BuylistData.userId, user.id),
                isNull(BuylistData.deactivatedAt)
            ));

        if (!buylist) {
            return NextResponse.json({ error: "Unauthorized to update this item" }, { status: 403 });
        }

        // Update the item
        await db
            .update(BuylistItemData)
            .set({
                quantity: quantity !== undefined ? quantity : item.quantity,
                maxBuys: maxBuys !== undefined ? maxBuys : item.maxBuys,
                bought: bought !== undefined ? bought : item.bought,
                language: language || item.language,
                quality: quality || item.quality,
                isFoil: isFoil !== undefined ? (isFoil ? 1 : 0) : item.isFoil,
                isAltered: isAltered !== undefined ? (isAltered ? 1 : 0) : item.isAltered,
                isSigned: isSigned !== undefined ? (isSigned ? 1 : 0) : item.isSigned,
                isMisprint: isMisprint !== undefined ? (isMisprint ? 1 : 0) : item.isMisprint,
                isGraded: isGraded !== undefined ? (isGraded ? 1 : 0) : item.isGraded,
                price: price !== undefined ? price : item.price,
                comment: comment !== undefined ? comment : item.comment,
                updatedAt: new Date()
            })
            .where(eq(BuylistItemData.id, itemId));
        
        // Get the updated item
        const [updatedItem] = await db
            .select()
            .from(BuylistItemData)
            .where(eq(BuylistItemData.id, itemId));

        return NextResponse.json({ item: updatedItem, success: true });
    } catch (error) {
        console.error("Error updating buylist item:", error);
        return NextResponse.json({ error: "Failed to update buylist item" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const params = await props.params;

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const itemId = parseInt(params.id);
        const email = session.user.email;

        // Get the user's ID
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || !user.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get the item
        const [item] = await db
            .select()
            .from(BuylistItemData)
            .where(and(eq(BuylistItemData.id, itemId),isNull(BuylistItemData.deactivatedAt)));

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        // Check if the user owns the buylist this item belongs to
        const [buylist] = await db
            .select()
            .from(BuylistData)
            .where(and(
                eq(BuylistData.id, item.buylistId), 
                eq(BuylistData.userId, user.id),
                isNull(BuylistData.deactivatedAt)
            ));

        if (!buylist) {
            return NextResponse.json({ error: "Unauthorized to delete this item" }, { status: 403 });
        }

        // Soft delete the item
        await db
            .update(BuylistItemData)
            .set({
                deactivatedAt: new Date()
            })
            .where(eq(BuylistItemData.id, itemId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting buylist item:", error);
        return NextResponse.json({ error: "Failed to delete buylist item" }, { status: 500 });
    }
}