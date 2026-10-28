import { inventoryData } from '@/src/db/schema/inventory';
import { orderData, orderItemData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { and, eq, sql } from "drizzle-orm";
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../src/db/mysql";

export async function POST(request: NextRequest) {
    try {
        // Check user authorization
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ 
                success: false, 
                message: "Unauthorized" 
            }, { status: 401 });
        }

        // Get request body (orderId and selected items)
        const { orderId, items } = await request.json();
        
        if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "Invalid request data" 
            }, { status: 400 });
        }

        // Get user ID by email
        const [userRow] = await db.select({
            id: profileData.id
        })
        .from(profileData)
        .where(eq(profileData.eMail, session.user.email))
        .execute();

        if (!userRow) {
            return NextResponse.json({ 
                success: false, 
                message: "User not found" 
            }, { status: 404 });
        }

        const userId = userRow.id;

        // Verify the order belongs to this user
        const [orderRow] = await db.select()
            .from(orderData)
            .where(and(
                eq(orderData.id, orderId),
                eq(orderData.buyerId, userId)
            ))
            .execute();

        if (!orderRow) {
            return NextResponse.json({ 
                success: false, 
                message: "Order not found or doesn't belong to you" 
            }, { status: 404 });
        }

        // Get selected order items
        const selectedItemIds = items.map((item: any) => item.id);

        // Fetch the detailed data for selected order items
        const orderItems = await db.select()
            .from(orderItemData)
            .where(and(
                eq(orderItemData.orderId, orderId),
                sql`${orderItemData.id} IN (${selectedItemIds.join(',')})`
            ))
            .execute();

        if (orderItems.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "No items found" 
            }, { status: 404 });
        }

        // Add each item to inventory
        const addedItems = [];
        const failedItems = [];

        for (const orderItem of orderItems) {
            // Find the corresponding item from the request to get its 'listed' status
            const requestItem = items.find((item: any) => item.id === orderItem.id);
            if (!requestItem) continue;

            try {
                // Parse originalItem from JSON if needed
                const originalItem = typeof orderItem.originalItem === 'string' 
                    ? JSON.parse(orderItem.originalItem) 
                    : orderItem.originalItem || {};

                // For cards, the foreignKey is the card UUID
                const inventoryItem = {
                    userId: userId,
                    type: orderItem.type || "single",
                    foreignKeySource: orderItem.foreignKeySource || null,
                    foreignKey: orderItem.foreignKey || null,
                    price: orderItem.price || 0,
                    quantity: orderItem.quantity || 1,
                    // Extract these properties from originalItem if available
                    quality: originalItem?.quality || "NM",
                    language: originalItem?.language || "en",
                    isFoil: originalItem?.isFoil ? 1 : 0,
                    isAltered: originalItem?.isAltered ? 1 : 0,
                    isSigned: originalItem?.isSigned ? 1 : 0,
                    isMisprint: originalItem?.isMisprint ? 1 : 0,
                    isSealed: originalItem?.isSealed ? 1 : 0,
                    isListed: requestItem.listed ? 1 : 0,
                    isGraded: originalItem?.isGraded ? 1 : 0,
                    grading: originalItem?.grading || null,
                    gradingCompany: originalItem?.gradingCompany || null,
                    internalComment: `Added from order #${orderId}`,
                    createdAt: new Date(),
                };

                await db.insert(inventoryData).values(inventoryItem).execute();
                addedItems.push(orderItem.id);
            } catch (error) {
                console.error(`Error adding item ${orderItem.id} to inventory:`, error);
                failedItems.push({
                    id: orderItem.id,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Added ${addedItems.length} items to your inventory`,
            addedItems,
            failedItems
        });
    } catch (error) {
        console.error("Error in add-purchased-items API:", error);
        return NextResponse.json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Unknown error occurred",
            error: error 
        }, { status: 500 });
    }
}