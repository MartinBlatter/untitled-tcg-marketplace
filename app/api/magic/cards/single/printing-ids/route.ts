import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../src/db/mysql";
import { SQL, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    const searchParams = new URLSearchParams(request.nextUrl.search);
    const printings = searchParams?.get('printings')?.split(', ') || null;
    const name = searchParams?.get('name') || null;

    const sqlChunks: SQL[] = [];
    sqlChunks.push(sql`SELECT * FROM \`mtg.cards\` as cards WHERE (`);

    try {
        printings?.forEach((set, index) => {
            sqlChunks.push(sql`setCode = ${set}`);
            if (index < (printings.length - 1)) {
                sqlChunks.push(sql`or`);
            }
        })
        sqlChunks.push(sql`)`);
        sqlChunks.push(sql`AND availability LIKE "%paper%"`);
        sqlChunks.push(sql`AND name = ${name}`);
        const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
        const [rows] = await db.execute(finalSql);

        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 })
    }
}