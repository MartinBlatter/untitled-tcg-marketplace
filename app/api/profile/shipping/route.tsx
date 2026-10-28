import db from "@/src/db/mysql";
import { customShippingData, profileData } from "@/src/db/schema/user";
import { like, eq } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";

export async function GET() {
    const session = await getServerSession();

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const email = session.user.email;

    if (!email) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        let userRows = null;
        [userRows] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));
        const userId = userRows.id;

        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const shippingRows = await db
            .select()
            .from(customShippingData)
            .where(eq(customShippingData.userId, userId));

        return new Response(
            JSON.stringify({ shipping: shippingRows, success: true }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: true }), { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession();
    const body = await request.json();

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const email = session.user.email;

    if (!email) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        let userRows = null;
        [userRows] = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));
        const userId = userRows.id;

        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const insert = await db.insert(customShippingData).values({
            userId: userId,
            range: body.range,
            type: body.type,
            cards: body.cards,
            maxValue: body.maxValue,
            weight: body.weight,
            price: body.price,
            tracking: body.tracking,
        });

        const shippingRows = await db
            .select()
            .from(customShippingData)
            .where(eq(customShippingData.userId, userId));

        return new Response(
            JSON.stringify({ shipping: shippingRows, success: true }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: true }), { status: 500 });
    }
}
