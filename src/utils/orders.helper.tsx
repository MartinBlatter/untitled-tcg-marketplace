import { Order, OrderAddress, OrderCancellation, OrderItem, OrderShipping } from '@/app/api/orders/types';
import { and, eq, or } from 'drizzle-orm';
import db from '../db/mysql';
import { matchesCardUuid } from '../db/joins';
import { fundsData, fundsHistoryData } from '../db/schema/funds';
import { mtgCards } from '../db/schema/magic';
import { orderAddressData, orderCancellationData, orderData, orderItemData, orderShippingData } from '../db/schema/order';
import { CardSet } from '../types/AllMTGJSONTypes';

export const buildOrderObject = async (order: Order) => {
    const [orderItems, orderAddress, orderShipping, orderCancellation] = await Promise.all([
        db
            .select()
            .from(orderItemData)
            .leftJoin(mtgCards, matchesCardUuid(orderItemData.foreignKey))
            .where(eq(orderItemData.orderId, order.id as number)),
        db
            .select()
            .from(orderAddressData)
            .where(eq(orderAddressData.orderId, order.id as number)),
        db
            .select()
            .from(orderShippingData)
            .where(eq(orderShippingData.orderId, order.id as number)),
        db
            .select()
            .from(orderCancellationData)
            .where(eq(orderCancellationData.orderId, order.id as number)),
    ]);

    // Return null if there are no order items
    if (!orderItems || orderItems.length === 0) {
        return null;
    }

    return {
        id: order.id,
        buyerId: order.buyerId,
        game: order.game,
        sellerId: order.sellerId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        totalPrice: order.totalPrice,
        paidAt: order.paidAt,
        shippedAt: order.shippedAt,
        arrivedAt: order.arrivedAt,
        cancelledAt: order.cancelledAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deactivatedAt: order.deactivatedAt,
        orderItems: orderItems.map((item) => ({
            id: item.orderItem.id,
            orderId: item.orderItem.orderId,
            foreignKey: item.orderItem.foreignKey ? Number(item.orderItem.foreignKey) : null,
            foreignKeySource: item.orderItem.foreignKeySource,
            quantity: item.orderItem.quantity,
            price: item.orderItem.price,
            displayName: item.orderItem.displayName,
            game: item.orderItem.game,
            createdAt: item.orderItem.createdAt,
            updatedAt: item.orderItem.updatedAt,
            deactivatedAt: item.orderItem.deactivatedAt,
            originalItem: item.orderItem.originalItem,
            card: item['mtg.cards'] as unknown as CardSet,
        })) as OrderItem[],
        orderAddress: orderAddress[0]
            ? ({
                  id: orderAddress[0].id,
                  orderId: orderAddress[0].orderId,
                  address: orderAddress[0].address,
                  createdAt: orderAddress[0].createdAt,
                  updatedAt: orderAddress[0].updatedAt,
                  deactivatedAt: orderAddress[0].deactivatedAt,
              } as OrderAddress)
            : null,
        orderShipping: orderShipping[0]
            ? ({
                  id: orderShipping[0].id,
                  orderId: orderShipping[0].orderId,
                  displayName: orderShipping[0].displayName,
                  price: orderShipping[0].price,
                  trackingNumber: orderShipping[0].trackingNumber,
                  tracking: orderShipping[0].tracking,
                  createdAt: orderShipping[0].createdAt,
                  updatedAt: orderShipping[0].updatedAt,
                  deactivatedAt: orderShipping[0].deactivatedAt,
              } as OrderShipping)
            : null,
        orderCancellation: orderCancellation[0]
            ? ({
                  id: orderCancellation[0].id,
                  orderId: orderCancellation[0].orderId,
                  message: orderCancellation[0].message,
                  status: orderCancellation[0].status,
                  requestedByUserId: orderCancellation[0].requestedByUserId,
                  acceptedAt: orderCancellation[0].acceptedAt,
                  createdAt: orderCancellation[0].createdAt,
                  updatedAt: orderCancellation[0].updatedAt,
                  deactivatedAt: orderCancellation[0].deactivatedAt,
              } as OrderCancellation)
            : null,
    };
};

export async function setShipped(orderId: number, userId: number) {
    await db
        .update(orderData)
        .set({ shippedAt: new Date() })
        .where(and(eq(orderData.id, orderId), or(eq(orderData.sellerId, userId), eq(orderData.buyerId, userId))));

    const orderRow = await db.select().from(orderData).leftJoin(orderShippingData, eq(orderData.id, orderShippingData.orderId)).where(eq(orderData.id, orderId));

    if (orderRow.length > 0) {
        const order = orderRow[0].order;
        const shipping = orderRow[0].orderShipping;

        if (shipping?.tracking === 0) {
            const sellerFunds = await db
                .select()
                .from(fundsData)
                .where(eq(fundsData.userId, order.sellerId ?? 0));

            await db
                .update(fundsData)
                .set({ funds: (Number(sellerFunds[0].funds) + Number(order.totalPrice)).toFixed(2) })
                .where(eq(fundsData.userId, order.sellerId ?? 0));
            await db.insert(fundsHistoryData).values([
                {
                    fundsId: sellerFunds[0].id,
                    amount: order.totalPrice?.toFixed(2),
                    type: 'sale',
                    addOrSub: 'add',
                    orderId: order.id,
                },
            ]);
        }
    }
}
