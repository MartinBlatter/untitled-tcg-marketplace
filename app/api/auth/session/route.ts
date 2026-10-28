import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import db from '@/src/db/mysql';
import { profileSettingsData } from '@/src/db/schema/user';
import { getServerSession } from '@/src/lib/auth/session';

/**
 * The client session endpoint, read by src/lib/context/AuthProvider.
 *
 * Its only reason to exist is `settings`: the session cookie carries the
 * identity, but `profileSettings` is unbounded and client-only, so it is
 * fetched rather than signed into the cookie.
 *
 * Replaces NextAuth's /api/auth/session.
 */

const NO_STORE = { 'cache-control': 'no-store' } as const;

export async function GET() {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json({ session: null }, { headers: NO_STORE });
    }

    try {
        const settings = await db
            .select()
            .from(profileSettingsData)
            .where(eq(profileSettingsData.userId, session.userId));

        return NextResponse.json({ session: { ...session, settings } }, { headers: NO_STORE });
    } catch (error) {
        // Settings are presentation preferences; losing them must not sign the
        // user out, so return the session with an empty set.
        console.error('[auth] failed to load profile settings', error);
        return NextResponse.json({ session: { ...session, settings: [] } }, { headers: NO_STORE });
    }
}
