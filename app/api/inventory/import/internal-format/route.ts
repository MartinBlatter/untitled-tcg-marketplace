import { mtgCardIdentifiers } from "@/drizzle/schema";
import { inventoryData } from "@/src/db/schema/inventory";
import { profileData } from "@/src/db/schema/user";
import { parse } from 'csv-parse/sync';
import { eq, like, or } from "drizzle-orm";
import { MySqlColumn } from "drizzle-orm/mysql-core";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";

// Magic: The Gathering language name to ISO code mapping
const languageMapping: Record<string, string> = {
    "English": "en",
    "Chinese Simplified": "zhs",
    "Chinese Traditional": "zht",
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Japanese": "ja",
    "Korean": "ko",
    "Portuguese (Brazil)": "pt",
    "Russian": "ru",
    "Spanish": "es",
    "Ancient Greek": "grc",
    "Arabic": "ar",
    "Hebrew": "he",
    "Latin": "la",
    "Phyrexian": "ph",
    "Sanskrit": "sa",
    // Default to English if no mapping is found
    "Unknown": "en"
};

// Function to convert MTG language name to ISO code
function convertLanguageToISO(languageName: string): string {
    // Handle undefined or empty strings
    if (!languageName || languageName.trim() === '') {
        return 'en'; // Default to English
    }
    
    // Try to find exact match
    const isoCode = languageMapping[languageName.trim()];
    if (isoCode) {
        return isoCode;
    }
    
    // Try case-insensitive match
    const languageKey = Object.keys(languageMapping).find(
        key => key.toLowerCase() === languageName.trim().toLowerCase()
    );
    if (languageKey) {
        return languageMapping[languageKey];
    }
    
    // Return English as fallback
    console.warn(`Language "${languageName}" not found in mapping, using English as fallback.`);
    return 'en';
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

// Valid identifier field mappings - maps import field name to database column name
const identifierMapping: Record<string, keyof typeof mtgCardIdentifiers> = {
    uuid: 'uuid',
    scryfallId: 'scryfallId', 
    tcgplayerProductId: 'tcgplayerProductId', // The correct schema field name
    cardmarketId: 'mcmId',
    mcmId: 'mcmId',
    mtgoId: 'mtgoId', 
    arenaId: 'mtgArenaId', // Correct schema column name is mtgArenaId
    multiverseId: 'multiverseId'
};

// Type guard to check if a column is a MySqlColumn
function isMySqlColumn(column: any): column is MySqlColumn<any, any> {
    return column && 
           typeof column === 'object' && 
           'name' in column && 
           'table' in column;
}

// Function to preload card identifiers to UUIDs for the entire dataset
async function preloadIdentifierMappings(records: any[]): Promise<Map<string, string>> {
    // Collect all different identifiers from the records
    const identifiers: Record<string, Set<string>> = {
        uuid: new Set<string>(),
        scryfallId: new Set<string>(),
        tcgplayerProductId: new Set<string>(),
        cardmarketId: new Set<string>(),
        mcmId: new Set<string>(),
        mtgoId: new Set<string>(),
        arenaId: new Set<string>(),
        multiverseId: new Set<string>(),
    };
    
    // Track which records already have UUIDs
    const recordsWithUuid = new Set<number>();
    
    // Extract all identifiers from the records
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // If UUID is provided, we don't need to look up other identifiers for this record
        if (record.uuid && record.uuid.toString().trim() !== '') {
            identifiers.uuid.add(record.uuid.toString().trim());
            recordsWithUuid.add(i);
            continue;
        }
        
        // Only collect other identifiers for records without a UUID
        for (const field of Object.keys(identifiers)) {
            if (field !== 'uuid' && record[field] && record[field].toString().trim() !== '') {
                identifiers[field].add(record[field].toString().trim());
            }
        }
    }
    
    const idToUuidMap = new Map<string, string>();
    
    // If any UUIDs are directly provided, add them to the map
    if (identifiers.uuid.size > 0) {
        for (const uuid of identifiers.uuid) {
            idToUuidMap.set(uuid, uuid);
        }
    }
    
    // Skip other identifier lookups if all records have UUIDs
    if (recordsWithUuid.size === records.length) {
        console.log(`All records have UUIDs, skipping identifier lookups`);
        return idToUuidMap;
    }
    
    // For each identifier type, query the database to get corresponding UUIDs
    const QUERY_BATCH_SIZE = 1000;
    
    for (const [field, dbFieldName] of Object.entries(identifierMapping)) {
        if (field === 'uuid') continue; // Skip UUID as we already handled it
        
        const values = Array.from(identifiers[field]);
        if (values.length === 0) continue;
        
        // Get the database column object
        const dbColumn = mtgCardIdentifiers[dbFieldName];
        
        // Skip if column doesn't exist or is not a proper column
        if (!dbColumn || !isMySqlColumn(dbColumn)) {
            console.warn(`Column ${dbFieldName} is not a valid column in schema`);
            continue;
        }
        
        // Process in batches to avoid overwhelming the database
        for (let i = 0; i < values.length; i += QUERY_BATCH_SIZE) {
            const batchValues = values.slice(i, i + QUERY_BATCH_SIZE);
            
            try {
                // Use individual OR queries instead of IN operator for text fields
                const queries = batchValues.map(value => 
                    eq(dbColumn, value)
                );
                
                const results = await db.select({
                    id_value: dbColumn,
                    uuid: mtgCardIdentifiers.uuid
                })
                .from(mtgCardIdentifiers)
                .where(or(...queries));
                
                // Add the results to our map
                for (const result of results) {
                    if (result.id_value !== undefined && result.id_value !== null && result.uuid) {
                        idToUuidMap.set(result.id_value.toString(), result.uuid);
                    }
                }
            } catch (error) {
                console.error(`Error querying for ${field}:`, error);
            }
        }
    }
    
    return idToUuidMap;
}

// Process a batch of inventory items
async function processBatch(
    batch: any[], 
    userId: number, 
    isListed: boolean,
    idToUuidMap: Map<string, string>,
    results: { success: number, failed: number, errors: any[] }
): Promise<void> {
    // Prepare bulk insert array
    const bulkInsertItems = [];
    const errorItems = [];
    
    for (const item of batch) {
        try {
            // First, check if UUID is directly provided
            let uuid = item.uuid;
            
            // If not, try to resolve UUID using other identifiers
            if (!uuid) {
                for (const field of Object.keys(identifierMapping)) {
                    if (field !== 'uuid' && item[field]) {
                        const fieldValue = item[field].toString().trim();
                        if (fieldValue && idToUuidMap.has(fieldValue)) {
                            uuid = idToUuidMap.get(fieldValue);
                            if (uuid) break;
                        }
                    }
                }
            }
            
            if (!uuid) {
                errorItems.push({ 
                    item, 
                    error: `Card not found with provided identifiers: ${JSON.stringify({
                        uuid: item.uuid,
                        cardmarketId: item.cardmarketId,
                        scryfallId: item.scryfallId,
                        tcgplayerProductId: item.tcgplayerProductId,
                        mcmId: item.mcmId,
                        mtgoId: item.mtgoId,
                        arenaId: item.arenaId,
                        multiverseId: item.multiverseId,
                    })}${item.name ? ` (${item.name})` : ''}`
                });
                continue;
            }
            
            // Convert language
            const languageISO = convertLanguageToISO(item.language);
            
            // Prepare inventory item data
            bulkInsertItems.push({
                userId: userId,
                type: 'single',
                foreignKeySource: 'mtg.cards',
                foreignKey: uuid,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                quality: item.quality || item.condition || 'NM',
                language: languageISO,
                comment: item.comment || null,
                internalComment: item.internalComment || `Imported from Internal Format on ${new Date().toISOString()}`,
                isFoil: item.isFoil === 'true' || item.isFoil === '1' || item.isFoil === true ? 1 : 0,
                isAltered: item.isAltered === 'true' || item.isAltered === '1' || item.isAltered === true ? 1 : 0,
                isSigned: item.isSigned === 'true' || item.isSigned === '1' || item.isSigned === true ? 1 : 0,
                isMisprint: item.isMisprint === 'true' || item.isMisprint === '1' || item.isMisprint === true ? 1 : 0,
                isSealed: item.isSealed === 'true' || item.isSealed === '1' || item.isSealed === true ? 1 : 0,
                isListed: isListed ? 1 : 0,
                isGraded: item.isGraded === 'true' || item.isGraded === '1' || item.isGraded === true ? 1 : 0,
                grading: item.grading || null,
                gradingCompany: item.gradingCompany || null
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

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Internal Format Import started`);
    
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

        // Preload identifier to UUID mappings
        console.log(`[${new Date().toISOString()}] Preloading identifier mappings`);
        const idToUuidMap = await preloadIdentifierMappings(records);
        console.log(`[${new Date().toISOString()}] Mappings loaded, ${idToUuidMap.size} mappings found`);

        // Process records in batches to handle large files
        const results = { 
            success: 0, 
            failed: 0, 
            errors: [] as any[] 
        };

        const BATCH_SIZE = 1000;
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);
            console.log(`[${new Date().toISOString()}] Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(records.length / BATCH_SIZE)}`);
            await processBatch(batch, userId, isListed, idToUuidMap, results);
            console.log(`[${new Date().toISOString()}] Processed batch. Current results: ${results.success} successful, ${results.failed} failed`);
        }

        // Prepare result message
        let message = `Import completed. Successfully imported ${results.success} items.`;
        if (results.failed > 0) {
            message += ` Failed to import ${results.failed} items.`;
        }

        const endTime = Date.now();
        const processTime = (endTime - startTime) / 1000;
        console.log(`[${new Date().toISOString()}] Import completed in ${processTime} seconds`);

        return NextResponse.json({
            success: true,
            message,
            imported: results.success,
            failed: results.failed,
            errors: results.errors,
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