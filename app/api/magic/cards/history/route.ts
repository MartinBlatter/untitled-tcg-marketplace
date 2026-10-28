import { ORDER_STATUS } from '@/src/constants/status';
import { profileData } from '@/src/db/schema/user';
import { and, desc, eq, sql } from 'drizzle-orm';
import { getServerSession } from "@/src/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../src/db/mysql";
import { orderData, orderItemData } from "../../../../../src/db/schema/order";

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URLSearchParams(request.nextUrl.search);
    const uuid = searchParams.get('uuid');
    if (!uuid) {
        return NextResponse.json({ error: "Missing UUID parameter" }, { status: 400 });
    }

    try {
        // Get current user ID for filtering permissions
        const email = session.user.email;
        if (!email) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        // Get user profile data
        const userProfile = await db
            .select()
            .from(profileData)
            .where(eq(profileData.eMail, email));
        
        if (!userProfile || userProfile.length === 0) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        const userId = userProfile[0].id;

        // Purchase history - cards the user bought
        const purchaseHistory = await db
            .select({
                id: orderItemData.id,
                orderId: orderItemData.orderId,
                date: orderData.paidAt,
                price: orderItemData.price,
                quantity: orderItemData.quantity,
                quality: sql<string>`JSON_UNQUOTE(JSON_EXTRACT(${orderItemData.originalItem}, '$.quality'))`,
                isFoil: sql<number>`CAST(JSON_UNQUOTE(JSON_EXTRACT(${orderItemData.originalItem}, '$.isFoil')) AS UNSIGNED)`,
                seller: profileData.userName,
            })
            .from(orderItemData)
            .innerJoin(orderData, eq(orderItemData.orderId, orderData.id))
            .innerJoin(profileData, eq(orderData.sellerId, profileData.id))
            .where(and(
                eq(orderData.buyerId, userId),
                eq(orderData.paymentStatus, 'paid'),
                eq(orderData.status, ORDER_STATUS.DELIVERED),
                sql`JSON_UNQUOTE(JSON_EXTRACT(${orderItemData.originalItem}, '$.foreignKey')) = ${uuid}`,
            ))
            .orderBy(desc(orderData.paidAt))
            .limit(50);  // Limit to recent purchases to avoid performance issues

        // Sales history - cards the user sold
        const salesHistory = await db
            .select({
                id: orderItemData.id,
                orderId: orderItemData.orderId,
                date: orderData.paidAt,
                price: orderItemData.price,
                quantity: orderItemData.quantity,
                quality: sql<string>`JSON_UNQUOTE(JSON_EXTRACT(${orderItemData.originalItem}, '$.quality'))`,
                isFoil: sql<number>`CAST(JSON_UNQUOTE(JSON_EXTRACT(${orderItemData.originalItem}, '$.isFoil')) AS UNSIGNED)`,
                buyer: profileData.userName,
            })
            .from(orderItemData)
            .innerJoin(orderData, eq(orderItemData.orderId, orderData.id))
            .innerJoin(profileData, eq(orderData.buyerId, profileData.id))
            .where(and(
                eq(orderData.sellerId, userId),
                eq(orderData.paymentStatus, 'paid'),
                eq(orderData.status, ORDER_STATUS.DELIVERED),
                sql`JSON_UNQUOTE(JSON_EXTRACT(${orderItemData.originalItem}, '$.foreignKey')) = ${uuid}`,
            ))
            .orderBy(desc(orderData.paidAt))
            .limit(50);  // Limit to recent sales to avoid performance issues

        // Return both purchase and sales history
        return NextResponse.json({
            success: true,
            purchaseHistory,
            salesHistory,
        });

    } catch (error) {
        console.error("Error fetching card history:", error);
        return NextResponse.json({
            success: false,
            error: "Internal Server Error",
        }, { status: 500 });
    }
}