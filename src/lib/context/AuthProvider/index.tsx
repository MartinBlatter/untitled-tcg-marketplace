'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ENDPOINTS } from '@/src/constants/endpoints';
import type { Session, SessionStatus } from '@/types/session';

/**
 * Replaces NextAuth's `SessionProvider` / `useSession`.
 *
 * The hook keeps NextAuth's return shape - `{ data, status, update }` - because
 * 25 components already destructure it in one of exactly three ways, so they
 * only needed their import changed.
 *
 * Unlike NextAuth, the first render already has the session: the root layout is
 * an async Server Component, so it reads the cookie and passes `initialSession`
 * down as a prop. There is no `loading` flash and no fetch on first paint. The
 * fetch exists only to pick up `settings`, which is too large for the cookie.
 */

type SessionContextValue = {
    data: Session | null;
    status: SessionStatus;
    update: () => Promise<Session | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type Props = {
    children?: React.ReactNode;
    /** Read from the cookie on the server. `null` means signed out. */
    initialSession: Session | null;
};

export const AuthProvider = ({ children, initialSession }: Props) => {
    const [session, setSession] = useState<Session | null>(initialSession);

    // Server-rendered value wins on navigation, so logging out in another tab
    // or re-issuing the cookie is reflected without a client fetch.
    useEffect(() => {
        setSession(initialSession);
    }, [initialSession]);

    const update = useCallback(async (): Promise<Session | null> => {
        try {
            const response = await fetch(ENDPOINTS.API.AUTH.SESSION, { cache: 'no-store' });
            if (!response.ok) {
                setSession(null);
                return null;
            }

            const body = await response.json();
            const next: Session | null = body?.session ?? null;
            setSession(next);
            return next;
        } catch {
            // A failed refresh is not proof of being signed out - keep what we have.
            return session;
        }
    }, [session]);

    // `settings` only comes from the endpoint, so fetch once when signed in.
    useEffect(() => {
        if (!initialSession || initialSession.settings) return;
        void update();
        // Deliberately keyed on identity only: re-running on `update` would loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSession?.userId]);

    const value = useMemo<SessionContextValue>(
        () => ({
            data: session,
            status: session ? 'authenticated' : 'unauthenticated',
            update,
        }),
        [session, update]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/**
 * Drop-in for `useSession` from `next-auth/react`.
 *
 * Supports the three shapes used in this codebase:
 *   const session = useSession();
 *   const { data: session } = useSession();
 *   const { status } = useSession();
 */
export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error('useSession must be used inside <AuthProvider>. It is mounted in app/layout.tsx.');
    }

    return context;
}
