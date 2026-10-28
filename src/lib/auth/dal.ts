import 'server-only';

import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import db from '@/src/db/mysql';
import { profileData } from '@/src/db/schema/user';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { getServerSession } from './session';
import { hasRole } from './roles';
import type { Session } from '@/types/session';

/**
 * Centralised authorisation checks, per the Next.js guidance that security
 * checks belong as close to the data as possible.
 *
 * proxy.ts is an optimistic check only - it runs on prefetches and reads
 * nothing but the cookie. These are the real gate.
 */

const NO_STORE = { 'cache-control': 'no-store' } as const;

/**
 * For pages and layouts: returns the session or sends the user to /login.
 *
 * `cache()` dedupes this within a single render pass. It does nothing in Server
 * Actions and Route Handlers, which are not part of a render pass - those
 * should use `requireSession()`.
 */
export const verifySession = cache(async (): Promise<Session> => {
    const session = await getServerSession();

    if (!session) {
        redirect(INTERNAL_ROUTES.LOGIN);
    }

    return session;
});

type RequireSessionResult =
    | { session: Session; response?: never }
    | { session?: never; response: NextResponse };

/**
 * For route handlers, which cannot `redirect()` and have no `throw new Response`
 * convention in Next.js. Returns either the session or the response to return:
 *
 *   const { session, response } = await requireSession();
 *   if (response) return response;
 */
export async function requireSession(): Promise<RequireSessionResult> {
    const session = await getServerSession();

    if (!session) {
        return {
            response: NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE }),
        };
    }

    return { session };
}

/**
 * As `requireSession`, plus a role check.
 *
 * Note the roles come from the cookie, so they are a snapshot from login time.
 * Granting a role takes effect on the user's next login.
 */
export async function requireRole(role: string): Promise<RequireSessionResult> {
    const result = await requireSession();
    if (result.response) return result;

    if (!hasRole(result.session.roles, role)) {
        return {
            response: NextResponse.json({ error: 'forbidden' }, { status: 403, headers: NO_STORE }),
        };
    }

    return result;
}

/**
 * The current user's `profiledata` row, for when the cookie's snapshot is not
 * enough. Selects explicit columns so `passwordHash` can never leak upwards.
 */
export const getCurrentUser = cache(async () => {
    const session = await getServerSession();
    if (!session) return null;

    try {
        const rows = await db
            .select({
                id: profileData.id,
                userName: profileData.userName,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                company: profileData.company,
                address: profileData.address,
                eMail: profileData.eMail,
                country: profileData.country,
                active: profileData.active,
                onVacation: profileData.onVacation,
                roles: profileData.roles,
            })
            .from(profileData)
            .where(eq(profileData.id, session.userId));

        return rows[0] ?? null;
    } catch (error) {
        console.error('[auth] failed to load the current user', error);
        return null;
    }
});
