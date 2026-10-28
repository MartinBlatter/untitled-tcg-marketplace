import db from "@/src/db/mysql";
import { messageData } from "@/src/db/schema/messages";
import { profileData } from "@/src/db/schema/user";
import { inArray, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const session = await getServerSession();
    const conversation = body.conversation;

    if (!conversation) {
        return NextResponse.json({ error: true, message: "Missing required fields" }, { status: 500 });
    }

    try {
        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, session?.user.email as string));
        const userId = rows.id;

        if (!userId) {
            return NextResponse.json({ error: true, message: "User not found" }, { status: 500 });
        }

        const ids: number[] = [];

        for (let i = 0; i < conversation.messages.length; i++) {
            if (conversation.messages[i].recipientId === userId) {
                ids.push(conversation.messages[i].id);
            }
        }

        if (ids.length > 0) {
            await db.update(messageData).set({ read: 1 }).where(inArray(messageData.id, ids));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: true, message: error }, { status: 500 });
    }
}