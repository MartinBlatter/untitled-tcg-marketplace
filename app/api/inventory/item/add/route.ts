import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";
import { getServerSession } from "@/src/lib/auth/session";
import { like } from "drizzle-orm";
import { inventoryData } from "@/src/db/schema/inventory";
import { profileData } from "@/src/db/schema/user";

export async function POST(
    request: NextRequest
) {
    const session = await getServerSession();
    const body = await request.json();
    if (!body) return NextResponse.json({ error: true }, { status: 500 });

    const type = body.type;
    const foreignKeySource = 'mtg.cards';
    const foreignKey = body.id;
    const price = body.price;
    const quantity = body.quantity;
    const quality = body.quality;
    const language = body.language;
    const comment = body.comment;
    const internalComment = body.internalComment;
    const isFoil = body.isFoil;
    const isAltered = body.isAltered;
    const isSigned = body.isSigned;
    const isMisprint = body.isMisprint;
    const isListed = (body.dontList) ? 0 : 1;
    const isGraded = body.isGraded;
    const grading = body.grading;
    const gradingCompany = body.gradingCompany;

    try {
        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.eMail, session?.user.email as string));
        const userId = rows.id;

        if (!userId) {
            return NextResponse.json({
                error: true
            }, { status: 500 })
        }

        await db.insert(inventoryData).values(
            {
                userId: userId,
                type: type,
                foreignKeySource: foreignKeySource,
                foreignKey: foreignKey,
                price: price,
                quantity: quantity,
                quality: quality,
                language: language,
                comment: comment,
                internalComment: internalComment,
                isFoil: isFoil,
                isAltered: isAltered,
                isSigned: isSigned,
                isMisprint: isMisprint,
                isListed: isListed,
                isGraded: isGraded,
                grading: grading,
                gradingCompany: gradingCompany
            });

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}