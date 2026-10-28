import { sql, type SQL } from 'drizzle-orm';
import type { MySqlColumn } from 'drizzle-orm/mysql-core';
import { mtgCards } from './schema/magic';

/**
 * The collation `mtg.cards.uuid` and its sibling MTGJSON tables are stored in.
 *
 * The `mtg.*` tables arrived from the MTGJSON import as utf8mb4_general_ci,
 * while this application's own tables (`orderItem`, `shoppingCartItems`, ...)
 * were created utf8mb4_unicode_ci.
 */
const CARD_COLLATION = sql.raw('utf8mb4_general_ci');

/**
 * Join predicate for "this column holds an `mtg.cards.uuid`".
 *
 * MySQL refuses to compare two columns whose collations differ and fails the
 * whole statement with ER_CANT_AGGREGATE_2COLLATIONS ("Illegal mix of
 * collations"). Joining `orderItem.foreignKey` (unicode_ci) straight onto
 * `mtg.cards.uuid` (general_ci) therefore threw, and because the callers wrap
 * their queries in try/catch it surfaced as a blanket 500 rather than anything
 * naming a collation.
 *
 * The cast goes on the *application* side on purpose: coercing
 * `mtg.cards.uuid` instead would make the comparison non-sargable and give up
 * the `cards_uuid` index that this lookup depends on. UUIDs are ASCII, so
 * general_ci and unicode_ci agree on equality for every value involved.
 */
export function matchesCardUuid(column: MySqlColumn): SQL {
    return sql`${column} collate ${CARD_COLLATION} = ${mtgCards.uuid}`;
}
