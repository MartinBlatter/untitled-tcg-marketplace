/**
 * @jest-environment node
 *
 * next/server needs the Web `Request` global, and jose needs a real WebCrypto -
 * neither of which jsdom provides.
 *
 * These are the checks that actually gate the API routes, so the cases that
 * matter are the refusals.
 */

// Only dynamic imports below (modules are re-imported per test after
// jest.resetModules), so this marks the file as a module rather than a global
// script - otherwise `cookieStore` collides with the DOM global of that name.
export {};

const cookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
const redirectMock = jest.fn(() => {
    // The real `redirect` throws to unwind the render, and verifySession's
    // return type relies on that.
    throw new Error('NEXT_REDIRECT');
});

jest.mock('next/headers', () => ({ cookies: jest.fn(async () => cookieStore) }));
jest.mock('next/navigation', () => ({ redirect: (...args: unknown[]) => redirectMock(...(args as [])) }));
jest.mock('@/src/db/mysql', () => ({
    __esModule: true,
    default: { select: jest.fn(), update: jest.fn(), insert: jest.fn() },
}));

const SECRET = 'test-secret-at-least-32-bytes-long!!';

async function signedInAs(session: { userId: number; roles: string[] }) {
    const { encrypt, SESSION_COOKIE } = await import('@/src/lib/auth/session');
    const token = await encrypt({
        userId: session.userId,
        email: 'player@example.com',
        userName: 'player',
        roles: session.roles,
        expiresAt: Date.now() + 60000,
    });
    cookieStore.get.mockImplementation((name: string) =>
        name === SESSION_COOKIE ? { value: token } : undefined
    );
}

describe('requireSession', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env.SESSION_SECRET = SECRET;
    });

    it('returns a 401 response and no session when signed out', async () => {
        cookieStore.get.mockReturnValue(undefined);
        const { requireSession } = await import('@/src/lib/auth/dal');

        const { session, response } = await requireSession();

        expect(session).toBeUndefined();
        expect(response!.status).toBe(401);
        expect(response!.headers.get('cache-control')).toBe('no-store');
        await expect(response!.json()).resolves.toEqual({ error: 'unauthorized' });
    });

    it('returns a 401 for a tampered cookie rather than throwing', async () => {
        cookieStore.get.mockReturnValue({ value: 'not.a.real.token' });
        const { requireSession } = await import('@/src/lib/auth/dal');

        const { response } = await requireSession();

        expect(response!.status).toBe(401);
    });

    it('returns the session and no response when signed in', async () => {
        await signedInAs({ userId: 42, roles: [] });
        const { requireSession } = await import('@/src/lib/auth/dal');

        const { session, response } = await requireSession();

        expect(response).toBeUndefined();
        expect(session!.userId).toBe(42);
    });
});

describe('requireRole', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env.SESSION_SECRET = SECRET;
    });

    it('401s when signed out, not 403 - the caller is unauthenticated, not forbidden', async () => {
        cookieStore.get.mockReturnValue(undefined);
        const { requireRole } = await import('@/src/lib/auth/dal');

        const { response } = await requireRole('Business');

        expect(response!.status).toBe(401);
    });

    it('403s when the session lacks the role', async () => {
        await signedInAs({ userId: 42, roles: ['Something-Else'] });
        const { requireRole } = await import('@/src/lib/auth/dal');

        const { response } = await requireRole('Business');

        expect(response!.status).toBe(403);
        await expect(response!.json()).resolves.toEqual({ error: 'forbidden' });
    });

    it('passes the session through when the role is present', async () => {
        await signedInAs({ userId: 42, roles: ['Business'] });
        const { requireRole } = await import('@/src/lib/auth/dal');

        const { session, response } = await requireRole('Business');

        expect(response).toBeUndefined();
        expect(session!.userId).toBe(42);
    });

    it('is exact, not a prefix match', async () => {
        await signedInAs({ userId: 42, roles: ['BusinessAdmin'] });
        const { requireRole } = await import('@/src/lib/auth/dal');

        const { response } = await requireRole('Business');

        expect(response!.status).toBe(403);
    });
});

describe('verifySession', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env.SESSION_SECRET = SECRET;
    });

    it('redirects to /login when signed out', async () => {
        cookieStore.get.mockReturnValue(undefined);
        const { verifySession } = await import('@/src/lib/auth/dal');

        await expect(verifySession()).rejects.toThrow('NEXT_REDIRECT');
        expect(redirectMock).toHaveBeenCalledWith('/login');
    });

    it('returns the session without redirecting when signed in', async () => {
        await signedInAs({ userId: 42, roles: [] });
        const { verifySession } = await import('@/src/lib/auth/dal');

        await expect(verifySession()).resolves.toMatchObject({ userId: 42 });
        expect(redirectMock).not.toHaveBeenCalled();
    });
});
