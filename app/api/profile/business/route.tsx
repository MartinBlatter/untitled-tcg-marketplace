import { NextRequest, NextResponse } from "next/server";
import { like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { profileBusinessData } from "@/src/db/schema/user";
import db from "@/src/db/mysql";

export async function GET(
    request: NextRequest,
) {
    const session = await getServerSession();
    const email = session?.user.email;

    if (!email) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }

    try {
        let rows = null;
        [rows] = await db.select().from(profileBusinessData).where(like(profileBusinessData.eMail, email as string));
        rows = rows || {};
        return NextResponse.json({ business: rows, success: true });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error,
            user: {}
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    const email = session?.user.email;
    const body = await request.json();
    const name = body.name;
    const description = body.description;
    const imprint = body.imprint;
    const terms = body.terms;
    const privacy = body.privacy;
    const revocation = body.revocation;

    if (!email) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }

    try {
        await db.update(profileBusinessData).set({
            name: name,
            description: description,
            imprint: imprint,
            terms: terms,
            privacy: privacy,
            revocation: revocation
        }).where(like(profileBusinessData.eMail, email as string));

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error,
            user: {}
        }, { status: 500 });
    }
}
