import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";
import { getServerSession } from "@/src/lib/auth/session";
import { eq, like } from "drizzle-orm";
import { inventoryData } from "@/src/db/schema/inventory";
import { profileData } from "@/src/db/schema/user";

export async function POST(
    request: NextRequest
) {
    const session = await getServerSession();
    const body = await request.json();
    const id = body.id;

    try {
        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, session?.user.email as string));
        const userId = rows.id;

        if (!userId) {
            return NextResponse.json({
                error: true
            }, { status: 500 })
        }

        [rows] = await db.select({ userId: inventoryData.userId, type: inventoryData.type, foreignKeySource: inventoryData.foreignKeySource, foreignKey: inventoryData.foreignKey, price: inventoryData.price, quantity: inventoryData.quantity, quality: inventoryData.quality, language: inventoryData.language, comment: inventoryData.comment, internalComment: inventoryData.internalComment, isFoil: inventoryData.isFoil, isAltered: inventoryData.isAltered, isSigned: inventoryData.isSigned, isMisprint: inventoryData.isMisprint, isSealed: inventoryData.isSealed, isListed: inventoryData.isListed, isGraded: inventoryData.isGraded, grading: inventoryData.grading, gradingCompany: inventoryData.gradingCompany }).from(inventoryData).where(eq(inventoryData.id, id));
        await db.insert(inventoryData).values({ ...rows });

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}