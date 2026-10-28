import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";
import { like } from "drizzle-orm";
import { profileData } from "../../../../../src/db/schema/user";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ email: string }> }
) {
    const params = await props.params;
    const email = params.email;

    try {
        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, email as string));
        rows = rows || {};
        return NextResponse.json({ user: rows, success: true });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error,
            user: {}
        }, { status: 500 })
    }
}