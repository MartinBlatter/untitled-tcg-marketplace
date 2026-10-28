import { and, desc, eq, sql } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

import { PAYMENT_STATUS } from '@/src/constants/status';
import db from '@/src/db/mysql';
import { orderData, orderItemData } from '@/src/db/schema/order';
import { profileData } from '@/src/db/schema/user';
import { dateToSqlFormat } from '@/src/utils/helpers';

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession();
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Get user ID from session using direct query approach
        const userEmail = session.user.email?.toLowerCase() || '';
        const userResult = await db.select().from(profileData).where(eq(profileData.eMail, userEmail));

        if (!userResult || userResult.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `User not found for email: ${userEmail}`,
                },
                { status: 404 }
            );
        }

        const user = userResult[0];

        // Get date range from query parameters
        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        // Default to last 30 days if no dates provided
        const endDate = endDateParam ? new Date(endDateParam) : new Date();
        const startDate = startDateParam ? new Date(startDateParam) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Format dates for SQL - ensure proper formatting
        const startDateFormatted = dateToSqlFormat(startDate);
        const endDateFormatted = dateToSqlFormat(endDate);

        // Query 1: Get total purchases count, spent amount, and average order value
        const totalPurchasesResult = await db
            .select({
                count: sql<number>`count(${orderData.id})`,
                totalSpent: sql<number>`sum(${orderData.totalPrice})`,
                avgOrderValue: sql<number>`avg(${orderData.totalPrice})`,
            })
            .from(orderData)
            .where(
                and(
                    eq(orderData.buyerId, user.id),
                    eq(orderData.paymentStatus, PAYMENT_STATUS.PAID),
                    sql`${orderData.createdAt} >= ${startDateFormatted}`,
                    sql`${orderData.createdAt} <= ${endDateFormatted}`
                )
            );

        // Query 2: Get monthly purchases data for chart
        const monthlyPurchasesResult = await db
            .select({
                month: sql`DATE_FORMAT(${orderData.createdAt}, '%Y-%m')`,
                spent: sql<number>`sum(${orderData.totalPrice})`,
            })
            .from(orderData)
            .where(
                and(
                    eq(orderData.buyerId, user.id),
                    eq(orderData.paymentStatus, PAYMENT_STATUS.PAID),
                    sql`${orderData.createdAt} >= ${startDateFormatted}`,
                    sql`${orderData.createdAt} <= ${endDateFormatted}`
                )
            )
            .groupBy(sql`DATE_FORMAT(${orderData.createdAt}, '%Y-%m')`)
            .orderBy(sql`DATE_FORMAT(${orderData.createdAt}, '%Y-%m')`);

        // Query 3: Get top purchased products
        const topPurchasedProductsResult = await db
            .select({
                displayName: orderItemData.displayName,
                totalBought: sql<number>`sum(${orderItemData.quantity})`,
                totalValue: sql<number>`sum(${orderItemData.quantity} * ${orderItemData.price})`,
            })
            .from(orderItemData)
            .innerJoin(orderData, eq(orderItemData.orderId, orderData.id))
            .where(
                and(
                    eq(orderData.buyerId, user.id),
                    eq(orderData.paymentStatus, PAYMENT_STATUS.PAID),
                    sql`${orderData.createdAt} >= ${startDateFormatted}`,
                    sql`${orderData.createdAt} <= ${endDateFormatted}`,
                    sql`${orderItemData.game} != 'shipping'`
                )
            )
            .groupBy(orderItemData.displayName)
            .orderBy(desc(sql<number>`sum(${orderItemData.quantity})`))
            .limit(10);

        // Format data for the frontend using the new consolidated structure
        const monthlyPurchasesData = monthlyPurchasesResult.reduce((acc, item) => {
            const monthLabel = formatMonthLabel(item.month as string | null);
            acc[monthLabel] = Number(item.spent).toFixed(2) || '0';
            return acc;
        }, {} as Record<string, string>);

        const monthlyPurchases = [
            {
                label: 'monthlySales', // Using the same label as the sales chart expects
                ...monthlyPurchasesData,
            },
        ];

        const topPurchasedProductsData = topPurchasedProductsResult.reduce((acc, item) => {
            const productName = item.displayName || 'Unknown Product';
            acc[productName] = Number(item.totalBought) || 0;
            return acc;
        }, {} as Record<string, number>);

        const topPurchasedProducts = [
            {
                label: 'topProducts', // Using the same label as the sales chart expects
                ...topPurchasedProductsData,
            },
        ];

        return NextResponse.json({
            success: true,
            totalPurchases: totalPurchasesResult[0]?.count || 0,
            totalSpent: totalPurchasesResult[0]?.totalSpent || 0,
            avgOrderValue: totalPurchasesResult[0]?.avgOrderValue || 0,
            monthlyPurchases: monthlyPurchases || [],
            topPurchasedProducts: topPurchasedProducts || [],
        });
    } catch (error) {
        console.error('Error fetching purchase statistics:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch purchase statistics',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Helper function to format month labels from YYYY-MM to Month name
function formatMonthLabel(yearMonth: string | null): string {
    if (!yearMonth) return 'Unknown';

    try {
        const [year, month] = yearMonth.split('-');
        const date = new Date(Number(year), Number(month) - 1, 1);

        return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    } catch (error) {
        return 'Unknown';
    }
}
