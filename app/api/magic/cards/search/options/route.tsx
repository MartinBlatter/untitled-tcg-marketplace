import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../src/db/mysql";
import { mtgCards } from '../../../../../../src/db/schema/magic';
import { splitTrimUniqArray } from "@/src/utils/helpers";
import { mtgSets } from "@/drizzle/schema";

export async function GET(request: NextRequest) {

    try {

        const typeResult = await db.selectDistinct({ value: mtgCards.types }).from(mtgCards);
        const types = splitTrimUniqArray(typeResult);

        const subtypeResult = await db.selectDistinct({ value: mtgCards.subtypes }).from(mtgCards);
        const subtypes = splitTrimUniqArray(subtypeResult);

        const keywordResult = await db.selectDistinct({ value: mtgCards.keywords }).from(mtgCards);
        const keywords = splitTrimUniqArray(keywordResult);

        const sets = await db.select({ code: mtgSets.code, name: mtgSets.name }).from(mtgSets);

        const filters = {
            types: types,
            subtypes: subtypes,
            keywords: keywords,
            sets: sets
        }

        return NextResponse.json(filters);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 })
    }
}