import { NextResponse, type NextRequest } from 'next/server';
import { decrypt, SESSION_COOKIE } from '@/src/lib/auth/session';

/**
 * Optimistic auth check. Next 16 renamed middleware.ts to proxy.ts.
 *
 * This runs on every matched request, prefetches included, so it only reads and
 * verifies the session cookie and never touches the database. It exists to keep
 * signed-out users off these pages, not to protect data - that is
 * src/lib/auth/dal.ts, which runs next to the queries.
 *
 * Proxy is on the Node.js runtime in Next 16, so `jose` works here directly and
 * the `runtime` config option must not be set (it throws).
 */

/**
 * Pages that make no sense without a user. Wider than the list this replaced,
 * which named five bare paths and so left /checkout, /messages, /sales/*,
 * /purchases/*, /buylists, /statistics/*, /picking-lists/* and the nested
 * wishlist routes open.
 */
export const config = {
    matcher: [
        '/profile/:path*',
        '/company-profile/:path*',
        '/inventory/:path*',
        '/wishlists/:path*',
        '/buylists/:path*',
        '/checkout/:path*',
        '/messages/:path*',
        '/purchases/:path*',
        '/sales/:path*',
        '/statistics/:path*',
        '/picking-lists/:path*',
    ],
};

export default async function proxy(request: NextRequest) {
    const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);

    if (session) {
        return NextResponse.next();
    }

    // Remember where they were headed so login can send them back. Only the
    // path and query: src/lib/auth/actions.ts rejects anything else.
    const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const login = new URL('/login', request.nextUrl);
    login.searchParams.set('next', target);

    return NextResponse.redirect(login);
}
