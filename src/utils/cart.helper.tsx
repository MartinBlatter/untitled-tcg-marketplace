import { Order } from '@/app/api/orders/types';
import { eq, sql } from 'drizzle-orm';
import { PAYMENT_STATUS } from '../constants/status';
import { tableMap } from '../constants/tables';
import db from '../db/mysql';
import { fundsData, fundsHistoryData } from '../db/schema/funds';
import { orderData } from '../db/schema/order';
import { shoppingCartItemData } from '../db/schema/shoppingcart';
import { calculateCartShippingCosts } from './shipping.helper';

export async function validateItemAvailability(items: any, buyerCountry: string | null) {
    let isValid = true;

    for (const item of items.filter((item: any) => item.game !== 'shipping')) {
        const sourceTable = `${item.game}.${item.foreignKeySource}`;
        const query = sql`SELECT \`foreignKey\`, \`foreignKeySource\`, \`quantity\` FROM ${tableMap[sourceTable]} WHERE id = ${item.foreignKey}`;
        const [sourceRow] = await db.execute(query);

        if ((sourceRow as any).length === 0) {
            await db.delete(shoppingCartItemData).where(eq(shoppingCartItemData.id, item.id));
            await calculateCartShippingCosts(item.cartId as number, buyerCountry);
            isValid = false;
        }

        if (Number((sourceRow as any)[0].quantity) < Number(item.quantity)) {
            await db
                .update(shoppingCartItemData)
                .set({ quantity: Number((sourceRow as any)[0].quantity) })
                .where(eq(shoppingCartItemData.id, item.id));
            await calculateCartShippingCosts(item.cartId as number, buyerCountry);
            isValid = false;
        }
    }

    return isValid;
}

export async function payOrder(order: Order) {
    const buyerFunds = await db
        .select()
        .from(fundsData)
        .where(eq(fundsData.userId, order.buyerId ?? 0));

    if (buyerFunds.length === 0) {
        await db.insert(fundsData).values({ userId: order.buyerId ?? 0, funds: '0' });
        return false;
    }

    if (buyerFunds[0].funds && order.totalPrice && Number(buyerFunds[0].funds) >= Number(order.totalPrice)) {
        await db
            .update(orderData)
            .set({ paymentStatus: PAYMENT_STATUS.PAID, paidAt: new Date() })
            .where(eq(orderData.id, order.id ?? 0));
        await db
            .update(fundsData)
            .set({ funds: (Number(buyerFunds[0].funds) - Number(order.totalPrice)).toFixed(2) })
            .where(eq(fundsData.userId, order.buyerId ?? 0));
        await db.insert(fundsHistoryData).values([
            {
                fundsId: buyerFunds[0].id,
                amount: order.totalPrice.toFixed(2),
                type: 'purchase',
                addOrSub: 'sub',
                orderId: order.id,
            },
        ]);

        return true;
    } else {
        return false;
    }
}
