import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";
import { sql } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ user: string }> }
) {
    const params = await props.params;
    const name = params.user;
    const searchParams = new URLSearchParams(request.nextUrl.search);
    const size = searchParams?.get('size') || null;
    const page = searchParams?.get('page') || null;
    const sortBy = searchParams?.get('sortBy') || 'name';
    const sortOrder = searchParams?.get('sortOrder') || 'ASC';
    const searchName = searchParams?.get('name') ? `%${searchParams?.get('name')}%` : null;
    const quality = searchParams?.get('quality') || null;
    const language = searchParams?.get('language') || null;
    const set = searchParams?.get('set') || null;
    const rarity = searchParams?.get('rarity') || null;
    const minPrice = searchParams?.get('minPrice') || null;
    const maxPrice = searchParams?.get('maxPrice') || null;
    const isFoil = searchParams?.get('isFoil') || null;
    const isSigned = searchParams?.get('isSigned') || null;
    const isAltered = searchParams?.get('isAltered') || null;
    const isMisprint = searchParams?.get('isMisprint') || null;
    const isGraded = searchParams?.get('isGraded') || null;
    const comment = searchParams?.get('comment') ? `%${searchParams?.get('comment')}%` : null;
    const internalComment = searchParams?.get('internalComment') ? `%${searchParams?.get('internalComment')}%` : null;
    const quantity = searchParams?.get('quantity') || null;

    const columns = {
        name: 'name',
        setCode: 'setCode',
        rarity: 'rarity',
        number: 'number',
        inventoryLanguage: 'inventoryLanguage',
        inventoryComment: 'inventoryComment',
        inventoryQuality: 'inventoryQuality',
        inventoryInternalComment: 'inventoryInternalComment',
        inventoryPrice: 'inventoryPrice',
        inventoryQuantity: 'inventoryQuantity',
    }

    try {
        const query = sql`SELECT \`mtg.inventory\`.\`id\` as inventoryId, \`mtg.inventory\`.\`userId\` as inventoryUserId, \`mtg.inventory\`.\`type\` as inventoryType, \`mtg.inventory\`.\`foreignKeySource\`, \`mtg.inventory\`.\`foreignKey\` as inventoryForeignKey, \`mtg.inventory\`.\`price\` as inventoryPrice, \`mtg.inventory\`.\`quantity\` as inventoryQuantity, \`mtg.inventory\`.\`quality\` as inventoryQuality, \`mtg.inventory\`.\`language\` as inventoryLanguage, \`mtg.inventory\`.\`comment\` as inventoryComment, \`mtg.inventory\`.\`internalComment\` as inventoryInternalComment, \`mtg.inventory\`.\`isFoil\` as inventoryIsFoil, \`mtg.inventory\`.\`isAltered\` as inventoryIsAltered, \`mtg.inventory\`.\`isSigned\` as inventoryIsSigned, \`mtg.inventory\`.\`isMisprint\` as inventoryIsMisprint, \`mtg.inventory\`.\`isSealed\` as inventoryIsSealed, \`mtg.inventory\`.\`isListed\` as inventoryIsListed, \`mtg.inventory\`.\`isGraded\` as inventoryIsGraded, \`mtg.inventory\`.\`grading\` as inventoryGrading, \`mtg.inventory\`.\`gradingCompany\` as inventoryGradingCompany, \`mtg.inventory\`.\`imagePath\` as inventoryImagePath, \`mtg.inventory\`.\`updatedAt\` as inventoryUpdatedAt, \`mtg.inventory\`.\`createdAt\` as inventoryCreatedAt, \`mtg.inventory\`.\`deactivatedAt\` as inventoryDeactivatedAt, cards.* FROM \`mtg.inventory\` LEFT JOIN \`mtg.cards\` as cards ON \`mtg.inventory\`.foreignKey = cards.uuid LEFT JOIN profiledata ON \`mtg.inventory\`.userId = profiledata.id WHERE profiledata.userName LIKE ${name}`;
        const countQuery = sql`SELECT count(\`mtg.inventory\`.\`id\`) as count FROM \`mtg.inventory\` LEFT JOIN \`mtg.cards\` as cards ON \`mtg.inventory\`.foreignKey = cards.uuid LEFT JOIN profiledata ON \`mtg.inventory\`.userId = profiledata.id WHERE profiledata.userName LIKE ${name}`;
        query.append(sql` AND \`mtg.inventory\`.\`isListed\` = 1`);
        countQuery.append(sql` AND \`mtg.inventory\`.\`isListed\` = 1`);

        if (searchName) {
            query.append(sql` AND cards.name LIKE ${searchName}`);
            countQuery.append(sql` AND cards.name LIKE ${searchName}`);
        }

        if (quality) {
            const qualities = quality.split(',');
            query.append(sql` AND \`mtg.inventory\`.quality IN ${qualities}`);
            countQuery.append(sql` AND \`mtg.inventory\`.quality IN ${qualities}`);
        }

        if (language) {
            const languages = language.split(',');
            query.append(sql` AND \`mtg.inventory\`.language IN ${languages}`);
            countQuery.append(sql` AND \`mtg.inventory\`.language IN ${languages}`);
        }

        if (set) {
            const sets = set.split(',');
            query.append(sql` AND cards.setCode IN ${sets}`);
            countQuery.append(sql` AND cards.setCode IN ${sets}`);
        }

        if (rarity) {
            const rarities = rarity.split(',');
            query.append(sql` AND cards.rarity IN ${rarities}`);
            countQuery.append(sql` AND cards.rarity IN ${rarities}`);
        }

        if (minPrice) {
            query.append(sql` AND \`mtg.inventory\`.price >= ${minPrice}`);
            countQuery.append(sql` AND \`mtg.inventory\`.price >= ${minPrice}`);
        }

        if (maxPrice) {
            query.append(sql` AND \`mtg.inventory\`.price <= ${maxPrice}`);
            countQuery.append(sql` AND \`mtg.inventory\`.price <= ${maxPrice}`);
        }

        if (isFoil === '1') {
            query.append(sql` AND \`mtg.inventory\`.\`isFoil\` = 1`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isFoil\` = 1`);
        }
        if (isFoil === '0') {
            query.append(sql` AND \`mtg.inventory\`.\`isFoil\` = 0`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isFoil\` = 0`);
        }

        if (isAltered === '1') {
            query.append(sql` AND \`mtg.inventory\`.\`isAltered\` = 1`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isAltered\` = 1`);
        }
        if (isAltered === '0') {
            query.append(sql` AND \`mtg.inventory\`.\`isAltered\` = 0`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isAltered\` = 0`);
        }

        if (isMisprint === '1') {
            query.append(sql` AND \`mtg.inventory\`.\`isMisprint\` = 1`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isMisprint\` = 1`);
        }
        if (isMisprint === '0') {
            query.append(sql` AND \`mtg.inventory\`.\`isMisprint\` = 0`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isMisprint\` = 0`);
        }

        if (isGraded === '1') {
            query.append(sql` AND \`mtg.inventory\`.\`isGraded\` = 1`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isGraded\` = 1`);
        }
        if (isGraded === '0') {
            query.append(sql` AND \`mtg.inventory\`.\`isGraded\` = 0`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isGraded\` = 0`);
        }

        if (isSigned === '1') {
            query.append(sql` AND \`mtg.inventory\`.\`isSigned\` = 1`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isSigned\` = 1`);
        }
        if (isSigned === '0') {
            query.append(sql` AND \`mtg.inventory\`.\`isSigned\` = 0`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`isSigned\` = 0`);
        }

        if (comment) {
            query.append(sql` AND \`mtg.inventory\`.\`comment\` LIKE ${comment}`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`comment\` LIKE ${comment}`);
        }

        if (internalComment) {
            query.append(sql` AND \`mtg.inventory\`.\`internalComment\` LIKE ${internalComment}`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`internalComment\` LIKE ${internalComment}`);
        }

        if (quantity) {
            query.append(sql` AND \`mtg.inventory\`.\`quantity\` = ${quantity}`);
            countQuery.append(sql` AND \`mtg.inventory\`.\`quantity\` = ${quantity}`);
        }

        query.append(sql` ORDER BY ${sql.raw(columns[sortBy as keyof typeof columns])} ${sql.raw(sortOrder === 'desc' ? 'DESC' : 'ASC')}`);

        if (page && size) {
            query.append(sql` LIMIT ${parseInt(size)} OFFSET ${((parseInt(page) - 1) * parseInt(size))}`);
        }

        const [count] = await db.execute(countQuery);
        const [rows] = await db.execute(query);
        return NextResponse.json({ inventory: rows, count: (count as any)[0].count, success: true });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error,
            inventory: {}
        }, { status: 500 })
    }
}