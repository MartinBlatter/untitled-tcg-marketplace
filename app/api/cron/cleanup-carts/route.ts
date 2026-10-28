import { tableMap } from '@/src/constants/tables';
import db from '@/src/db/mysql';
import { shoppingCartData, shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { rejectUnauthorizedCron } from '@/src/utils/cron.auth';
import { inArray, lt, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Specify that this route requires Node.js runtime
export const runtime = 'nodejs';

/**
 * Cron job endpoint to delete shopping carts older than 12 hours and return items to inventory
 * Scheduled hourly in vercel.json; every request must carry the CRON_SECRET bearer token.
 */
export async function GET(request: NextRequest) {
    const unauthorized = rejectUnauthorizedCron(request);
    if (unauthorized) return unauthorized;

    try {
        // Calculate the timestamp for 12 hours ago
        const twelveHoursAgo = new Date();
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
        const twelveHoursAgoISOString = twelveHoursAgo.toISOString();

        console.log(`[Cron] Finding shopping carts older than ${twelveHoursAgoISOString}...`);

        // Find old shopping carts. The cutoff is a bound parameter, so it must not
        // be wrapped in quotes here — that would send the literal string "?".
        const oldCarts = await db
            .select({
                id: shoppingCartData.id,
                createdAt: shoppingCartData.createdAt
            })
            .from(shoppingCartData)
            .where(lt(
                shoppingCartData.createdAt,
                sql`CONVERT_TZ(${twelveHoursAgoISOString}, '+00:00', @@session.time_zone)`
            ));

        if (oldCarts.length === 0) {
            console.log('[Cron] No old shopping carts found to clean up.');
            return NextResponse.json({
                success: true,
                message: 'No old shopping carts found to clean up.',
                processedCarts: 0
            });
        }

        console.log(`[Cron] Found ${oldCarts.length} shopping carts older than 12 hours to clean up.`);
        const cartIds = oldCarts.map(cart => cart.id);

        // Get all items from these carts before deleting
        const cartItems = await db
            .select()
            .from(shoppingCartItemData)
            .where(inArray(shoppingCartItemData.cartId, cartIds));

        console.log(`[Cron] Found ${cartItems.length} items in old carts to process.`);

        // Process each cart item - return to seller's inventory
        let itemsReturned = 0;
        let itemsProcessed = 0;

        for (const item of cartItems) {
            itemsProcessed++;
            
            // Skip shipping items (no inventory to restore)
            if (item.game === 'shipping') {
                continue;
            }

            // Find the original inventory item and update its quantity
            try {
                // Only increase inventory quantity if we have a valid foreignKey and it's from inventory
                if (item.foreignKeySource && item.foreignKey && item.quantity) {
                    // tableMap doubles as the allowlist: the source is a stored
                    // column value, so it must never reach the query as a raw
                    // identifier.
                    const sourceTable = tableMap[`${item.game}.${item.foreignKeySource}`];

                    if (!sourceTable) {
                        console.warn(
                            `[Cron] Unknown inventory source for item ${item.id}: ` +
                            `${item.game}.${item.foreignKeySource} — skipping.`
                        );
                        continue;
                    }

                    // Update the inventory quantity to return the items
                    await db.execute(sql`
                        UPDATE ${sourceTable}
                        SET \`quantity\` = \`quantity\` + ${item.quantity}
                        WHERE \`id\` = ${item.foreignKey}
                    `);
                    
                    itemsReturned++;
                }
            } catch (error) {
                console.error(`[Cron] Error updating inventory for item ${item.id}:`, error);
                // Continue with other items even if one fails
            }
        }

        // Delete all cart items from these carts
        const deleteItemsResult = await db
            .delete(shoppingCartItemData)
            .where(inArray(shoppingCartItemData.cartId, cartIds));

        // Delete the carts themselves
        const deleteCartsResult = await db
            .delete(shoppingCartData)
            .where(inArray(shoppingCartData.id, cartIds));

        const result = {
            success: true,
            message: `Successfully cleaned up ${oldCarts.length} old shopping carts.`,
            processedCarts: oldCarts.length,
            processedItems: itemsProcessed,
            itemsReturned: itemsReturned,
            timestamp: new Date().toISOString()
        };

        console.log('[Cron] Shopping cart cleanup completed:', result);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[Cron] Error cleaning up old shopping carts:', error);
        
        return NextResponse.json(
            {
                error: true,
                message: `Failed to clean up old shopping carts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
            { status: 500 }
        );
    }
}
