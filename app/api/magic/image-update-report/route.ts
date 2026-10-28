import { sql } from "drizzle-orm";
import { requireRole } from "@/src/lib/auth/dal";
import { ROLES } from "@/src/lib/auth/roles";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";

interface ComparisonResult {
  uuid: string;
  name: string;
  setCode: string;
  number: string;
  oldUuid: string | null;
  scryfallId: string | null;
  type: "changed" | "new";
}

interface SetCodeRow {
  setCode: string;
}

/**
 * Generates a CSV string from a list of card comparison results
 */
function generateCsv(cards: ComparisonResult[]): string {
  // Create CSV header
  const headers = ['Name', 'SetCode', 'Number', 'OldUUID', 'NewUUID', 'ScryfallID', 'Type'];
  let csvContent = headers.join(',') + '\n';
  
  // Add each record as a row
  cards.forEach(card => {
    const values = [
      escapeForCsv(card.name),
      escapeForCsv(card.setCode),
      escapeForCsv(card.number),
      card.oldUuid || '',
      card.uuid,
      card.scryfallId || '',
      card.type
    ];
    csvContent += values.join(',') + '\n';
  });
  
  return csvContent;
}

/**
 * Escapes special characters in CSV values
 */
function escapeForCsv(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  // If value contains commas, quotes, or newlines, wrap in quotes and escape any quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Processes cards in smaller chunks to avoid connection timeouts
 */
async function processSetCodes(limit: number = 10): Promise<{changedCards: ComparisonResult[], newCards: ComparisonResult[]}> {
  // First get all unique setCodes to process in chunks
  const [setCodesResult] = await db.execute(sql`
    SELECT DISTINCT setCode 
    FROM \`mtg.cards\` 
    ORDER BY setCode
  `);
  
  // Convert the result to a properly typed array
  const setCodes: SetCodeRow[] = Array.isArray(setCodesResult) 
    ? setCodesResult.map((row: any) => ({ setCode: row.setCode || '' }))
    : [];
  
  console.log(`[${new Date().toISOString()}] Found ${setCodes.length} unique set codes to process`);
  
  const changedCards: ComparisonResult[] = [];
  const newCards: ComparisonResult[] = [];
  
  // Process setCodes in chunks to avoid timeout
  for (let i = 0; i < setCodes.length; i += limit) {
    const chunk = setCodes.slice(i, i + limit);
    const setCodesArray: string[] = chunk.map((row: SetCodeRow) => row.setCode).filter(Boolean);
    
    if (setCodesArray.length === 0) continue;
    
    console.log(`[${new Date().toISOString()}] Processing sets ${i+1} to ${i+Math.min(limit, setCodes.length-i)} of ${setCodes.length} (${setCodesArray.join(', ')})`);
    
    try {
      // Get changed cards for this chunk of setCodes
      const [changedResultsRaw] = await db.execute(sql`
        SELECT 
          n.uuid, 
          n.name, 
          n.setCode, 
          n.number, 
          o.uuid as oldUuid,
          ci.scryfallId,
          'changed' as type
        FROM 
          \`mtg.cards\` n
        INNER JOIN 
          \`old_mtg.cards\` o 
        ON 
          n.setCode = o.setCode 
          AND n.number = o.number
          AND n.name = o.name
        LEFT JOIN
          \`mtg.cardIdentifiers\` ci
        ON
          n.uuid = ci.uuid
        WHERE 
          n.uuid != o.uuid
          AND n.setCode IN (${sql.join(setCodesArray.map((code: string) => sql`${code}`), sql`, `)})
      `);
      
      // Convert raw results to typed array
      const changedResults: any[] = Array.isArray(changedResultsRaw) ? changedResultsRaw : [];
      
      changedResults.forEach((row: any) => {
        changedCards.push({
          uuid: row.uuid || '',
          name: row.name || '',
          setCode: row.setCode || '',
          number: row.number || '',
          oldUuid: row.oldUuid || null,
          scryfallId: row.scryfallId || null,
          type: 'changed' as const
        });
      });
      
      // Get new cards for this chunk of setCodes
      const [newResultsRaw] = await db.execute(sql`
        SELECT 
          n.uuid, 
          n.name, 
          n.setCode, 
          n.number, 
          NULL as oldUuid,
          ci.scryfallId,
          'new' as type
        FROM 
          \`mtg.cards\` n
        LEFT JOIN 
          \`old_mtg.cards\` o 
        ON 
          n.setCode = o.setCode 
          AND n.number = o.number
          AND n.name = o.name
        LEFT JOIN
          \`mtg.cardIdentifiers\` ci
        ON
          n.uuid = ci.uuid
        WHERE 
          o.uuid IS NULL
          AND n.setCode IN (${sql.join(setCodesArray.map((code: string) => sql`${code}`), sql`, `)})
      `);
      
      // Convert raw results to typed array
      const newResults: any[] = Array.isArray(newResultsRaw) ? newResultsRaw : [];
      
      newResults.forEach((row: any) => {
        newCards.push({
          uuid: row.uuid || '',
          name: row.name || '',
          setCode: row.setCode || '',
          number: row.number || '',
          oldUuid: null,
          scryfallId: row.scryfallId || null,
          type: 'new' as const
        });
      });
      
      console.log(`[${new Date().toISOString()}] Processed set codes ${i+1}-${i+chunk.length} of ${setCodes.length}: Found ${changedResults.length} changed cards and ${newResults.length} new cards`);
    } catch (error) {
      console.error(`Error processing set codes ${setCodesArray.join(', ')}:`, error);
      // Continue with the next batch even if this one fails
    }
  }
  
  return { changedCards, newCards };
}

/**
 * Finds cards that have changed UUIDs or are new since the last update
 * by comparing old_mtg.cards with mtg.cards
 */
export async function GET(request: NextRequest) {
  try {
    // Admin only. This endpoint had no check at all, so anyone on the internet
    // could run the full catalogue comparison - an unbounded scan of mtg.cards
    // against mtg.cardIdentifiers, which is both a free denial-of-service lever
    // and a dump of the whole card table as CSV.
    const { response } = await requireRole(ROLES.ADMIN);
    if (response) return response;

    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Starting image update report generation`);
    
    // Check if CSV export is requested
    const format = request.nextUrl.searchParams.get('format');
    const isCSVExport = format === 'csv';
    
    // Get chunk size from query params or use default
    const chunkSizeParam = request.nextUrl.searchParams.get('chunkSize');
    const chunkSize = chunkSizeParam ? parseInt(chunkSizeParam, 10) : 200;
    
    console.log(`[${new Date().toISOString()}] Fetching changed cards with chunk size ${chunkSize}...`);
    
    // Process cards in smaller chunks to avoid timeout
    const { changedCards: changedUuidCards, newCards } = await processSetCodes(chunkSize);
    
    console.log(`[${new Date().toISOString()}] Found ${changedUuidCards.length} changed cards and ${newCards.length} new cards`);
    
    // Get total count of cards for reporting
    const [countResultRaw] = await db.execute(sql`
      SELECT COUNT(*) as totalCards FROM \`mtg.cards\`
    `);
    
    // Extract total cards count properly
    const countResult = Array.isArray(countResultRaw) && countResultRaw.length > 0 ? countResultRaw[0] : null;
    const totalCards = countResult && typeof countResult === 'object' && 'totalCards' in countResult 
      ? Number(countResult.totalCards) || 0 
      : 0;
    
    // Generate CSV if requested
    if (isCSVExport) {
      // Combine changed and new cards for the CSV
      const allCardsForUpdate = [...changedUuidCards, ...newCards];
      const csvContent = generateCsv(allCardsForUpdate);
      
      console.log(`[${new Date().toISOString()}] Generating CSV with ${allCardsForUpdate.length} records`);
      
      // Return CSV file
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="card-image-update-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
    
    // Generate JSON report for UI display
    const endTime = Date.now();
    const processTime = (endTime - startTime) / 1000;
    
    const report = {
      totalCardsProcessed: totalCards,
      changedUuids: changedUuidCards.length,
      newCards: newCards.length,
      totalUpdatesNeeded: changedUuidCards.length + newCards.length,
      processingTimeSeconds: processTime.toFixed(2),
      timestamp: new Date().toISOString(),
      details: {
        changedCards: changedUuidCards.slice(0, 1000), // Limit to first 1000 for display
        newCards: newCards.slice(0, 1000) // Limit to first 1000 for display
      }
    };
    
    console.log(`[${new Date().toISOString()}] Completed image update report: ${report.totalUpdatesNeeded} updates needed in ${processTime.toFixed(2)} seconds`);
    
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating image update report:", error);
    return NextResponse.json(
      { error: "Failed to generate image update report", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}