import db from '@/src/db/mysql';
import { profileData } from '@/src/db/schema/user';
import { getAvailableShippingShippingDataForUserShoppingCartOrder } from '@/src/utils/shipping.helper';
import { like } from 'drizzle-orm';
import { getServerSession } from '@/src/lib/auth/session';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession();
    const email = session?.user.email;

    try {
        const userRow = await db
            .select()
            .from(profileData)
            .where(like(profileData.eMail, email as string));

        const user = userRow[0];

        const { requiresTracking, shippingData } = await getAvailableShippingShippingDataForUserShoppingCartOrder(user, id);

        return NextResponse.json({ requiresTracking: requiresTracking, shippingData: shippingData, success: true });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
