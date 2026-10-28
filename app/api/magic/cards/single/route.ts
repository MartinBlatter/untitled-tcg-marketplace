import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";
import { mtgCardidentifiers, mtgCards } from "../../../../../src/db/schema/magic";
import { like, sql, SQL } from 'drizzle-orm';
import { localesStrings } from "@/i18n/config";


export async function GET(request: NextRequest) {
    const searchParams = new URLSearchParams(request.nextUrl.search);
    let uuid = searchParams?.get('uuid') || null;
    const scryfallId = searchParams?.get('scryfallId') || null;
    const locale = searchParams?.get('locale') || null;

    try {
        if (scryfallId) {
            let rows = null;
            [rows] = await db.select().from(mtgCardidentifiers).where(like(mtgCardidentifiers.scryfallId, scryfallId as string));

            uuid = rows.uuid;
        }

        if (!uuid) {
            return NextResponse.json({
                error: true
            }, { status: 500 })
        }

        let rows = null;
        if (locale === 'en') {
            [rows] = await db.select().from(mtgCards).where(like(mtgCards.uuid, uuid as string));
        } else if (locale !== null) {
            const sqlChunks: SQL[] = [];
            sqlChunks.push(sql`SELECT cards.*, cardForeignData.name as foreignName, cardForeignData.text as foreignText, cardForeignData.type as foreignType, cardForeignData.flavorText as foreignFlavorText FROM \`mtg.cards\` as cards`);
            sqlChunks.push(sql`LEFT JOIN \`mtg.cardForeignData\` as cardForeignData ON cards.uuid = cardForeignData.uuid`);
            sqlChunks.push(sql`WHERE cards.uuid = ${uuid}`);
            sqlChunks.push(sql`AND (cardForeignData.language = ${localesStrings[locale]} OR cardForeignData.language IS NULL)`);

            const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));

            [rows] = await db.execute(finalSql);
        }

        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 })
    }
}