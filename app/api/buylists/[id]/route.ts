import db from "@/src/db/mysql";
import { BuylistData, BuylistItemData } from "@/src/db/schema/buylist";
import { profileData } from "@/src/db/schema/user";
import { and, eq, isNull, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        // Get the buylist by ID
        const [buylist] = await db
            .select()
            .from(BuylistData)
            .where(and(eq(BuylistData.id, id), isNull(BuylistData.deactivatedAt)));

        if (!buylist) {
            return NextResponse.json({ error: "Buylist not found" }, { status: 404 });
        }

        // Check if user owns the buylist or if it's public
        const email = session.user.email;
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || (user.id !== buylist.userId && buylist.isPublic !== 1)) {
            return NextResponse.json({ error: "Unauthorized access to buylist" }, { status: 403 });
        }

        // Get all items for this buylist
        const items = await db
            .select()
            .from(BuylistItemData)
            .where(and(eq(BuylistItemData.buylistId, id), isNull(BuylistItemData.deactivatedAt)));

        const buylistWithItems = {
            ...buylist,
            items: items || []
        };          

        return NextResponse.json({ buylist: buylistWithItems, success: true });


        } catch (error) {
        console.error("Error fetching buylist:", error);
        return NextResponse.json({ error: "Failed to fetch buylist" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        const email = session.user.email;
        const data = await request.json();
        const { name, description, isPublic } = data;

        // Get the user's ID
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || !user.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if the buylist belongs to the user
        const [existingBuylist] = await db
            .select()
            .from(BuylistData)
            .where(and(
                eq(BuylistData.id, id),
                isNull(BuylistData.deactivatedAt)
            ));

        if (!existingBuylist) {
            return NextResponse.json({ error: "Buylist not found" }, { status: 404 });
        }

        if (existingBuylist.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized to update this buylist" }, { status: 403 });
        }

        // Update the buylist
        await db
            .update(BuylistData)
            .set({
                name: name ?? existingBuylist.name,
                description: description ?? existingBuylist.description,
                isPublic: isPublic !== undefined ? (isPublic ? 1 : 0) : existingBuylist.isPublic,
                updatedAt: new Date()
            })
            .where(eq(BuylistData.id, id));
        
        // Get the updated buylist
        const [updatedBuylist] = await db
            .select()
            .from(BuylistData)
            .where(eq(BuylistData.id, id));

        return NextResponse.json({ buylist: updatedBuylist, success: true });
    } catch (error) {
        console.error("Error updating buylist:", error);
        return NextResponse.json({ error: "Failed to update buylist" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        const email = session.user.email;

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
                eq(BuylistData.id, id), 
                eq(BuylistData.userId, user.id),
                isNull(BuylistData.deactivatedAt)
            ));

        if (!buylist) {
            return NextResponse.json({ error: "Buylist not found or not authorized" }, { status: 404 });
        }

        // Soft delete the buylist (set deactivatedAt)
        await db
            .update(BuylistData)
            .set({
                deactivatedAt: new Date()
            })
            .where(eq(BuylistData.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting buylist:", error);
        return NextResponse.json({ error: "Failed to delete buylist" }, { status: 500 });
    }
}