import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";
import { like, eq } from "drizzle-orm";
import { profileBusinessData, profileData } from "../../../../../src/db/schema/user";
import { inventoryData } from "@/src/db/schema/inventory";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ userName: string }> }
) {
    const params = await props.params;
    const name = params.userName;

    try {
        let rows = null;
        [rows] = await db.select().from(profileData).where(like(profileData.userName, name as string));
        rows = rows || {};

        let companyRows = null;
        [companyRows] = await db.select().from(profileBusinessData).where(like(profileBusinessData.eMail, rows.eMail as string));
        companyRows = companyRows || {};

        let inventoryCategoryRows = null;
        [inventoryCategoryRows] = await db.selectDistinct({ type: inventoryData.type }).from(inventoryData).where(eq(inventoryData.userId, rows.id));

        return NextResponse.json({ user: rows, company: companyRows, categories: inventoryCategoryRows, success: true });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error,
            user: {}
        }, { status: 500 })
    }
}