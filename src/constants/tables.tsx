import { mtgInventory } from '@/drizzle/schema';
import { MySqlTable } from 'drizzle-orm/mysql-core';
import { mtgCards } from '../db/schema/magic';

export const tableMap: Record<string, MySqlTable> = {
    'mtg.inventory': mtgInventory,
    'mtg.cards': mtgCards,
};
