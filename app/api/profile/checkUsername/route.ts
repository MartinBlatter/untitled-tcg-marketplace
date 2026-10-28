import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";
import { like } from "drizzle-orm";
import { profileData } from "../../../../src/db/schema/user";

export async function POST(
    request: NextRequest
) {
    const body = await request.json();
    const userName = body.userName;

    try {
        const [rows] = await db.select().from(profileData).where(like(profileData.userName, userName as string));

        return NextResponse.json({
            exists: rows ? true : false
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}