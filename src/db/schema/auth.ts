import { mysqlTable, int, varchar, timestamp, primaryKey, index } from "drizzle-orm/mysql-core";
import { timestamps } from "./columns.helpers";

/** The kinds of token `authTokens` can hold. */
export const AUTH_TOKEN_TYPE = {
    PASSWORD_RESET: 'password_reset',
    EMAIL_VERIFICATION: 'email_verification',
} as const;

export type AuthTokenType = (typeof AUTH_TOKEN_TYPE)[keyof typeof AUTH_TOKEN_TYPE];

/**
 * Single-use tokens for out-of-band account operations.
 *
 * One table rather than one per flow, so that adding email verification later
 * is a `type` value and not a migration.
 *
 * Only the SHA-256 of the token is stored. The token itself exists exactly
 * twice: in the reset link handed to the user, and in the request that spends
 * it. A dump of this table therefore grants nothing.
 */
export const authTokens = mysqlTable("authTokens", {
    id: int().autoincrement().notNull(),
    userId: int().notNull(),
    type: varchar({ length: 32 }).notNull(),
    /** Lowercase hex SHA-256 digest - always 64 characters. */
    tokenHash: varchar({ length: 64 }).notNull(),
    expiresAt: timestamp().notNull(),
    /** Set when the token is spent; a non-null value makes it unusable. */
    usedAt: timestamp(),
    ...timestamps
},
    (table) => [
        index("authTokens_tokenHash").on(table.tokenHash),
        index("authTokens_userId").on(table.userId),
        primaryKey({ columns: [table.id], name: "authTokens_id" }),
    ]);
