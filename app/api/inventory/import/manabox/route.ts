// filepath: d:\Git\tcg\app\api\inventory\import\manabox\route.ts
import { mtgCardIdentifiers, mtgCards } from "@/drizzle/schema";
import { manaBoxQualitiesMapping } from "@/src/constants/qualities";
import { inventoryData } from "@/src/db/schema/inventory";
import { profileData } from "@/src/db/schema/user";
import { and, eq, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";

// Process a batch of card entries
async function processBatch(
    batch: Array<{
        name: string;
        setCode: string;
        quantity: number;
        language: string;
        quality: string;
        isFoil: boolean;
        isAltered: boolean;
        isMisprint: boolean;
        scryfallId?: string;
        price?: number;
    }>,
    userId: number,
    isListed: boolean,
    results: { success: number; failed: number; errors: any[] }
): Promise<void> {
    // Prepare bulk insert array
    const bulkInsertItems = [];
    const errorItems = [];

    // Process each card in the batch
    for (const item of batch) {
        try {
            let uuid;

            // Try to find the card by Scryfall ID first if available
            if (item.scryfallId) {
                try {
                    // Look up the card in mtgCardIdentifiers table by scryfallId
                    const cardIdentifiers = await db
                        .select({ uuid: mtgCardIdentifiers.uuid })
                        .from(mtgCardIdentifiers)
                        .where(eq(mtgCardIdentifiers.scryfallId, item.scryfallId))
                        .limit(1);

                    if (cardIdentifiers.length > 0) {
                        uuid = cardIdentifiers[0].uuid;
                        
                        // Verify that this UUID exists in the cards table
                        const cardVerify = await db
                            .select({ uuid: mtgCards.uuid })
                            .from(mtgCards)
                            .where(eq(mtgCards.uuid, uuid))
                            .limit(1);
                            
                        if (cardVerify.length === 0) {
                            // If we found the UUID in identifiers but not in cards, reset it
                            uuid = undefined;
                        }
                    }
                } catch (error) {
                    console.error(`Error finding card by Scryfall ID (${item.scryfallId}):`, error);
                    // Continue to try finding by name and set
                }
            }

            // If no card found by Scryfall ID, try by name and set
            if (!uuid) {
                try {
                    const card = await db
                        .select({ uuid: mtgCards.uuid })
                        .from(mtgCards)
                        .where(
                            and(
                                like(mtgCards.name, `%${item.name.trim()}%`),
                                eq(mtgCards.setCode, item.setCode.trim())
                            )
                        )
                        .limit(1);

                    if (card.length === 0) {
                        errorItems.push({
                            item,
                            error: `Card not found: "${item.name}" in set "${item.setCode}"`,
                        });
                        continue;
                    }

                    uuid = card[0].uuid;
                } catch (error) {
                    console.error(`Error finding card by name (${item.name}) and set (${item.setCode}):`, error);
                    errorItems.push({
                        item,
                        error: `Failed to find card in database`,
                    });
                    continue;
                }
            }

            // Prepare inventory item data
            bulkInsertItems.push({
                userId: userId,
                type: "single",
                foreignKeySource: "mtg.cards",
                foreignKey: uuid,
                price: item.price || 0,
                quantity: item.quantity,
                quality: item.quality || "NM", // Use provided quality or default to Near Mint
                language: item.language || "en", // Use provided language or default to English
                comment: null,
                internalComment: `Imported from ManaBox on ${new Date().toISOString()}`,
                isFoil: item.isFoil ? 1 : 0,
                isAltered: item.isAltered ? 1 : 0,
                isSigned: 0, // ManaBox doesn't track signed status
                isMisprint: item.isMisprint ? 1 : 0,
                isSealed: 0,
                isListed: isListed ? 1 : 0,
                isGraded: 0,
            });
        } catch (error) {
            console.error("Error processing item:", error);
            errorItems.push({
                item,
                error: `Failed to process card`,
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
            // If bulk insert fails, mark all items as failed
            results.failed += bulkInsertItems.length;
            
            // Add a generic error message without exposing DB details
            results.errors.push({
                row: results.success + 1,
                reason: "Database error occurred during import",
                data: { affectedCards: bulkInsertItems.length }
            });
        }
    }

    // Process individual errors
    for (const errorItem of errorItems) {
        results.failed++;
        results.errors.push({
            row: results.success + results.failed,
            reason: errorItem.error,
            // Only include basic card info, not full item details
            data: { 
                name: errorItem.item.name,
                set: errorItem.item.setCode
            }
        });
    }
}

/**
 * Parse a CSV line, properly handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            // Handle quote character
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                // Escaped quote inside quotes
                currentField += '"';
                i++; // Skip the next quote
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Field delimiter - if not in quotes, end the current field
            result.push(currentField);
            currentField = '';
        } else {
            // Regular character
            currentField += char;
        }
    }
    
    // Add the last field
    result.push(currentField);
    
    return result;
}

// Parse ManaBox CSV and extract card information
function parseManaBoxCSV(csvContent: string): Array<{
    name: string;
    setCode: string;
    quantity: number;
    language: string;
    quality: string;
    isFoil: boolean;
    isAltered: boolean;
    isMisprint: boolean;
    scryfallId?: string;
    price?: number;
}> {
    // Split the CSV into lines and filter out empty lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Skip the header line if present
    const startIndex = lines[0]?.toLowerCase().includes('name') ? 1 : 0;
    
    // Parse each line
    return lines.slice(startIndex).map((line, index) => {
        try {
            // Use the robust CSV line parser instead of simple split
            const parts = parseCSVLine(line);
            
            if (parts.length < 15) {
                throw new Error(`Invalid format at line ${index + startIndex + 1}: Insufficient columns (found ${parts.length}, expected at least 15)`);
            }
            
            // Extract data based on ManaBox export format
            // Format indices based on the wishlist implementation
            const name = parts[0].trim();
            const setCode = parts[1].trim();
            const language = parts[13].trim() || "en";
            const rawQuality = parts[12].trim().toLowerCase();
            const quality = manaBoxQualitiesMapping[rawQuality as keyof typeof manaBoxQualitiesMapping] || "NM";
            const quantity = parseInt(parts[6].trim(), 10) || 1;
            const isFoil = parts[4].trim().toLowerCase() === 'foil';
            const isAltered = Boolean(parseInt(parts[11].trim(), 10) || 0);
            const isMisprint = Boolean(parseInt(parts[10].trim(), 10) || 0);
            const scryfallId = parts[8].trim();
            const price = parseFloat(parts[9].trim()) || 0;
            
            return {
                name,
                setCode,
                quantity,
                language,
                quality,
                isFoil,
                isAltered,
                isMisprint,
                scryfallId: scryfallId || undefined,
                price: price || undefined
            };
        } catch (error) {
            console.error(`Error parsing line ${index + startIndex + 1}:`, error);
            throw new Error(`Error on line ${index + startIndex + 1}: Invalid format`);
        }
    });
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] ManaBox import started`);
    
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

        // Process the multipart form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const listingOption = formData.get('listingOption') as string;
        const isListed = listingOption === 'listed';

        if (!file) {
            return NextResponse.json({ 
                success: false, 
                message: "No file uploaded" 
            }, { status: 400 });
        }

        // Check if the file is a CSV
        if (!file.name.toLowerCase().endsWith('.csv')) {
            return NextResponse.json({ 
                success: false, 
                message: "Invalid file format. Only CSV files are supported." 
            }, { status: 400 });
        }

        // Read the file content
        const fileContent = await file.text();

        // Parse the ManaBox CSV
        console.log(`[${new Date().toISOString()}] Parsing ManaBox CSV`);
        let parsedCards;
        try {
            parsedCards = parseManaBoxCSV(fileContent);
        } catch (error) {
            console.error("Failed to parse ManaBox data:", error);
            return NextResponse.json({
                success: false,
                message: "Failed to parse ManaBox data. Please check the file format.",
                imported: 0,
                failed: 1,
            }, { status: 400 });
        }

        if (parsedCards.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "No valid card entries found in the provided file" 
            }, { status: 400 });
        }

        console.log(`[${new Date().toISOString()}] ManaBox CSV parsed, ${parsedCards.length} cards found`);

        // Process records
        const results = { 
            success: 0, 
            failed: 0, 
            errors: [] as any[] 
        };

        // Process all cards at once since we typically won't have thousands in a ManaBox export
        try {
            await processBatch(parsedCards, userId, isListed, results);
            console.log(`[${new Date().toISOString()}] Processed cards. Results: ${results.success} successful, ${results.failed} failed`);
        } catch (error) {
            console.error("Error processing batch:", error);
            return NextResponse.json({
                success: false,
                message: "An error occurred while processing the import. Please try again.",
                imported: 0,
                failed: parsedCards.length,
            }, { status: 500 });
        }

        // Prepare result message
        let message = `Import completed. Successfully imported ${results.success} cards.`;
        if (results.failed > 0) {
            message += ` Failed to import ${results.failed} cards.`;
        }

        const endTime = Date.now();
        const processTime = (endTime - startTime) / 1000;
        console.log(`[${new Date().toISOString()}] Import completed in ${processTime} seconds`);

        return NextResponse.json({
            success: results.success > 0,
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
            message: "An error occurred during import. Please try again later.",
            imported: 0,
            failed: 0,
        }, { status: 500 });
    }
}