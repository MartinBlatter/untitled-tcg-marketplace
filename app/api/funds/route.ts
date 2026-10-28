import db from "@/src/db/mysql";
import { fundsData } from "@/src/db/schema/funds";
import { profileData } from "@/src/db/schema/user";
import { eq, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession();
    const email = session?.user.email;

    if (!email) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }

    const user = await db.select().from(profileData).where(like(profileData.eMail, email as string));
    const funds = await db.select().from(fundsData).where(eq(fundsData.userId, user[0].id));

    if (!funds) {
        await db.insert(fundsData).values({ userId: user[0].id, funds: "0" });
        return NextResponse.json({ success: true, funds: 0 });
    }

    return NextResponse.json({ success: true, funds: funds[0].funds });
}