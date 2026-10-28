import { SQL, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { localesStrings } from '../../../../../i18n/config';
import db from '../../../../../src/db/mysql';
import { columns, formatMap, logicMap } from './constants';
import { FormatString, LogicString } from './types';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const search = body.name === '' ? '%' : `%${body.name}%`;
    const text = body.text === '' ? '%' : `%${body.text}%`;
    const types = body.types;
    const subtypes = body.subtypes;
    const colors = body.colors;
    const manaCost = body.manaCost;
    const formats = body.formats;
    const formatsLogic = body.formatsLogic;
    const sets = body.sets;
    const rarity = body.rarity;
    const keywords = body.keywords;
    const artist = body.artist === '' ? '%' : `%${body.artist}%`;
    const flavorText = body.flavorText === '' ? '%' : `%${body.flavorText}%`;
    const loyalty = body.loyalty;
    const power = body.power;
    const toughness = body.toughness;
    const manaValue = body.manaValue;
    const loyaltyLogic = body.loyaltyLogic;
    const powerLogic = body.powerLogic;
    const toughnessLogic = body.toughnessLogic;
    const manaValueLogic = body.manaValueLogic;
    const page = body.page;
    const pageSize = body.pageSize;
    const locale = body.locale;
    const sortBy = body.sortBy || 'name';
    const sortOrder = body.sortOrder;
    // TODO: implement price range
    const priceMin = body.priceMin;
    const priceMax = body.priceMax;

    try {
        const sqlChunks: SQL[] = [];
        const sqlCountChunks: SQL[] = [];

        if (locale === 'en') {
            sqlChunks.push(sql`SELECT cards.* FROM \`mtg.cards\` as cards WHERE cards.name LIKE ${search}`);
            sqlCountChunks.push(sql`SELECT count(cards.id) as count FROM \`mtg.cards\` as cards WHERE cards.name LIKE ${search}`);
        } else {
            sqlChunks.push(sql`SELECT cards.*, cardForeignData.name as foreignName FROM \`mtg.cards\` as cards`);
            sqlChunks.push(sql`LEFT JOIN \`mtg.cardLegalities\` as cardLegalities ON cards.uuid = cardLegalities.uuid`);
            sqlChunks.push(sql`LEFT JOIN \`mtg.cardForeignData\` as cardForeignData ON cards.uuid = cardForeignData.uuid`);
            sqlChunks.push(sql`AND (cardForeignData.language = ${localesStrings[locale]} OR cardForeignData.language IS NULL)`);
            sqlChunks.push(sql`WHERE (cards.name LIKE ${search} OR cardForeignData.name LIKE ${search})`);
            sqlCountChunks.push(sql`SELECT count(cards.uuid) as count FROM \`mtg.cards\` as cards`);
            sqlCountChunks.push(sql`LEFT JOIN \`mtg.cardLegalities\` as cardLegalities ON cards.uuid = cardLegalities.uuid`);
            sqlCountChunks.push(sql`LEFT JOIN \`mtg.cardForeignData\` as cardForeignData ON cards.uuid = cardForeignData.uuid`);
            sqlCountChunks.push(sql`AND (cardForeignData.language = ${localesStrings[locale]} OR cardForeignData.language IS NULL)`);
            sqlCountChunks.push(sql`WHERE (cards.name LIKE ${search} OR cardForeignData.name LIKE ${search})`);
        }

        if (body.text !== '') {
            if (locale === 'en') {
                sqlChunks.push(sql`AND cards.text LIKE ${text}`);
                sqlCountChunks.push(sql`AND cards.text LIKE ${text}`);
            } else {
                sqlChunks.push(sql`AND (cards.text LIKE ${text} OR cardForeignData.text LIKE ${text})`);
                sqlCountChunks.push(sql`AND (cards.text LIKE ${text} OR cardForeignData.text LIKE ${text})`);
            }
        }

        if (body.flavorText !== '') {
            if (locale === 'en') {
                sqlChunks.push(sql`AND cards.flavorText LIKE ${flavorText}`);
                sqlCountChunks.push(sql`AND cards.flavorText LIKE ${flavorText}`);
            } else {
                sqlChunks.push(sql`AND (cards.flavorText LIKE ${flavorText} OR cardForeignData.flavorText LIKE ${flavorText})`);
                sqlCountChunks.push(sql`AND (cards.flavorText LIKE ${flavorText} OR cardForeignData.flavorText LIKE ${flavorText})`);
            }
        }

        if (body.artist !== '') {
            sqlChunks.push(sql`AND cards.artist LIKE ${artist}`);
            sqlCountChunks.push(sql`AND cards.artist LIKE ${artist}`);
        }

        if (sets.length > 0) {
            const setCodes: string[] = [];
            sets.map((set: { code: string; name: string }) => {
                setCodes.push(set.code);
            });
            if (setCodes.length > 0) {
                sqlChunks.push(sql`AND cards.setCode IN ${setCodes}`);
                sqlCountChunks.push(sql`AND cards.setCode IN ${setCodes}`);
            }
        }

        sqlChunks.push(sql`AND cards.availability LIKE "%paper%"`);
        sqlCountChunks.push(sql`AND cards.availability LIKE "%paper%"`);

        if (rarity.length > 0) {
            sqlChunks.push(sql`AND cards.rarity IN ${rarity}`);
            sqlCountChunks.push(sql`AND cards.rarity IN ${rarity}`);
        }

        if (types.length > 0) {
            const typeSearch = `%${types[0]}%`;
            sqlChunks.push(sql`AND (cards.type LIKE ${typeSearch}`);
            sqlCountChunks.push(sql`AND (cards.type LIKE ${typeSearch}`);
            for (let i = 1; i < types.length; i++) {
                const typeSearch = `%${types[i]}%`;
                sqlChunks.push(sql`or cards.type LIKE ${typeSearch}`);
                sqlCountChunks.push(sql`or cards.type LIKE ${typeSearch}`);
            }
            sqlChunks.push(sql`)`);
            sqlCountChunks.push(sql`)`);
        }

        if (subtypes.length > 0) {
            const subtypeSearch = `%${subtypes[0]}%`;
            sqlChunks.push(sql`AND (cards.subtypes LIKE ${subtypeSearch}`);
            sqlCountChunks.push(sql`AND (cards.subtypes LIKE ${subtypeSearch}`);
            for (let i = 1; i < subtypes.length; i++) {
                const subtypeSearch = `%${subtypes[i]}%`;
                sqlChunks.push(sql`or cards.subtypes LIKE ${subtypeSearch}`);
                sqlCountChunks.push(sql`or cards.subtypes LIKE ${subtypeSearch}`);
            }
            sqlChunks.push(sql`)`);
            sqlCountChunks.push(sql`)`);
        }

        if (keywords.length > 0) {
            const keywordSearch = `%${keywords[0]}%`;
            sqlChunks.push(sql`AND (cards.keywords LIKE ${keywordSearch}`);
            sqlCountChunks.push(sql`AND (cards.keywords LIKE ${keywordSearch}`);
            for (let i = 1; i < keywords.length; i++) {
                const keywordSearch = `%${keywords[i]}%`;
                sqlChunks.push(sql`or cards.keywords LIKE ${keywordSearch}`);
                sqlCountChunks.push(sql`or cards.keywords LIKE ${keywordSearch}`);
            }
            sqlChunks.push(sql`)`);
            sqlCountChunks.push(sql`)`);
        }

        if (manaCost !== '') {
            sqlChunks.push(sql`AND cards.manaCost = ${manaCost}`);
            sqlCountChunks.push(sql`AND cards.manaCost = ${manaCost}`);
        }

        if (colors.length > 0) {
            if (colors[0] === 'C') {
                sqlChunks.push(sql`AND (cards.colors LIKE ''`);
                sqlCountChunks.push(sql`AND (cards.colors LIKE ''`);
            } else {
                sqlChunks.push(sql`AND (find_in_set(${colors[0]}, cards.colors) > 0`);
                sqlCountChunks.push(sql`AND (find_in_set(${colors[0]}, cards.colors) > 0`);
            }
            for (let i = 1; i < colors.length; i++) {
                if (colors[i] === 'C') {
                    sqlChunks.push(sql`or (cards.colors) LIKE ''`);
                    sqlCountChunks.push(sql`or (cards.colors) LIKE ''`);
                } else {
                    sqlChunks.push(sql`or find_in_set(${colors[i]}, cards.colors) > 0`);
                    sqlCountChunks.push(sql`or find_in_set(${colors[i]}, cards.colors) > 0`);
                }
            }
            sqlChunks.push(sql`)`);
            sqlCountChunks.push(sql`)`);
        }

        if (formats.length > 0) {
            formats.forEach((element: FormatString) => {
                const columnName = formatMap[element] || '';
                if (columnName !== '') {
                    sqlChunks.push(sql`AND cardLegalities.${sql.raw(columnName)} LIKE ${formatsLogic}`);
                    sqlCountChunks.push(sql`AND cardLegalities.${sql.raw(columnName)} LIKE ${formatsLogic}`);
                }
            });
        }

        if (manaValue !== '') {
            const logic = logicMap[manaValueLogic as LogicString] || '';
            if (logic !== '') {
                sqlChunks.push(sql`AND cards.manaValue ${sql.raw(logic)} ${manaValue}`);
                sqlCountChunks.push(sql`AND cards.manaValue ${sql.raw(logic)} ${manaValue}`);
            }
        }

        if (power !== '') {
            const logic = logicMap[powerLogic as LogicString] || '';
            if (logic !== '') {
                sqlChunks.push(sql`AND cards.power ${sql.raw(logic)} ${power}`);
                sqlCountChunks.push(sql`AND cards.power ${sql.raw(logic)} ${power}`);
            }
        }

        if (toughness !== '') {
            const logic = logicMap[toughnessLogic as LogicString] || '';
            if (logic !== '') {
                sqlChunks.push(sql`AND cards.toughness ${sql.raw(logic)} ${toughness}`);
                sqlCountChunks.push(sql`AND cards.toughness ${sql.raw(logic)} ${toughness}`);
            }
        }

        if (loyalty !== '') {
            const logic = logicMap[loyaltyLogic as LogicString] || '';
            if (logic !== '') {
                sqlChunks.push(sql`AND cards.loyalty ${sql.raw(logic)} ${loyalty}`);
                sqlCountChunks.push(sql`AND cards.loyalty ${sql.raw(logic)} ${loyalty}`);
            }
        }

        sqlChunks.push(sql` ORDER BY ${sql.raw(columns[sortBy as keyof typeof columns])} ${sql.raw(sortOrder === 'desc' ? 'DESC' : 'ASC')}`);

        if (pageSize && page) {
            sqlChunks.push(sql`LIMIT ${parseInt(pageSize)} OFFSET ${(parseInt(page) - 1) * parseInt(pageSize)}`);
        }

        const finalSqlCount: SQL = sql.join(sqlCountChunks, sql.raw(' '));
        const [count] = await db.execute(finalSqlCount);

        const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
        const [rows] = await db.execute(finalSql);

        return NextResponse.json({ count: count, cards: rows });
    } catch (error) {
        return NextResponse.json(
            {
                error: error,
            },
            { status: 500 }
        );
    }
}
