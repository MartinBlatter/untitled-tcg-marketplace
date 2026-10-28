import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { serverEnv } from '@/src/env';
import { parseRoles } from './roles';
import type { Session, SessionPayload } from '@/types/session';

/**
 * Stateless sessions: a signed JWT in an httpOnly cookie.
 *
 * Everything `getServerSession()` returns comes out of the cookie, so reading a
 * session costs no database queries at all. That is deliberate — the previous
 * NextAuth `session` callback ran two queries per call, and `getServerSession`
 * is called from ~100 route handlers.
 *
 * The price is staleness: `userName` and `roles` are snapshots taken at login.
 * Anything that changes them has to re-issue the cookie — see `createSession`
 * callers, in particular app/api/profile/update/route.ts.
 *
 * `profileSettings` deliberately does NOT live in here. It is unbounded, and it
 * is only ever read client-side, so it is served by GET /api/auth/session.
 */

/**
 * A new name rather than reusing `next-auth.session-token`, so that a cookie
 * left over from the Auth0 era is simply ignored instead of being fed to a
 * verifier that would reject it on every request.
 */
export const SESSION_COOKIE = 'tcg.session';

/** The cookie NextAuth used to set. Cleared on login so browsers stop sending it. */
export const LEGACY_SESSION_COOKIES = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
] as const;

const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Read at call time, not module load, so tests can vary it per case. */
function key(): Uint8Array {
    return new TextEncoder().encode(serverEnv('SESSION_SECRET'));
}

export async function encrypt(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${MAX_AGE_SECONDS}s`)
        .sign(key());
}

/**
 * Returns `null` for a missing, expired, tampered or otherwise unusable token.
 * Never throws, so a stale cookie cannot 500 a page.
 */
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });

        // A token can be correctly signed and still not be a session we can use
        // -- for instance one issued before a payload change.
        if (typeof payload.userId !== 'number' || typeof payload.email !== 'string') {
            return null;
        }

        return {
            userId: payload.userId,
            email: payload.email,
            userName: typeof payload.userName === 'string' ? payload.userName : null,
            roles: Array.isArray(payload.roles) ? payload.roles.filter(r => typeof r === 'string') : [],
            expiresAt: typeof payload.exp === 'number' ? payload.exp * 1000 : Date.now(),
        };
    } catch {
        return null;
    }
}

function cookieOptions(expiresAt: Date) {
    return {
        httpOnly: true,
        // Not hardcoded true: a plain-http local dev server would silently drop it.
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        expires: expiresAt,
        path: '/',
    };
}

/** Issues (or re-issues) the session cookie. Also clears any NextAuth leftovers. */
export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>): Promise<void> {
    const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000);
    const token = await encrypt({ ...payload, expiresAt: expiresAt.getTime() });
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, token, cookieOptions(expiresAt));

    for (const name of LEGACY_SESSION_COOKIES) {
        cookieStore.delete(name);
    }
}

/**
 * Slides the expiry forward for an active user. No-op without a valid session.
 */
export async function refreshSession(): Promise<void> {
    const cookieStore = await cookies();
    const payload = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
    if (!payload) return;

    const { expiresAt: _ignored, ...rest } = payload;
    await createSession(rest);
}

export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);

    for (const name of LEGACY_SESSION_COOKIES) {
        cookieStore.delete(name);
    }
}

/** Maps the cookie payload onto the shape the application already consumes. */
export function toSession(payload: SessionPayload): Session {
    return {
        user: { name: payload.userName, email: payload.email },
        userId: payload.userId,
        userName: payload.userName,
        roles: payload.roles,
        expires: new Date(payload.expiresAt).toISOString(),
    };
}

/**
 * Drop-in replacement for NextAuth's `getServerSession()`.
 *
 * Same name and same returned shape, so the ~100 existing call sites only
 * changed their import. Unlike NextAuth's, it takes no options argument and
 * always returns the full session - the bare `getServerSession()` calls used to
 * get a session with `userId`, `userName` and `roles` all undefined.
 */
export async function getServerSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const payload = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
    return payload ? toSession(payload) : null;
}

/** Builds the cookie payload from a `profiledata` row. */
export function payloadFromProfile(row: {
    id: number;
    eMail: string | null;
    userName: string | null;
    roles: string | null;
}): Omit<SessionPayload, 'expiresAt'> {
    return {
        userId: row.id,
        email: (row.eMail ?? '').toLowerCase(),
        userName: row.userName,
        roles: parseRoles(row.roles),
    };
}
