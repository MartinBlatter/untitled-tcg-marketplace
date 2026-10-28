import { serverEnv } from "@/src/env";
import mysql from "mysql2/promise";
import { requireRole } from "@/src/lib/auth/dal";
import { ROLES } from "@/src/lib/auth/roles";
import { NextRequest, NextResponse } from "next/server";
import { performance } from 'perf_hooks';

// Create a dedicated MySQL connection pool
const importPool = mysql.createPool({
  host: serverEnv('DB_HOST'),
  user: serverEnv('DB_USER'),
  password: serverEnv('DB_PASS'),
  database: serverEnv('DB_SCHEMA'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectAttributes: {}
});

// Set max allowed packet size after connection
importPool.on('connection', async (connection) => {
  try {
    await connection.execute('SET GLOBAL max_allowed_packet = ?', [1024 * 1024 * 16]); // 16MB
  } catch (error) {
    console.warn('Failed to set max_allowed_packet:', error);
  }
});

/**
 * Helper to format milliseconds into a readable duration string
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

/**
 * Update inventory foreign keys to match the new cards table
 * @param options Configuration options for the update process
 */
async function updateInventoryForeignKeys(options: { 
  debugMode?: boolean;
  specificItemId?: number;
  batchSize?: number;
} = {}): Promise<{
  mismatchCount: number;
  repairedCount: number;
  remainingCount: number;
  duration: string;
  diagnostics: any[];
}> {
  const startTime = performance.now();
  console.log("Starting inventory foreign key update...");
  
  // Set default batch size if not provided
  const batchSize = options.batchSize || 500;
  
  const connection = await importPool.getConnection();
  const diagnostics: any[] = [];
  let repairedCount = 0;
  
  try {
    await connection.beginTransaction();
    
    // If a specific item ID was provided, focus on that
    if (options.specificItemId) {
      console.log(`Focusing on specific inventory item ID: ${options.specificItemId}`);
      
      // Get the specific item details
      const [specificItem] = await connection.query(`
        SELECT inv.id, inv.foreignKey, inv.foreignKeySource,
               CASE WHEN cards.uuid IS NULL THEN FALSE ELSE TRUE END as valid_reference
        FROM \`mtg.inventory\` inv 
        LEFT JOIN \`mtg.cards\` cards ON inv.foreignKey = cards.uuid
        WHERE inv.id = ?
      `, [options.specificItemId]);
      
      if (Array.isArray(specificItem) && specificItem.length > 0) {
        const item = specificItem[0] as any;
        console.log(`Found item ${item.id} with foreignKey ${item.foreignKey}, valid reference: ${item.valid_reference}`);
        
        diagnostics.push({
          type: 'specific_item',
          item
        });
        
        // If reference is invalid, try to find the correct UUID in the new cards table
        if (!item.valid_reference && item.foreignKeySource === 'mtg.cards') {
          // Find old card info
          const [oldCardMatch] = await connection.query(`
            SELECT uuid as old_uuid, name, setCode, number
            FROM \`old_mtg.cards\` 
            WHERE uuid = ?
          `, [item.foreignKey]);
          
          if (Array.isArray(oldCardMatch) && oldCardMatch.length > 0) {
            const oldCard = oldCardMatch[0] as any;
            
            // Find matching card in new table by name, setCode, and number
            const [newCardMatch] = await connection.query(`
              SELECT uuid as new_uuid, name, setCode, number
              FROM \`mtg.cards\`
              WHERE name = ? AND setCode = ? ${oldCard.number ? 'AND number = ?' : ''}
              LIMIT 1
            `, oldCard.number ? [oldCard.name, oldCard.setCode, oldCard.number] : [oldCard.name, oldCard.setCode]);
            
            if (Array.isArray(newCardMatch) && newCardMatch.length > 0) {
              const newCard = newCardMatch[0] as any;
              
              // Update the inventory item with the new UUID
              const [updateResult] = await connection.query(`
                UPDATE \`mtg.inventory\` 
                SET foreignKey = ?
                WHERE id = ?
              `, [newCard.new_uuid, item.id]);
              
              const updated = updateResult && typeof updateResult === 'object' && 'affectedRows' in updateResult 
                && (updateResult as any).affectedRows > 0;
                
              if (updated) {
                console.log(`Successfully updated inventory item ${item.id} from ${item.foreignKey} to ${newCard.new_uuid}`);
                repairedCount++;
              }
            } else {
              console.log(`No matching card found in new table for item ${item.id}`);
            }
          } else {
            console.log(`Old card not found in old_mtg.cards for item ${item.id}`);
          }
        }
      } else {
        console.log(`Inventory item with ID ${options.specificItemId} not found`);
      }
    }
    
    // STEP 1: Get a count of all inventory records with missing card references
    console.log("Counting inventory items with broken references...");
    const [mismatchResults] = await connection.query(`
      SELECT COUNT(*) as mismatchCount
      FROM \`mtg.inventory\` inv
      LEFT JOIN \`mtg.cards\` cards ON inv.foreignKey = cards.uuid
      WHERE cards.uuid IS NULL AND inv.foreignKeySource = 'mtg.cards'
    `);
    
    const mismatchCount = Array.isArray(mismatchResults) && mismatchResults.length > 0 
      ? (mismatchResults[0] as any).mismatchCount || 0 
      : 0;
    
    console.log(`Initial scan found ${mismatchCount} inventory items with broken references.`);
    
    // Always collect some information about how many total inventory items we have
    const [totalInventory] = await connection.query(`
      SELECT COUNT(*) as totalCount,
             SUM(CASE WHEN inv.foreignKeySource = 'mtg.cards' THEN 1 ELSE 0 END) as uuidCount
      FROM \`mtg.inventory\` inv
    `);
    
    if (Array.isArray(totalInventory) && totalInventory.length > 0) {
      console.log(`Total inventory: ${(totalInventory[0] as any).totalCount}, UUID references: ${(totalInventory[0] as any).uuidCount}`);
      diagnostics.push({
        type: 'inventory_counts',
        counts: totalInventory[0]
      });
    }

    // STEP 2: Create a mapping table from old UUIDs to new UUIDs
    console.log("Creating mapping between old and new card UUIDs based on name, setCode, and number...");
    const [uuidMappingResults] = await connection.query(`
      SELECT 
        old.uuid as old_uuid, 
        new.uuid as new_uuid, 
        old.name,
        old.setCode,
        old.number
      FROM \`old_mtg.cards\` old
      JOIN \`mtg.cards\` new ON 
        old.name = new.name AND 
        old.setCode = new.setCode AND 
        (old.number = new.number OR (old.number IS NULL AND new.number IS NULL))
      WHERE old.uuid != new.uuid
    `);
    
    const uuidMappings = Array.isArray(uuidMappingResults) ? uuidMappingResults : [];
    console.log(`Found ${uuidMappings.length} cards where the UUID has changed between versions`);
    
    // Sample some mappings for diagnostics
    if (options.debugMode && uuidMappings.length > 0) {
      diagnostics.push({
        type: 'uuid_mapping_samples',
        samples: uuidMappings.slice(0, 10)
      });
    }
    
    // STEP 3: Update inventory items with the new UUIDs in batches
    if (uuidMappings.length > 0) {
      console.log("Starting batch updates of inventory items...");
      let processedMappings = 0;
      let successfulUpdates = 0;
      
      // Process in batches
      for (let i = 0; i < uuidMappings.length; i += batchSize) {
        const batchMappings = uuidMappings.slice(i, i + batchSize);
        let batchSuccessCount = 0;
        
        for (const mapping of batchMappings) {
          const oldUuid = (mapping as any).old_uuid;
          const newUuid = (mapping as any).new_uuid;
          
          const [updateResult] = await connection.query(`
            UPDATE \`mtg.inventory\` 
            SET foreignKey = ?
            WHERE foreignKey = ? AND foreignKeySource = 'mtg.cards'
          `, [newUuid, oldUuid]);
          
          if (updateResult && typeof updateResult === 'object' && 'affectedRows' in updateResult) {
            batchSuccessCount += (updateResult as any).affectedRows;
          }
        }
        
        processedMappings += batchMappings.length;
        successfulUpdates += batchSuccessCount;
        console.log(`Processed ${processedMappings}/${uuidMappings.length} mappings, updated ${batchSuccessCount} inventory items in this batch`);
      }
      
      console.log(`UUID mapping updates complete: updated ${successfulUpdates} inventory records using ${uuidMappings.length} UUID mappings`);
      repairedCount += successfulUpdates;
    } else {
      console.log("No UUID mappings found between old and new card tables");
    }
    
    // STEP 4: For remaining problematic items, try a direct repair approach
    console.log("Attempting direct repair for remaining items with broken references...");
    
    const [brokenItems] = await connection.query(`
      SELECT inv.id, inv.foreignKey
      FROM \`mtg.inventory\` inv
      LEFT JOIN \`mtg.cards\` cards ON inv.foreignKey = cards.uuid
      WHERE cards.uuid IS NULL AND inv.foreignKeySource = 'mtg.cards'
      LIMIT 1000
    `);
    
    const brokenItemsList = Array.isArray(brokenItems) ? brokenItems : [];
    console.log(`Found ${brokenItemsList.length} remaining inventory items with broken references`);
    
    let directRepairCount = 0;
    
    if (brokenItemsList.length > 0) {
      // Process remaining broken items in batches
      for (let i = 0; i < brokenItemsList.length; i += batchSize) {
        const batchItems = brokenItemsList.slice(i, i + batchSize);
        let batchRepairCount = 0;
        
        for (const item of batchItems) {
          // Try to find the card in old_mtg.cards
          const [oldCardMatch] = await connection.query(`
            SELECT uuid as old_uuid, name, setCode, number
            FROM \`old_mtg.cards\` 
            WHERE uuid = ?
          `, [(item as any).foreignKey]);
          
          if (Array.isArray(oldCardMatch) && oldCardMatch.length > 0) {
            const oldCard = oldCardMatch[0] as any;
            
            // Try to find a match in the new cards table
            const [newCardMatch] = await connection.query(`
              SELECT uuid as new_uuid
              FROM \`mtg.cards\`
              WHERE name = ? AND setCode = ? ${oldCard.number ? 'AND number = ?' : ''}
              LIMIT 1
            `, oldCard.number ? [oldCard.name, oldCard.setCode, oldCard.number] : [oldCard.name, oldCard.setCode]);
            
            if (Array.isArray(newCardMatch) && newCardMatch.length > 0) {
              const newUuid = (newCardMatch[0] as any).new_uuid;
              
              // Update the inventory item
              const [updateResult] = await connection.query(`
                UPDATE \`mtg.inventory\` 
                SET foreignKey = ?
                WHERE id = ?
              `, [newUuid, (item as any).id]);
              
              if (updateResult && typeof updateResult === 'object' && 'affectedRows' in updateResult && (updateResult as any).affectedRows > 0) {
                batchRepairCount++;
              }
            }
            // If exact match fails, try a looser match
            else {
              // Try just name + setCode
              const [nameSetMatch] = await connection.query(`
                SELECT uuid as new_uuid
                FROM \`mtg.cards\`
                WHERE name = ? AND setCode = ?
                LIMIT 1
              `, [oldCard.name, oldCard.setCode]);
              
              if (Array.isArray(nameSetMatch) && nameSetMatch.length > 0) {
                const newUuid = (nameSetMatch[0] as any).new_uuid;
                
                const [updateResult] = await connection.query(`
                  UPDATE \`mtg.inventory\` 
                  SET foreignKey = ?
                  WHERE id = ?
                `, [newUuid, (item as any).id]);
                
                if (updateResult && typeof updateResult === 'object' && 'affectedRows' in updateResult && (updateResult as any).affectedRows > 0) {
                  batchRepairCount++;
                }
              }
              // As last resort, try just the name
              else {
                const [nameOnlyMatch] = await connection.query(`
                  SELECT uuid as new_uuid
                  FROM \`mtg.cards\`
                  WHERE name = ?
                  LIMIT 1
                `, [oldCard.name]);
                
                if (Array.isArray(nameOnlyMatch) && nameOnlyMatch.length > 0) {
                  const newUuid = (nameOnlyMatch[0] as any).new_uuid;
                  
                  const [updateResult] = await connection.query(`
                    UPDATE \`mtg.inventory\` 
                    SET foreignKey = ?
                    WHERE id = ?
                  `, [newUuid, (item as any).id]);
                  
                  if (updateResult && typeof updateResult === 'object' && 'affectedRows' in updateResult && (updateResult as any).affectedRows > 0) {
                    batchRepairCount++;
                  }
                }
              }
            }
          }
        }
        
        directRepairCount += batchRepairCount;
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, repaired ${batchRepairCount} of ${batchItems.length} items`);
      }
      
      console.log(`Direct repair complete: fixed ${directRepairCount} of ${brokenItemsList.length} remaining items`);
      repairedCount += directRepairCount;
    }
    
    // STEP 5: Check for remaining items with broken references
    const [remainingResults] = await connection.query(`
      SELECT COUNT(*) as remainingCount
      FROM \`mtg.inventory\` inv
      LEFT JOIN \`mtg.cards\` cards ON inv.foreignKey = cards.uuid
      WHERE cards.uuid IS NULL AND inv.foreignKeySource = 'mtg.cards'
    `);
    
    const remainingCount = Array.isArray(remainingResults) && remainingResults.length > 0 
      ? (remainingResults[0] as any).remainingCount || 0 
      : 0;
    
    if (remainingCount > 0 && options.debugMode) {
      console.log(`Warning: ${remainingCount} inventory items still have broken references`);
      
      // Get sample of remaining problematic items
      const [remainingSample] = await connection.query(`
        SELECT inv.id, inv.foreignKey
        FROM \`mtg.inventory\` inv
        LEFT JOIN \`mtg.cards\` cards ON inv.foreignKey = cards.uuid
        WHERE cards.uuid IS NULL AND inv.foreignKeySource = 'mtg.cards'
        LIMIT 20
      `);
      
      if (Array.isArray(remainingSample) && remainingSample.length > 0) {
        diagnostics.push({
          type: 'remaining_problem_items',
          items: remainingSample
        });
      }
    }
    
    await connection.commit();
    const duration = performance.now() - startTime;
    console.log(`Inventory foreign key update complete: repaired ${repairedCount} items (took ${formatDuration(duration)})`);
    
    return {
      mismatchCount,
      repairedCount,
      remainingCount,
      duration: formatDuration(duration),
      diagnostics
    };
  } catch (error) {
    console.error("Error during inventory foreign key update, rolling back:", error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * API endpoint to update inventory foreign keys
 */
export async function GET(request: NextRequest) {
  try {
    // Admin only: this rewrites the foreign keys on every seller's inventory
    // rows, so a session alone is not enough to reach it.
    const { response } = await requireRole(ROLES.ADMIN);
    if (response) return response;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const debugMode = searchParams.get('debug') === 'true';
    const specificItemId = searchParams.get('itemId') ? parseInt(searchParams.get('itemId') || '0', 10) : undefined;
    const batchSize = searchParams.get('batchSize') ? parseInt(searchParams.get('batchSize') || '500', 10) : undefined;
    
    console.log(`Starting inventory foreign key update... ${specificItemId ? `(focusing on item ${specificItemId})` : ''} ${debugMode ? '(debug mode)' : ''}`);

    try {
      // Run the update process
      const result = await updateInventoryForeignKeys({
        debugMode,
        specificItemId,
        batchSize
      });
      
      // Prepare the response
      const response: any = {
        success: true,
        message: `Inventory foreign key update completed.`,
        details: {
          itemsFound: result.mismatchCount,
          itemsRepaired: result.repairedCount,
          itemsRemaining: result.remainingCount,
          executionTime: result.duration
        }
      };
      
      // Include diagnostics if debug mode was enabled
      if (debugMode) {
        response.diagnostics = result.diagnostics;
      }
      
      return NextResponse.json(response, { status: 200 });
      
    } catch (error) {
      console.error("Error during inventory key update process:", error);
      
      return NextResponse.json({
        success: false,
        message: `Error during inventory key update process: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Unexpected error during inventory key update:", error);
    
    return NextResponse.json({
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}