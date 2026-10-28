/**
 * Roles, stored as a comma-separated list in `profiledata.roles`.
 *
 * Parsing lives here and nowhere else, so the storage format stays an
 * implementation detail: everything upstream deals in `string[]`.
 */

/** Roles the application actually checks for. */
export const ROLES = {
    /** Unlocks the seller/company profile at /profile/business. */
    BUSINESS: 'Business',
    /**
     * Catalogue maintenance under /api/magic: the MTGJSON import, the inventory
     * key rewrite and the image tooling. These rebuild shared tables that every
     * account reads, so they are deliberately not something an ordinary signed-in
     * user can reach.
     *
     * Grant with: pnpm tsx scripts/grant-role.ts <email> Admin
     */
    ADMIN: 'Admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Tolerates null, empty strings, stray whitespace and duplicates. */
export function parseRoles(stored: string | null | undefined): string[] {
    if (!stored) return [];

    const seen = stored
        .split(',')
        .map(role => role.trim())
        .filter(role => role.length > 0);

    return [...new Set(seen)];
}

export function serializeRoles(roles: readonly string[]): string {
    const unique = [...new Set(roles.map(role => role.trim()).filter(role => role.length > 0))];
    return unique.join(',');
}

export function hasRole(roles: readonly string[] | undefined, role: string): boolean {
    return Boolean(roles?.includes(role));
}
