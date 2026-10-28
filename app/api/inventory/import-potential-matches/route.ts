import db from "@/src/db/mysql";
import { inventoryData } from "@/src/db/schema/inventory";
import { profileData } from "@/src/db/schema/user";
import { parse } from 'csv-parse/sync';
import { like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

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

// Process a batch of inventory items from potential matches CSV
async function processPotentialMatchesBatch(
    batch: any[], 
    userId: number, 
    isListed: boolean,
    results: { success: number, failed: number, errors: any[] }
): Promise<void> {
    // Prepare bulk insert array
    const bulkInsertItems = [];
    const errorItems = [];
    
    for (const item of batch) {
        try {
            // Check if the required fields are present
            const uuid = item.uuid?.trim();
            if (!uuid) {
                errorItems.push({ 
                    item, 
                    error: `Missing UUID for card${item.name ? ` (${item.name})` : ''}`
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
                foreignKey: uuid,  // Direct use of the UUID from the CSV
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                quality: item.condition || 'NM',
                language: languageISO,
                comment: item.comment || null,
                internalComment: `Imported from potential matches on ${new Date().toISOString()}`,
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

// Function to parse CSV file and return parsed records
async function parseCSV(csvString: string): Promise<any[]> {
    try {
        const records = parse(csvString, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        return records;
    } catch (error) {
        console.error("Error parsing CSV:", error);
        return [];
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Potential matches import started`);
    
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

        // Parse request body
        const body = await request.json();
        const { csvData, listingOption } = body;
        const isListed = listingOption === 'listed';

        if (!csvData) {
            return NextResponse.json({ 
                success: false, 
                message: "No CSV data provided" 
            }, { status: 400 });
        }

        // Parse CSV string
        console.log(`[${new Date().toISOString()}] Parsing potential matches CSV`);
        const records = await parseCSV(csvData);

        if (records.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "The CSV contains no valid records" 
            }, { status: 400 });
        }

        console.log(`[${new Date().toISOString()}] CSV parsed, ${records.length} records found`);

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
            await processPotentialMatchesBatch(batch, userId, isListed, results);
            console.log(`[${new Date().toISOString()}] Processed batch. Current results: ${results.success} successful, ${results.failed} failed`);
        }

        // Prepare result message
        const message = `Import completed. Successfully imported ${results.success} potential matches.${results.failed > 0 ? ` Failed to import ${results.failed} items.` : ''}`;

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