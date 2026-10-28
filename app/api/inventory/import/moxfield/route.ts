import { mtgCards } from "@/drizzle/schema";
import { inventoryData } from "@/src/db/schema/inventory";
import { profileData } from "@/src/db/schema/user";
import { and, like } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";

// Regular expression to extract information from Moxfield export format
// Matches patterns like: "2 Card Name (SET) 123 *F*" or "1 Card Name (SET)"
const MOXFIELD_LINE_REGEX = /^(\d+)\s+([^(]+)\s+\(([^)]+)\)(?:\s+(\d+))?(?:\s+(.*))?$/;

// Process a batch of card entries
async function processBatch(
    batch: Array<{
        name: string;
        setCode: string;
        quantity: number;
        isFoil: boolean;
        cardNumber?: string;
        annotations?: string;
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
            // Look up the card in the database by name and set
            const card = await db
                .select({
                    uuid: mtgCards.uuid,
                })
                .from(mtgCards)
                .where(
                    and(
                        like(mtgCards.name, item.name.trim()),
                        like(mtgCards.setCode, item.setCode.trim())
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

            // Extract the UUID
            const uuid = card[0].uuid;

            // Prepare inventory item data
            bulkInsertItems.push({
                userId: userId,
                type: "single",
                foreignKeySource: "mtg.cards",
                foreignKey: uuid,
                price: 0, // Default price, as Moxfield doesn't typically include pricing
                quantity: item.quantity,
                quality: "NM", // Default to Near Mint
                language: "en", // Default to English
                comment: item.annotations || null,
                internalComment: `Imported from Moxfield on ${new Date().toISOString()}`,
                isFoil: item.isFoil ? 1 : 0,
                isAltered: 0,
                isSigned: 0,
                isMisprint: 0,
                isSealed: 0,
                isListed: isListed ? 1 : 0,
                isGraded: 0,
            });
        } catch (error) {
            errorItems.push({
                item,
                error: `Failed to process item: ${
                    error instanceof Error ? error.message : "Unknown error"
                } (${item.name})`,
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
                    error: `Failed during bulk insert: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
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
            data: errorItem.item,
        });
    }
}

// Parse Moxfield export text and extract card information
function parseMoxfieldText(text: string): Array<{
    name: string;
    setCode: string;
    quantity: number;
    isFoil: boolean;
    cardNumber?: string;
    annotations?: string;
}> {
    // Split the text into lines and filter out empty lines
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Parse each line
    return lines.map((line, index) => {
        // Try to match the line against our regex
        const match = line.match(MOXFIELD_LINE_REGEX);
        
        if (!match) {
            throw new Error(`Invalid format at line ${index + 1}: ${line}`);
        }
        
        // Extract data from the match
        const [_, quantityStr, cardName, setCode, cardNumber, annotations] = match;
        
        // Check for foil annotation
        const isFoil = annotations ? /foil|F|\*F\*/i.test(annotations) : false;
        
        return {
            name: cardName.trim(),
            setCode: setCode.trim(),
            quantity: parseInt(quantityStr, 10),
            isFoil,
            cardNumber: cardNumber?.trim(),
            annotations: annotations?.trim(),
        };
    });
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Moxfield import started`);
    
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

        // Get request body
        const body = await request.json();
        const { text, listingOption } = body;
        const isListed = listingOption === 'listed';

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return NextResponse.json({ 
                success: false, 
                message: "No text data provided" 
            }, { status: 400 });
        }

        // Parse the Moxfield text
        console.log(`[${new Date().toISOString()}] Parsing Moxfield text`);
        let parsedCards;
        try {
            parsedCards = parseMoxfieldText(text);
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to parse Moxfield data",
                imported: 0,
                failed: 1,
            }, { status: 400 });
        }

        if (parsedCards.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "No valid card entries found in the provided text" 
            }, { status: 400 });
        }

        console.log(`[${new Date().toISOString()}] Moxfield text parsed, ${parsedCards.length} cards found`);

        // Process records
        const results = { 
            success: 0, 
            failed: 0, 
            errors: [] as any[] 
        };

        // Process all cards at once since we typically won't have thousands in a Moxfield export
        await processBatch(parsedCards, userId, isListed, results);
        console.log(`[${new Date().toISOString()}] Processed cards. Results: ${results.success} successful, ${results.failed} failed`);

        // Prepare result message
        let message = `Import completed. Successfully imported ${results.success} cards.`;
        if (results.failed > 0) {
            message += ` Failed to import ${results.failed} cards.`;
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