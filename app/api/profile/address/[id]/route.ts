import db from "@/src/db/mysql";
import { addressData } from "@/src/db/schema/user";
import { and, eq, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    const params = await props.params;
    const id = parseInt(params.id, 10);

    try {
        await db.delete(addressData).where(and(eq(addressData.id, id), like(addressData.eMail, session?.user.email as string)));

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}
