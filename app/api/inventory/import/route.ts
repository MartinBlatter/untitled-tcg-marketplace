import { mtgCardIdentifiers } from "@/drizzle/schema";
import { inventoryData } from "@/src/db/schema/inventory";
import { mtgCards, mtgTokens } from "@/src/db/schema/magic";
import { profileData } from "@/src/db/schema/user";
import { parse } from 'csv-parse/sync';
import { and, eq, inArray, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";
import { convertLanguageToISO } from "./helpers";

// Function to clean up card names by removing text in brackets
function cleanCardName(name: string | undefined | null): string {
    if (!name) return '';
    
    // Remove any text in parentheses, e.g., "Card Name (V.1)" becomes "Card Name"
    return name.replace(/\s*\([^)]*\)/g, '').trim();
}

// Function to identify token cards and clean up their names
function processTokenCardName(name: string | undefined | null): { isToken: boolean, cleanedName: string } {
    if (!name) return { isToken: false, cleanedName: '' };
    
    const cleanedName = cleanCardName(name);
    
    // Check if name contains the word "token"
    const tokenIndex = cleanedName.toLowerCase().indexOf('token');
    
    if (tokenIndex !== -1) {
        // Remove "token" and everything after it
        return {
            isToken: true,
            cleanedName: cleanedName.substring(0, tokenIndex).trim()
        };
    }
    
    return {
        isToken: false,
        cleanedName
    };
}

// Function to get setCode variations (original, without first letter, and first 3 letters)
function getSetCodeVariations(setCode: string | undefined | null): string[] {
    if (!setCode) return [''];
    
    const trimmedSetCode = setCode.trim();
    if (trimmedSetCode.length <= 1) return [trimmedSetCode];
    
    let variations = [
        trimmedSetCode,                            // Original setCode
        trimmedSetCode.substring(1)                // Without first letter
    ];
    
    // Add first 3 letters variation if setCode is long enough
    if (trimmedSetCode.length >= 3) {
        variations.push(trimmedSetCode.substring(0, 3));  // First 3 letters
    }
    
    // Handle special case mappings
    if (trimmedSetCode.toUpperCase() === 'MYSPT') {
        variations.push('CMB1');  // Mystery Booster Playtest Cards -> Convention Edition
        variations.push('CMB2');  // Mystery Booster Playtest Cards -> Store Edition
    }
    
    if (trimmedSetCode.toUpperCase() === 'DFC' || 
        trimmedSetCode.toUpperCase().includes('DFC')) {
        variations.push('DRC');  // Double Feature -> Double Feature
    }
    
    if (trimmedSetCode.toUpperCase().includes('MB2')) {
        variations.push('PLST');  // Mystery Booster 2 -> Playtest Cards
    }
    
    // Remove duplicates
    return [...new Set(variations)];
}

// Function to process CSV file and return parsed records
async function parseCSV(file: File): Promise<any[]> {
    const text = await file.text();
    const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });
    return records;
}

// Function to find potential matches by setCode and collector number or name
async function findPotentialMatches(records: any[]): Promise<{ 
    matchedItems: Array<{ 
        originalRow: any;
        possibleMatch: { uuid: string; name: string | null; setCode: string | null; number: string | null; isToken?: boolean };
    }>;
    totalLookups: number;
}> {
    // Filter records that don't have a cardmarketId or the cardmarketId isn't found
    const recordsWithSetInfo = records.filter(record => 
        record.setCode && 
        (record.cn || record.name)
    );

    if (recordsWithSetInfo.length === 0) {
        return { matchedItems: [], totalLookups: 0 };
    }

    const potentialMatches: Array<{ 
        originalRow: any;
        possibleMatch: { uuid: string; name: string | null; setCode: string | null; number: string | null; isToken?: boolean };
    }> = [];
    let totalLookups = 0;

    // Step 1: Group records by setCode to reduce the number of queries
    const recordsBySetCode = new Map<string, any[]>();
    const tokenRecordsBySetCode = new Map<string, any[]>();
    
    // Prepare batch records by set code
    for (const record of recordsWithSetInfo) {
        const setCodeVariations = getSetCodeVariations(record.setCode);
        const { isToken, cleanedName } = processTokenCardName(record.name);
        
        for (const setCode of setCodeVariations) {
            if (!setCode) continue;
            
            // Separate token and non-token records
            if (isToken) {
                if (!tokenRecordsBySetCode.has(setCode)) {
                    tokenRecordsBySetCode.set(setCode, []);
                }
                tokenRecordsBySetCode.get(setCode)!.push({
                    ...record,
                    cleanedName,
                    originalSetCode: record.setCode,
                    isToken: true
                });
            } else {
                if (!recordsBySetCode.has(setCode)) {
                    recordsBySetCode.set(setCode, []);
                }
                recordsBySetCode.get(setCode)!.push({
                    ...record,
                    cleanedName: cleanCardName(record.name),
                    originalSetCode: record.setCode,
                    isToken: false
                });
            }
        }
    }

    // Step 2: Process each set code batch for regular cards
    for (const [setCode, setRecords] of recordsBySetCode.entries()) {
        totalLookups++;
        try {
            // Collect all collector numbers and names for this set
            const collectorNumbers = new Set<string>();
            const cardNames = new Set<string>();
            
            for (const record of setRecords) {
                if (record.cn) collectorNumbers.add(record.cn.trim());
                if (record.cleanedName) cardNames.add(record.cleanedName);
            }
            
            // Fast path: If we have collector numbers, use them for matching
            if (collectorNumbers.size > 0) {
                const collectorNumbersArray = Array.from(collectorNumbers);
                
                // Execute a single query with all collector numbers for this set code
                const results = await db.select({
                    uuid: mtgCards.uuid,
                    name: mtgCards.name,
                    setCode: mtgCards.setCode,
                    number: mtgCards.number
                })
                .from(mtgCards)
                .where(and(
                    eq(mtgCards.setCode, setCode),
                    inArray(mtgCards.number, collectorNumbersArray)
                ))
                .limit(collectorNumbersArray.length * 2); // Allow for some duplicates
                
                // Match the results back to the original records
                for (const record of setRecords) {
                    if (!record.cn) continue;
                    
                    // Find matching result by collector number
                    const matchingResults = results.filter(r => 
                        r.number === record.cn.trim()
                    );
                    
                    if (matchingResults.length > 0) {
                        for (const result of matchingResults) {
                            potentialMatches.push({
                                originalRow: record,
                                possibleMatch: result
                            });
                        }
                    }
                }
            }
            
            // If we have card names, try matching by name (for records that didn't match by collector number)
            if (cardNames.size > 0) {
                const cardNamesArray = Array.from(cardNames);
                
                // Get records that haven't been matched yet
                const unmatchedRecords = setRecords.filter(record => 
                    !potentialMatches.some(match => 
                        match.originalRow === record
                    )
                );
                
                // If we have unmatched records, try by name
                if (unmatchedRecords.length > 0) {
                    // Execute a single query with all card names for this set code
                    const results = await db.select({
                        uuid: mtgCards.uuid,
                        name: mtgCards.name,
                        setCode: mtgCards.setCode,
                        number: mtgCards.number
                    })
                    .from(mtgCards)
                    .where(and(
                        eq(mtgCards.setCode, setCode),
                        inArray(mtgCards.name, cardNamesArray)
                    ))
                    .limit(cardNamesArray.length * 5); // Allow multiple matches per name
                    
                    // Match the results back to the original records
                    for (const record of unmatchedRecords) {
                        if (!record.cleanedName) continue;
                        
                        // Find matching results by name
                        const matchingResults = results.filter(r => 
                            r.name === record.cleanedName
                        );
                        
                        if (matchingResults.length > 0) {
                            for (const result of matchingResults.slice(0, 5)) { // Limit to 5 matches per record
                                potentialMatches.push({
                                    originalRow: record,
                                    possibleMatch: result
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error finding potential matches for set code ${setCode}:`, error);
        }
    }
    
    // Step 3: Process each set code batch for token cards
    for (const [setCode, tokenRecords] of tokenRecordsBySetCode.entries()) {
        totalLookups++;
        try {
            // Collect all collector numbers and names for this set
            const collectorNumbers = new Set<string>();
            const tokenNames = new Set<string>();
            
            for (const record of tokenRecords) {
                if (record.cn) collectorNumbers.add(record.cn.trim());
                if (record.cleanedName) tokenNames.add(record.cleanedName);
            }
            
            // First try by collector number (if available)
            if (collectorNumbers.size > 0) {
                const collectorNumbersArray = Array.from(collectorNumbers);
                
                // Execute a query for tokens with these collector numbers
                const results = await db.select({
                    uuid: mtgTokens.uuid,
                    name: mtgTokens.name,
                    setCode: mtgTokens.setCode,
                    number: mtgTokens.number
                })
                .from(mtgTokens)
                .where(and(
                    eq(mtgTokens.setCode, setCode),
                    inArray(mtgTokens.number, collectorNumbersArray)
                ))
                .limit(collectorNumbersArray.length * 2);
                
                // Match the results back to the original records
                for (const record of tokenRecords) {
                    if (!record.cn) continue;
                    
                    const matchingResults = results.filter(r => 
                        r.number === record.cn.trim()
                    );
                    
                    if (matchingResults.length > 0) {
                        for (const result of matchingResults) {
                            potentialMatches.push({
                                originalRow: record,
                                possibleMatch: {
                                    ...result,
                                    // Mark as token for later processing
                                    isToken: true
                                }
                            });
                        }
                    }
                }
            }
            
            // Then try by name
            if (tokenNames.size > 0) {
                const tokenNamesArray = Array.from(tokenNames);
                
                // Get unmatched token records
                const unmatchedTokens = tokenRecords.filter(record => 
                    !potentialMatches.some(match => 
                        match.originalRow === record
                    )
                );
                
                if (unmatchedTokens.length > 0) {
                    // Search for tokens by name
                    const results = await db.select({
                        uuid: mtgTokens.uuid,
                        name: mtgTokens.name,
                        setCode: mtgTokens.setCode,
                        number: mtgTokens.number
                    })
                    .from(mtgTokens)
                    .where(and(
                        eq(mtgTokens.setCode, setCode),
                        inArray(mtgTokens.name, tokenNamesArray)
                    ))
                    .limit(tokenNamesArray.length * 5);
                    
                    // Match results
                    for (const record of unmatchedTokens) {
                        if (!record.cleanedName) continue;
                        
                        // For tokens, try a more flexible match by checking if the token name contains
                        // the cleaned name (which had "token" and everything after removed)
                        const matchingResults = results.filter(r => 
                            r.name && r.name.toLowerCase().includes(record.cleanedName.toLowerCase())
                        );
                        
                        if (matchingResults.length > 0) {
                            for (const result of matchingResults.slice(0, 5)) {
                                potentialMatches.push({
                                    originalRow: record,
                                    possibleMatch: {
                                        ...result,
                                        // Mark as token for later processing
                                        isToken: true
                                    }
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error finding token matches for set code ${setCode}:`, error);
        }
    }
    
    return { 
        matchedItems: potentialMatches,
        totalLookups: totalLookups
    };
}

// Function to preload all cardmarketIds to UUIDs for the entire dataset
async function preloadCardmarketIdMappings(records: any[]): Promise<Map<string | null, string>> {
    // Extract all cardmarketIds from the records
    const cardmarketIds = Array.from(new Set(records.map(record => record.cardmarketId)))
                          .filter(id => id !== null && id !== undefined);
    
    // If no valid cardmarketIds, return empty map
    if (cardmarketIds.length === 0) {
        return new Map<string | null, string>();
    }
    
    // Batch size for database queries
    const QUERY_BATCH_SIZE = 1000;
    const idToUuidMap = new Map<string | null, string>();
    
    // Process in batches to avoid overwhelming the database
    for (let i = 0; i < cardmarketIds.length; i += QUERY_BATCH_SIZE) {
        const batchIds = cardmarketIds.slice(i, i + QUERY_BATCH_SIZE);
        
        const results = await db.select({
            mcmId: mtgCardIdentifiers.mcmId,
            uuid: mtgCardIdentifiers.uuid
        })
        .from(mtgCardIdentifiers)
        .where(inArray(mtgCardIdentifiers.mcmId, batchIds));
        
        // Add the results to our map
        for (const result of results) {
            idToUuidMap.set(result.mcmId, result.uuid);
        }
    }
    
    return idToUuidMap;
}

// Process a batch of inventory items
async function processBatch(
    batch: any[], 
    userId: number, 
    isListed: boolean,
    idToUuidMap: Map<string | null, string>,
    results: { success: number, failed: number, errors: any[], skippedPotentialMatches?: number, potentialMatchIds?: Set<string> },
    potentialMatches: Map<string, any> = new Map(),
    potentialMatchesArray: Array<{ originalRow: any; possibleMatch: any }> = []
): Promise<void> {
    // Prepare bulk insert array
    const bulkInsertItems = [];
    const errorItems = [];
    
    // Track which potential match IDs are actually represented in the batch
    if (!results.potentialMatchIds) {
        results.potentialMatchIds = new Set<string>();
    }

    // Create a lookup map for original rows in potential matches
    const potentialMatchLookup = new Map<string, boolean>();
    potentialMatchesArray.forEach(match => {
        const original = match.originalRow;
        if (original.cardmarketId) {
            potentialMatchLookup.set(original.cardmarketId, true);
        }
    });
    
    for (const item of batch) {
        try {
            // Get UUID from our preloaded mapping
            let uuid = idToUuidMap.get(item.cardmarketId);
            
            if (!uuid) {
                // Check if this item is in our potential matches
                const hasPotentialMatch = potentialMatchLookup.has(item.cardmarketId);
                
                if (hasPotentialMatch) {
                    // This is a legitimate potential match - skip it for now
                    results.skippedPotentialMatches = (results.skippedPotentialMatches || 0) + 1;
                    
                    // Track the ID so we can count actual potential matches
                    if (item.cardmarketId) {
                        results.potentialMatchIds.add(item.cardmarketId);
                    }
                } else {
                    // This item has no direct match and no potential match - it's truly a failed item
                    errorItems.push({ 
                        item, 
                        error: `No matching card found for this item${item.name ? ` (${item.name})` : ''}`
                    });
                }
                continue;
            }
            
            // Check if this is a token card by name pattern
            const { isToken } = processTokenCardName(item.name);
            
            // Set the appropriate foreignKeySource based on whether this is a token
            const foreignKeySource = isToken ? 'mtg.tokens' : 'mtg.cards';
            
            // Convert language
            const languageISO = convertLanguageToISO(item.language);
            
            // Prepare inventory item data
            bulkInsertItems.push({
                userId: userId,
                type: 'single',
                foreignKeySource, // Use the determined foreignKeySource based on isToken
                foreignKey: uuid,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                quality: item.condition || 'NM',
                language: languageISO,
                comment: item.comment || null,
                internalComment: `Imported from TCG Powertools on ${new Date().toISOString()}`,
                isFoil: item.isFoil === 'true' || item.isFoil === '1' ? 1 : 0,
                isAltered: 0,
                isSigned: item.isSigned === 'true' || item.isSigned === '1' ? 1 : 0,
                isMisprint: 0,
                isSealed: 0,
                isListed: isListed ? 1 : 0,
                isGraded: 0
            });
            
        } catch (error) {
            errorItems.push({ 
                item, 
                error: `Failed to process item: ${error instanceof Error ? error.message : 'Unknown error'}${item.name ? ` (${item.name})` : ''}`
            });
        }
    }
    
    // Perform bulk insert if we have items to insert
    if (bulkInsertItems.length > 0) {
        try {
            await db.insert(inventoryData).values(bulkInsertItems);
            results.success += bulkInsertItems.length;
        } catch (error) {
            console.error("Error during bulk insert:", error);
            // If bulk insert fails, add all items to error list
            for (const item of bulkInsertItems) {
                errorItems.push({ 
                    item, 
                    error: `Failed during bulk insert: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        }
    }
    
    // Process errors
    for (const errorItem of errorItems) {
        results.failed++;
        results.errors.push({ 
            row: results.success + results.failed, 
            reason: errorItem.error,
            data: errorItem.item 
        });
    }
}

// Use native JSON string formatting since csv-stringify is not installed
function generateCsv(records: any[]): string {
    // Create CSV header
    const headers = ['uuid', 'name', 'setCode', 'cn', 'price', 'quantity', 'condition', 'language', 'comment', 'isFoil', 'isSigned', 'matchedName', 'matchedSetCode', 'matchedNumber', 'productLink'];
    let csvContent = headers.join(',') + '\n';
    
    // Add each record as a row
    records.forEach(record => {
        const original = record.originalRow;
        const possible = record.possibleMatch;
        
        // Generate product link
        const productLink = possible.uuid && possible.name && possible.setCode 
            ? `/magic/${possible.setCode}/products/single/${encodeURIComponent(possible.name)}?uuid=${possible.uuid}`
            : '';
        
        const values = [
            possible.uuid || '',
            original.name || '',
            original.setCode || '',
            original.cn || '',
            original.price || '',
            original.quantity || '1',
            original.condition || 'NM',
            original.language || 'English',
            original.comment || '',
            original.isFoil || '0',
            original.isSigned || '0',
            possible.name || '',
            possible.setCode || '',
            possible.number || '',
            productLink
        ].map(value => {
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                // Escape quotes and wrap in quotes
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        
        csvContent += values.join(',') + '\n';
    });
    
    return csvContent;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Import started`);
    
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ 
                success: false, 
                message: "Not authenticated" 
            }, { status: 401 });
        }

        // Get the user ID from the email
        const user = await db.select({
            id: profileData.id
        })
        .from(profileData)
        .where(like(profileData.eMail, session.user.email));

        if (user.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "User not found" 
            }, { status: 404 });
        }

        const userId = user[0].id;

        // Process form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const listingOption = formData.get('listingOption') as string;
        const isListed = listingOption === 'listed';

        if (!file) {
            return NextResponse.json({ 
                success: false, 
                message: "No file provided" 
            }, { status: 400 });
        }

        // Parse CSV file
        console.log(`[${new Date().toISOString()}] Parsing CSV file`);
        const records = await parseCSV(file);

        if (records.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "The file contains no valid records" 
            }, { status: 400 });
        }

        console.log(`[${new Date().toISOString()}] CSV parsed, ${records.length} records found`);

        // Preload cardmarketId to UUID mappings
        console.log(`[${new Date().toISOString()}] Preloading cardmarketId mappings`);
        const idToUuidMap = await preloadCardmarketIdMappings(records);
        console.log(`[${new Date().toISOString()}] Mappings loaded, ${idToUuidMap.size} cards found`);

        // Find potential matches for rows without UUID mappings using setCode/cn or setCode/name
        console.log(`[${new Date().toISOString()}] Finding potential matches for unmapped cards`);
        const unmappedRecords = records.filter(record => !idToUuidMap.has(record.cardmarketId));
        let potentialMatches: Array<{
            originalRow: any; 
            possibleMatch: { uuid: string; name: string | null; setCode: string | null; number: string | null }
        }> = [];
        let totalLookups = 0;
        
        if (unmappedRecords.length > 0) {
            const potentialMatchResults = await findPotentialMatches(unmappedRecords);
            potentialMatches = potentialMatchResults.matchedItems;
            totalLookups = potentialMatchResults.totalLookups;
            console.log(`[${new Date().toISOString()}] Found ${potentialMatches.length} potential matches from ${totalLookups} lookups`);
        }

        // Create a Map for quick lookup of potential matches
        const potentialMatchesMap = new Map<string, any>();
        
        // Pre-calculate all the keys we'll need to maximize matching efficiency
        console.log(`[${new Date().toISOString()}] Building lookup map for ${potentialMatches.length} potential matches`);
        
        // Process in batches to avoid blocking the event loop for too long
        const MATCH_BATCH_SIZE = 1000;
        for (let i = 0; i < potentialMatches.length; i += MATCH_BATCH_SIZE) {
            const batchMatches = potentialMatches.slice(i, i + MATCH_BATCH_SIZE);
            
            for (const match of batchMatches) {
                const original = match.originalRow;
                const setCode = original.setCode?.trim() || '';
                const cn = original.cn?.trim() || '';
                const cleanedName = cleanCardName(original.name);
                
                // Get all setCode variations for the match keys
                const setCodeVariations = getSetCodeVariations(setCode);
                
                // Create multiple match keys with all setCode variations for better lookup flexibility
                for (const codeVariation of setCodeVariations) {
                    // Only create keys for non-empty variations
                    if (!codeVariation) continue;
                    
                    // Full key with set + cn + name
                    if (cn && cleanedName) {
                        potentialMatchesMap.set(`${codeVariation}_${cn}_${cleanedName}`, match.possibleMatch);
                    }
                    
                    // Key with just set + cn
                    if (cn) {
                        potentialMatchesMap.set(`${codeVariation}_${cn}_`, match.possibleMatch);
                    }
                    
                    // Key with just set + name
                    if (cleanedName) {
                        potentialMatchesMap.set(`${codeVariation}__${cleanedName}`, match.possibleMatch);
                    }
                }
            }
        }

        // Process records in batches to handle large files
        const results = { 
            success: 0, 
            failed: 0, 
            errors: [] as any[],
            potentialMatchesCount: potentialMatches.length,
            skippedPotentialMatches: 0,
            potentialMatchIds: new Set<string>()
        };

        const BATCH_SIZE = 1000; // Increased from 100 for better performance
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);
            console.log(`[${new Date().toISOString()}] Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(records.length / BATCH_SIZE)}`);
            await processBatch(batch, userId, isListed, idToUuidMap, results, potentialMatchesMap, potentialMatches);
            console.log(`[${new Date().toISOString()}] Processed batch. Current results: ${results.success} successful, ${results.failed} failed`);
        }

        // Generate CSV for potential matches if any
        let potentialMatchesCsv = null;
        if (potentialMatches.length > 0) {
            potentialMatchesCsv = generateCsv(potentialMatches);
        }

        // Get the actual count of potential matches that were found in the data
        const actualPotentialMatchesCount = results.potentialMatchIds ? results.potentialMatchIds.size : 0;

        // Prepare result message
        let message = `Import completed. Successfully imported ${results.success} items.`;
        
        if (results.failed > 0) {
            message += ` Failed to import ${results.failed} items.`;
        }
        
        if (actualPotentialMatchesCount > 0) {
            message += ` Found ${actualPotentialMatchesCount} potential matches that can be imported separately.`;
        }

        const endTime = Date.now();
        const processTime = (endTime - startTime) / 1000;
        console.log(`[${new Date().toISOString()}] Import completed in ${processTime} seconds`);

        return NextResponse.json({
            success: true,
            message,
            imported: results.success,
            failed: results.failed,
            skipped: actualPotentialMatchesCount, // Use actual count of potential matches
            errors: results.errors,
            potentialMatchesAvailable: potentialMatches.length > 0,
            potentialMatchesCsv: potentialMatchesCsv,
            processingTime: `${processTime.toFixed(2)} seconds`
        });

    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred during import: " + (error instanceof Error ? error.message : "Unknown error"),
            imported: 0,
            failed: 0,
        }, { status: 500 });
    }
}