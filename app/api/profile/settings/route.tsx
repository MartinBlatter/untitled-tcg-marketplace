import db from "@/src/db/mysql";
import { profileData, profileSettingsData } from "@/src/db/schema/user";
import { like, eq } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    const email = session?.user.email;

    if (!email) {
        return NextResponse.json({ error: true }, { status: 500 });
    }

    try {
        let userRows = null;
        [userRows] = await db.select().from(profileData).where(like(profileData.eMail, email as string));
        const userId = userRows.id;
        if (!userId) {
            return NextResponse.json({ error: true }, { status: 500 });
        }

        const rows = await db.select().from(profileSettingsData).where(eq(profileSettingsData.userId, userId));
        return NextResponse.json({ settings: rows, success: true });
    } catch (error) {
        return NextResponse.json({ error: true }, { status: 500 });
    }
}