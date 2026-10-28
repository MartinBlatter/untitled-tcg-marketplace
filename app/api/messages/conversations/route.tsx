import db from "@/src/db/mysql";
import { messageData } from "@/src/db/schema/messages";
import { profileData } from "@/src/db/schema/user";
import { like, or, eq, desc } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    const searchParams = new URLSearchParams(request.nextUrl.search);
    const size: number = searchParams?.get('size') as unknown as number || 10;
    const page: number = searchParams?.get('page') as unknown as number || 1;

    try {
        const conversations: any[] = [];

        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, session?.user.email as string));
        const userId = rows.id;

        if (!userId) {
            return NextResponse.json({
                error: true,
                message: "User not found"
            }, { status: 500 })
        }

        const users = await db.selectDistinct({ recipientId: messageData.recipientId, senderId: messageData.senderId }).from(messageData).where(or(eq(messageData.senderId, userId), eq(messageData.recipientId, userId))).orderBy(messageData.read, desc(messageData.createdAt));

        const conversationIds = users.map(user => [user.recipientId, user.senderId]).flat().filter((id, index, self) => self.indexOf(id) === index && id !== userId);

        const paginatedConversations = conversationIds.slice((page - 1) * size, page * size);

        const conversationsWithData = await Promise.all(paginatedConversations.map(async conversationId => {
            if (!conversationId) {
                return null;
            }
            let rows = null;
            [rows] = await db.select().from(profileData).where(like(profileData.id, conversationId as unknown as string));

            let messageRows = null;
            messageRows = await db.select().from(messageData).where(or(eq(messageData.senderId, conversationId), eq(messageData.recipientId, conversationId))).orderBy(desc(messageData.createdAt));

            let unread = false;
            const messages: any[] = [];

            for (const messageRow of messageRows) {
                if (messageRow.recipientId === userId && messageRow.read === 0) unread = true;
                messages.push({
                    id: messageRow.id,
                    senderId: messageRow.senderId,
                    recipientId: messageRow.recipientId,
                    title: messageRow.title,
                    text: messageRow.text,
                    createdAt: messageRow.createdAt,
                    read: messageRow.read
                })
            }

            return {
                userId: conversationId,
                userName: rows.userName,
                messages: messages,
                unread: unread
            }
        }));

        return NextResponse.json({
            success: true,
            conversations: conversationsWithData,
            count: conversationIds.length
        });

    } catch (error) {
        return NextResponse.json({
            error: true,
            message: error
        }, { status: 500 })
    }
}
