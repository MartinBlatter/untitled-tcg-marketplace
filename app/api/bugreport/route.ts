import db from "@/src/db/mysql";
import { bugReportData } from "@/src/db/schema/bugreports";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const values = body.values;

    try {
        await db.insert(bugReportData).values({
            category: values.category,
            title: values.title,
            description: values.description,
            email: values.email,
            status: 'new',
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