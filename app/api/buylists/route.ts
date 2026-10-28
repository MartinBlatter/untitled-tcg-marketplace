import db from "@/src/db/mysql";
import { BuylistData, BuylistItemData } from "@/src/db/schema/buylist";
import { profileData } from "@/src/db/schema/user";
import { and, eq, isNull, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const email = session.user.email;

    try {
        // Get the user's ID
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || !user.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get all buylists for this user
        const buylists = await db
            .select()
            .from(BuylistData)
            .where(
                and(
                    eq(BuylistData.userId, user.id),
                    isNull(BuylistData.deactivatedAt)
                )
            );

        // For each buylist, fetch its items
        const buylistsWithItems = await Promise.all(buylists.map(async (buylist) => {
            const items = await db
                .select()
                .from(BuylistItemData)
                .where(and(
                    eq(BuylistItemData.buylistId, buylist.id),
                    isNull(BuylistItemData.deactivatedAt)
                ));
            
            return {
                ...buylist,
                items: items || []
            };
        }));

        return NextResponse.json({ buylists: buylistsWithItems, success: true });
    } catch (error) {
        console.error("Error fetching buylists:", error);
        return NextResponse.json({ error: "Failed to fetch buylists" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const data = await request.json();
        const { name, description, isPublic } = data;
        const email = session.user.email;

        // Get the user's ID
        const [user] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        if (!user || !user.id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create a new buylist
        const result = await db.insert(BuylistData).values({
            userId: user.id,
            type: 'mtg',
            name,
            description,
            isPublic: isPublic ? 1 : 0
        }).$returningId();
        
        // Fetch the newly created buylist
        const [buylist] = await db
            .select()
            .from(BuylistData)
            .where(eq(BuylistData.id, Number(result[0].id)));

        return NextResponse.json({ buylist, success: true });
    } catch (error) {
        console.error("Error creating buylist:", error);
        return NextResponse.json({ error: "Failed to create buylist" }, { status: 500 });
    }
}