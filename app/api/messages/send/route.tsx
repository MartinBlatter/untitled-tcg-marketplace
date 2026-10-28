import db from "@/src/db/mysql";
import { messageData } from "@/src/db/schema/messages";
import { profileData } from "@/src/db/schema/user";
import { like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const session = await getServerSession();
    const userId = body.userId;
    const message = body.message;
    const title = body.title;

    if (!userId || !message || !title) {
        return NextResponse.json({ error: true, message: "Missing required fields" }, { status: 500 });
    }

    try {

        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, session?.user.email as string));
        const senderId = rows.id;

        if (!senderId) {
            return NextResponse.json({
                error: true,
                message: "User not found"
            }, { status: 500 })
        }

        await db.insert(messageData).values(
            {
                title: title,
                text: message,
                senderId: senderId as number,
                recipientId: userId as number,
            }
        )

        return NextResponse.json({
            success: true
        });

    } catch (error) {
        return NextResponse.json({
            error: true,
            message: error
        }, { status: 500 })
    }
}