import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";
import path from "path";
import { writeFile } from "fs/promises";
import { getServerSession } from "@/src/lib/auth/session";
import { profileData } from "@/src/db/schema/user";
import { and, eq, like } from "drizzle-orm";
import { inventoryData } from "@/src/db/schema/inventory";

export async function POST(
    request: NextRequest
) {
    const session = await getServerSession();
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const name = formData.get("name");
    if (!file) {
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
            path.join(process.cwd(), `public/uploads/singles/${name}.${fileEnding}`),
            buffer
        );

        await db.update(inventoryData).set({ imagePath: `/uploads/singles/${name}.${fileEnding}` }).where(and(eq(inventoryData.id, name as unknown as number), eq(inventoryData.userId, userId)));

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}