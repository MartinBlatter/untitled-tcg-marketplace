import db from '@/src/db/mysql';
import { inventoryData } from '@/src/db/schema/inventory';
import { shoppingCartItemData } from '@/src/db/schema/shoppingcart';
import { profileData } from '@/src/db/schema/user';
import { and, asc, eq, inArray, like } from 'drizzle-orm';
import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ uuid: string }> }) {
    const params = await props.params;
    const uuid = params.uuid;

    try {
        const rows = await db
            .select()
            .from(inventoryData)
            .where(and(like(inventoryData.foreignKey, uuid), eq(inventoryData.isListed, 1)))
            .leftJoin(profileData, eq(profileData.id, inventoryData.userId))
            .orderBy(asc(inventoryData.price));
        const ids = rows.map((item) => item['mtg.inventory'].id as unknown as string);

        const cartItems = await db.select().from(shoppingCartItemData).where(inArray(shoppingCartItemData.foreignKey, ids));

        const finalResult: any = [];
        rows.forEach((item: any) => {
            const cartItem = cartItems.find((i: any) => i.foreignKey == item['mtg.inventory'].id);
            if (cartItem && cartItem.quantity) {
                item['mtg.inventory'].quantity = item['mtg.inventory'].quantity - cartItem.quantity;
            }
            if (item['mtg.inventory'].quantity <= 0) return;
            const newItem = { ...item['mtg.inventory'], user: item['profiledata'].userName, country: item['profiledata'].country };
            finalResult.push(newItem);
        });

        return NextResponse.json({ items: finalResult, success: true });
    } catch (error) {
        return NextResponse.json({ error: true }, { status: 500 });
    }
}
