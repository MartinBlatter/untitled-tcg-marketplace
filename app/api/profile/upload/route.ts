import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { getServerSession } from "@/src/lib/auth/session";
import { profileBusinessData, profileData } from "@/src/db/schema/user";
import { eq, like } from "drizzle-orm";
import db from "../../../../src/db/mysql";

export async function POST(
    request: NextRequest
) {
    const session = await getServerSession();
    const formData = await request.formData();
    const email = session?.user.email;

    const file = formData.get("file") as File;
    const type = formData.get("type");
    if (!file || !type || !email) {
        return NextResponse.json({ error: true }, { status: 500 });
    }

    if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif") {
        return NextResponse.json({ error: true }, { status: 500 });
    }

    try {
        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, session?.user.email as string));
        const userId = rows.id;

        if (!userId) {
            return NextResponse.json({
                error: true
            }, { status: 500 })
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileEnding = file.name.split(".").pop();

        await writeFile(
            path.join(process.cwd(), `public/uploads/profile/${type}/${userId}.${fileEnding}`),
            buffer
        );

        if (type === 'avatar') {
            await db.update(profileBusinessData).set({ avatar: `/uploads/profile/${type}/${userId}.${fileEnding}` }).where(eq(profileBusinessData.eMail, email as string));
        }
        if (type === 'banner') {
            await db.update(profileBusinessData).set({ banner: `/uploads/profile/${type}/${userId}.${fileEnding}` }).where(eq(profileBusinessData.eMail, email as string));
        }

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}