import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../src/db/mysql";
import { localesStrings } from "../../../../../../i18n/config";
import { SQL, sql } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ locale: string, search: string }> }
) {
    const params = await props.params;
    const search = params.search === '%' ? params.search : `%${params.search}%`;
    const locale = params.locale;
    const searchParams = new URLSearchParams(request.nextUrl.search);
    const size = searchParams?.get('size') || null;
    const page = searchParams?.get('page') || null;
    const set = searchParams?.get('set') || null;
    const sortBy = searchParams?.get('sortBy') || 'name';
    const sortOrder = searchParams?.get('sortOrder') || 'asc';
    const filterRarity = searchParams?.get('filterrarity') || null;
    const filterType = searchParams?.get('filtertype') ? `%${searchParams?.get('filtertype')}%` : null;
    const filterSet = searchParams?.get('filterset') || null;

    const columns = {
        name: 'name',
        setCode: 'setCode',
        rarity: 'rarity',
        number: 'number',
    }

    try {
        const sqlChunks: SQL[] = [];
        const sqlCountChunks: SQL[] = [];

        if (locale === 'en') {
            sqlChunks.push(sql`SELECT cards.* FROM \`mtg.cards\` as cards WHERE cards.name LIKE ${search}`);
            sqlCountChunks.push(sql`SELECT count(cards.id) as count FROM \`mtg.cards\` as cards WHERE cards.name LIKE ${search}`);
        }
        else {
            sqlChunks.push(sql`SELECT cards.*, cardForeignData.name as foreignName FROM \`mtg.cards\` as cards`);
            sqlChunks.push(sql`LEFT JOIN \`mtg.cardForeignData\` as cardForeignData ON cards.uuid = cardForeignData.uuid`);
            sqlChunks.push(sql`AND (cardForeignData.language = ${localesStrings[locale]} OR cardForeignData.language IS NULL)`);
            sqlChunks.push(sql`WHERE (cards.name LIKE ${search} OR cardForeignData.name LIKE ${search})`);
            sqlCountChunks.push(sql`SELECT count(cards.uuid) as count FROM \`mtg.cards\` as cards`);
            sqlCountChunks.push(sql`LEFT JOIN \`mtg.cardForeignData\` as cardForeignData ON cards.uuid = cardForeignData.uuid`);
            sqlCountChunks.push(sql`AND (cardForeignData.language = ${localesStrings[locale]} OR cardForeignData.language IS NULL)`);
            sqlCountChunks.push(sql`WHERE (cards.name LIKE ${search} OR cardForeignData.name LIKE ${search})`);
        }
        if (set) {
            sqlChunks.push(sql`AND cards.setCode = ${set}`);
            sqlCountChunks.push(sql`AND cards.setCode = ${set}`);
        }

        sqlChunks.push(sql`AND cards.availability LIKE "%paper%"`);
        sqlCountChunks.push(sql`AND cards.availability LIKE "%paper%"`);

        if (filterRarity) {
            sqlChunks.push(sql`AND cards.rarity = ${filterRarity}`);
            sqlCountChunks.push(sql`AND cards.rarity = ${filterRarity}`);
        }

        if (filterType) {
            sqlChunks.push(sql`AND cards.type LIKE ${filterType}`);
            sqlCountChunks.push(sql`AND cards.type LIKE ${filterType}`);
        }

        if (filterSet) {
            sqlChunks.push(sql`AND cards.setCode = ${filterSet}`);
            sqlCountChunks.push(sql`AND cards.setCode = ${filterSet}`);
        }

        sqlChunks.push(sql` ORDER BY ${sql.raw(columns[sortBy as keyof typeof columns])} ${sql.raw(sortOrder === 'desc' ? 'DESC' : 'ASC')}`);

        if (size && page) {
            sqlChunks.push(sql`LIMIT ${parseInt(size)} OFFSET ${((parseInt(page) - 1) * parseInt(size))}`);
        }

        const finalSqlCount: SQL = sql.join(sqlCountChunks, sql.raw(' '));
        const [count] = await db.execute(finalSqlCount);

        const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
        const [rows] = await db.execute(finalSql);

        return NextResponse.json({ count: count, cards: rows });
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 })
    }
}