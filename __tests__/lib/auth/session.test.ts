/**
 * @jest-environment node
 *
 * Server-only module: jose v6 is built on WebCrypto, and under jsdom its
 * cross-realm Uint8Array is rejected as an invalid key type.
 *
 * Covers the signed-cookie session: round-trip, and the four ways a token can
 * be unusable. `decrypt` must never throw, because a stale or hostile cookie
 * arrives on an ordinary page request.
 */

// Only dynamic imports below (modules are re-imported per test after
// jest.resetModules), so this marks the file as a module rather than a global
// script - otherwise `cookieStore` collides with the DOM global of that name.
export {};

const cookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
};

jest.mock('next/headers', () => ({
    cookies: jest.fn(async () => cookieStore),
}));

const SECRET = 'test-secret-at-least-32-bytes-long!!';

describe('session tokens', () => {
    const payload = {
        userId: 42,
        email: 'player@example.com',
        userName: 'player',
        roles: ['Business'],
    };

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env.SESSION_SECRET = SECRET;
    });

    it('round-trips a payload', async () => {
        const { encrypt, decrypt } = await import('@/src/lib/auth/session');

        const token = await encrypt({ ...payload, expiresAt: Date.now() + 1000 });
        const decoded = await decrypt(token);

        expect(decoded).toMatchObject(payload);
    });

    it('carries the expiry from the JWT claim, not the payload field', async () => {
        const { encrypt, decrypt } = await import('@/src/lib/auth/session');

        const token = await encrypt({ ...payload, expiresAt: 0 });
        const decoded = await decrypt(token);

        // 30 days out, so comfortably in the future despite expiresAt: 0.
        expect(decoded!.expiresAt).toBeGreaterThan(Date.now());
    });

    it('returns null for a missing token', async () => {
        const { decrypt } = await import('@/src/lib/auth/session');

        await expect(decrypt(undefined)).resolves.toBeNull();
        await expect(decrypt('')).resolves.toBeNull();
    });

    it('returns null for a token that is not a JWT at all', async () => {
        const { decrypt } = await import('@/src/lib/auth/session');

        await expect(decrypt('not.a.jwt')).resolves.toBeNull();
        await expect(decrypt('garbage')).resolves.toBeNull();
    });

    it('rejects a tampered signature', async () => {
        const { encrypt, decrypt } = await import('@/src/lib/auth/session');

        const token = await encrypt({ ...payload, expiresAt: Date.now() + 1000 });
        const [header, body, signature] = token.split('.');
        const tampered = `${header}.${body}.${signature.slice(0, -2)}xy`;

        await expect(decrypt(tampered)).resolves.toBeNull();
    });

    it('rejects a token signed with a different secret', async () => {
        const { encrypt } = await import('@/src/lib/auth/session');
        const token = await encrypt({ ...payload, expiresAt: Date.now() + 1000 });

        // Rotating SESSION_SECRET has to invalidate every existing session.
        jest.resetModules();
        process.env.SESSION_SECRET = 'a-completely-different-secret-value!!';
        const { decrypt } = await import('@/src/lib/auth/session');

        await expect(decrypt(token)).resolves.toBeNull();
    });

    it('rejects an expired token', async () => {
        const { SignJWT } = await import('jose');
        const { decrypt } = await import('@/src/lib/auth/session');

        const expired = await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
            .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
            .sign(new TextEncoder().encode(SECRET));

        await expect(decrypt(expired)).resolves.toBeNull();
    });

    it('rejects a correctly signed token whose payload is the wrong shape', async () => {
        const { SignJWT } = await import('jose');
        const { decrypt } = await import('@/src/lib/auth/session');

        // e.g. a token issued before the payload changed.
        const legacy = await new SignJWT({ sub: 'auth0|abc', email: 'player@example.com' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(new TextEncoder().encode(SECRET));

        await expect(decrypt(legacy)).resolves.toBeNull();
    });

    it('tolerates a token with no roles', async () => {
        const { SignJWT } = await import('jose');
        const { decrypt } = await import('@/src/lib/auth/session');

        const token = await new SignJWT({ userId: 1, email: 'a@b.c' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(new TextEncoder().encode(SECRET));

        const decoded = await decrypt(token);

        expect(decoded).toMatchObject({ userId: 1, email: 'a@b.c', userName: null, roles: [] });
    });
});

describe('cookie handling', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env.SESSION_SECRET = SECRET;
    });

    it('sets an httpOnly, sameSite cookie and clears the NextAuth leftovers', async () => {
        const { createSession, SESSION_COOKIE, LEGACY_SESSION_COOKIES } = await import('@/src/lib/auth/session');

        await createSession({ userId: 7, email: 'a@b.c', userName: null, roles: [] });

        expect(cookieStore.set).toHaveBeenCalledWith(
            SESSION_COOKIE,
            expect.any(String),
            expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
        );

        for (const name of LEGACY_SESSION_COOKIES) {
            expect(cookieStore.delete).toHaveBeenCalledWith(name);
        }
    });

    it('getServerSession returns null when there is no cookie', async () => {
        cookieStore.get.mockReturnValue(undefined);
        const { getServerSession } = await import('@/src/lib/auth/session');

        await expect(getServerSession()).resolves.toBeNull();
    });

    it('getServerSession exposes the shape the app consumes', async () => {
        const { encrypt, getServerSession, SESSION_COOKIE } = await import('@/src/lib/auth/session');

        const token = await encrypt({
            userId: 42,
            email: 'player@example.com',
            userName: 'player',
            roles: ['Business'],
            expiresAt: Date.now() + 1000,
        });
        cookieStore.get.mockImplementation((name: string) =>
            name === SESSION_COOKIE ? { value: token } : undefined
        );

        const session = await getServerSession();

        // These five are what the ~120 call sites actually read.
        expect(session!.user.email).toBe('player@example.com');
        expect(session!.user.name).toBe('player');
        expect(session!.userId).toBe(42);
        expect(session!.userName).toBe('player');
        expect(session!.roles).toEqual(['Business']);
        expect(typeof session!.expires).toBe('string');
    });

    it('deleteSession removes the session cookie', async () => {
        const { deleteSession, SESSION_COOKIE } = await import('@/src/lib/auth/session');

        await deleteSession();

        expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
    });
});
