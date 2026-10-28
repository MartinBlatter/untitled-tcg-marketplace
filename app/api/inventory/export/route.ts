import { sql } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";

export async function GET(
  request: NextRequest,
) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const scope = searchParams.get('scope') || 'all';
  const filter = searchParams.get('filter') || 'all';
  const filters = searchParams.get('filters') ? JSON.parse(searchParams.get('filters') || '') : null;

  // Update CSV content header to include all cardIdentifiers columns
  let csvContent = "UUID,name,Type,Price,Quantity,Quality,Language,Comment,InternalComment,IsFoil,IsAltered,IsSigned,IsMisprint,IsSealed,IsListed,IsGraded,GradingCompany,Grading,cardKingdomEtchedId,cardKingdomFoilId,cardKingdomId,cardsphereFoilId,cardsphereId,mcmId,mcmMetaId,mtgArenaId,mtgjsonFoilVersionId,mtgjsonNonFoilVersionId,mtgjsonV4Id,mtgoFoilId,mtgoId,multiverseId,scryfallCardBackId,scryfallId,scryfallIllustrationId,scryfallOracleId,tcgplayerEtchedProductId,tcgplayerProductId\n";
  
  try {
    const email = session.user.email;
    
    // Fix the SQL query by removing the extra comma after `mtg.cards.*`
    const query = sql`SELECT \`mtg.inventory\`.*, \`mtg.cardIdentifiers\`.*, \`mtg.cards\`.name as mtgCardsName 
      FROM \`mtg.inventory\` 
      LEFT JOIN profiledata ON \`mtg.inventory\`.userId = profiledata.id 
      LEFT JOIN \`mtg.cardIdentifiers\` ON \`mtg.inventory\`.foreignKey = \`mtg.cardIdentifiers\`.uuid
      LEFT JOIN \`mtg.cards\` ON \`mtg.inventory\`.foreignKey = \`mtg.cards\`.uuid 
      WHERE profiledata.eMail LIKE ${email}`;
    
    // Add scope filter (all, listed, unlisted)
    if (scope === 'listed') {
      query.append(sql` AND \`mtg.inventory\`.\`isListed\` = 1`);
    } else if (scope === 'unlisted') {
      query.append(sql` AND \`mtg.inventory\`.\`isListed\` = 0`);
    }
        
    // Apply filter parameter 
    // 'all' = ignore any client-side filters
    // 'current' = apply the current search/filter parameters from the URL
    if (filter === 'current') {
    // Apply filters parameter if provided
    if (filters) {
      if (filters.name) {
        query.append(sql` AND \`mtg.inventory\`.\`type\` LIKE ${`%${filters.name}%`}`);
      }
      if (filters.quality?.length) {
        query.append(sql` AND \`mtg.inventory\`.\`quality\` IN (${filters.quality.map((q: string) => `'${q}'`).join(',')})`);
      }
      if (filters.language?.length) {
        const languages = filters.language.map((l: string) => `'${l}'}`).join(',');
        query.append(sql` AND \`mtg.inventory\`.\`language\` IN (${sql.raw(languages)})`);
      }
      if (filters.set?.length) {
        query.append(sql` AND \`mtg.inventory\`.\`set\` IN (${filters.set.map((s: string) => `'${s}'}`).join(',')})`);
      }
      if (filters.rarity?.length) {
        query.append(sql` AND \`mtg.inventory\`.\`rarity\` IN (${filters.rarity.map((r: string) => `'${r}'}`).join(',')})`);
      }
      if (filters.minPrice) {
        query.append(sql` AND \`mtg.inventory\`.\`price\` >= ${filters.minPrice}`);
      }
      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(maxPrice)) {
          query.append(sql` AND \`mtg.inventory\`.\`price\` <= ${maxPrice}`);
        }
      }
      if (filters.isFoil) {
        query.append(sql` AND \`mtg.inventory\`.\`isFoil\` = ${filters.isFoil === '1' ? 1 : 0}`);
      }
      if (filters.isSigned) {
        query.append(sql` AND \`mtg.inventory\`.\`isSigned\` = ${filters.isSigned === '1' ? 1 : 0}`);
      }
      if (filters.isAltered) {
        query.append(sql` AND \`mtg.inventory\`.\`isAltered\` = ${filters.isAltered === '1' ? 1 : 0}`);
      }
      if (filters.isMisprint) {
        query.append(sql` AND \`mtg.inventory\`.\`isMisprint\` = ${filters.isMisprint === '1' ? 1 : 0}`);
      }
      if (filters.isGraded) {
        query.append(sql` AND \`mtg.inventory\`.\`isGraded\` = ${filters.isGraded === '1' ? 1 : 0}`);
      }
      if (filters.comment) {
        query.append(sql` AND \`mtg.inventory\`.\`comment\` LIKE ${`%${filters.comment}%`}`);
      }
      if (filters.internalComment) {
        query.append(sql` AND \`mtg.inventory\`.\`internalComment\` LIKE ${`%${filters.internalComment}%`}`);
      }
      if (filters.quantity) {
        query.append(sql` AND \`mtg.inventory\`.\`quantity\` = ${filters.quantity}`);
      }
    }
    }
    
    query.append(sql` GROUP BY \`mtg.inventory\`.\`id\``);

    console.log('Filters:', filters);
    console.log('Constructed Query:', query.toString());

    const [rows] = await db.execute(query);
    // Fix: Ensure rows is properly typed as an array of inventory items
    const items = Array.isArray(rows) ? rows : [];
    
    // Update CSV row generation to include all cardIdentifiers columns
    for (const item of items) {
      const csvRow = [
        item.uuid,
        `"${(item.mtgCardsName || '').replace(/"/g, '""')}"`,
        item.type,
        item.price,
        item.quantity,
        item.quality,
        item.language,
        // Escape quotes in text fields
        `"${(item.comment || '').replace(/"/g, '""')}"`,
        `"${(item.internalComment || '').replace(/"/g, '""')}"`,
        item.isFoil,
        item.isAltered,
        item.isSigned,
        item.isMisprint,
        item.isSealed,
        item.isListed,
        item.isGraded,
        item.gradingCompany || '',
        item.grading || '',
        item.cardKingdomEtchedId || '',
        item.cardKingdomFoilId || '',
        item.cardKingdomId || '',
        item.cardsphereFoilId || '',
        item.cardsphereId || '',
        item.mcmId || '',
        item.mcmMetaId || '',
        item.mtgArenaId || '',
        item.mtgjsonFoilVersionId || '',
        item.mtgjsonNonFoilVersionId || '',
        item.mtgjsonV4Id || '',
        item.mtgoFoilId || '',
        item.mtgoId || '',
        item.multiverseId || '',
        item.scryfallCardBackId || '',
        item.scryfallId || '',
        item.scryfallIllustrationId || '',
        item.scryfallOracleId || '',
        item.tcgplayerEtchedProductId || '',
        item.tcgplayerProductId || ''
      ].join(',');
      
      csvContent += csvRow + "\n";
    }
    
    // Set headers for CSV download
    const headers = {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="inventory-export-${new Date().toISOString()}.csv"`,
    };
    
    return new NextResponse(csvContent, { headers });
    
  } catch (error) {
    console.error('Error generating inventory export:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}