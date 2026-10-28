import { and, eq, like, sql } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";
import { addressData } from "../../../../src/db/schema/user";

export async function POST(
    request: NextRequest
) {
    const session = await getServerSession();
    const body = await request.json();

    try {
        await db.insert(addressData).values({ address: body.address, eMail: session?.user.email });

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest
) {
    const session = await getServerSession();

    try {
        const [rows] = await db.execute(sql`SELECT id, address FROM address WHERE address.email LIKE ${session?.user.email as string}`);

        return NextResponse.json({
            addresses: rows
        });
    } catch (error) {
        return NextResponse.json({
            error: true
        }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest
) {
    const session = await getServerSession();
    const body = await request.json();
    const id = body.id;

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