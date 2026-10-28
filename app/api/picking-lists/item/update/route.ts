import db from "@/src/db/mysql";
import { PicklistItemData } from "@/src/db/schema/pickinglists";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const body = await request.json();
    const { id, status, problem } = body;

    if (!session) {
        return NextResponse.json(
            {
                error: true,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    if (!id) {
        return NextResponse.json(
            {
                error: true,
                message: 'Missing required fields',
            },
            { status: 400 }
        );
    }

    try {
        await db
            .update(PicklistItemData)
            .set({ 
                status: status || null,
                problem: problem || null,
                updatedAt: new Date()
            })
            .where(eq(PicklistItemData.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                error: true,
                message: 'Error updating picking list item',
            },
            { status: 500 }
        );
    }
}