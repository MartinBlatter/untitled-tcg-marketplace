'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';
import { useSession } from '@/src/lib/context/AuthProvider';

/**
 * Onboarding gate, mounted globally in app/layout.tsx.
 *
 * Registration creates the account with no `userName`, so a newly registered
 * user is sent to /profile once to pick one and fill in the name, address and
 * country that checkout needs.
 *
 * The redirect runs in an effect. It used to call `router.push` straight from
 * the render body, which mutates router state while React is rendering.
 */
export default function ProfileRedirect() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const router = useRouter();

    const needsOnboarding = status === 'authenticated' && !session?.userName;

    useEffect(() => {
        if (!needsOnboarding) return;
        if (pathname === INTERNAL_ROUTES.PROFILE.ROOT) return;

        router.push(INTERNAL_ROUTES.PROFILE.ROOT);
    }, [needsOnboarding, pathname, router]);

    return null;
}
