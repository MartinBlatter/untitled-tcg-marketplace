/**
 * @jest-environment node
 *
 * next/server needs the Web `Request` global and jose needs real WebCrypto,
 * neither of which jsdom provides.
 *
 * The database is mocked, so these cover the decisions the actions make rather
 * than the SQL: what counts as valid, what the caller is told, and that a failed
 * login is indistinguishable between "no such account" and "wrong password".
 */

// Only dynamic imports below (modules are re-imported per test after
// jest.resetModules), so this marks the file as a module rather than a global
// script - otherwise `cookieStore` collides with the DOM global of that name.
export {};

const cookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };

/** Rows the next `db.select()` chain resolves to, in call order. */
let selectResults: unknown[][] = [];
const inserted: unknown[] = [];
const updated: unknown[] = [];

const db = {
    select: jest.fn(() => ({
        from: jest.fn(() => ({
            where: jest.fn(() => Promise.resolve(selectResults.shift() ?? [])),
        })),
    })),
    insert: jest.fn(() => ({
        values: jest.fn((values: unknown) => {
            inserted.push(values);
            return Promise.resolve();
        }),
    })),
    update: jest.fn(() => ({
        set: jest.fn((values: unknown) => ({
            where: jest.fn(() => {
                updated.push(values);
                return Promise.resolve();
            }),
        })),
    })),
};

jest.mock('next/headers', () => ({ cookies: jest.fn(async () => cookieStore) }));
jest.mock('@/src/db/mysql', () => ({ __esModule: true, default: db }));

const SECRET = 'test-secret-at-least-32-bytes-long!!';
const PASSWORD = 'a-long-enough-password';

beforeEach(() => {
    jest.clearAllMocks();
    selectResults = [];
    inserted.length = 0;
    updated.length = 0;
    process.env.SESSION_SECRET = SECRET;
});

/** A real hash, so verification does real work rather than being stubbed out. */
async function hashOf(password: string) {
    const { hashPassword } = await import('@/src/lib/auth/password');
    return hashPassword(password);
}

function userRow(overrides: Record<string, unknown> = {}) {
    return {
        id: 42,
        eMail: 'player@example.com',
        userName: 'player',
        roles: '',
        passwordHash: null,
        deactivatedAt: null,
        ...overrides,
    };
}

describe('register', () => {
    it('rejects a malformed email before touching the database', async () => {
        const { register } = await import('@/src/lib/auth/actions');

        const result = await register({
            email: 'not-an-email',
            password: PASSWORD,
            confirmPassword: PASSWORD,
        });

        expect(result).toEqual({ success: false, error: 'auth.errors.emailInvalid' });
        expect(db.select).not.toHaveBeenCalled();
    });

    it('rejects a short password', async () => {
        const { register } = await import('@/src/lib/auth/actions');

        const result = await register({
            email: 'new@example.com',
            password: 'short',
            confirmPassword: 'short',
        });

        expect(result).toEqual({ success: false, error: 'auth.errors.passwordTooShort' });
        expect(db.insert).not.toHaveBeenCalled();
    });

    it('rejects a mismatched confirmation', async () => {
        const { register } = await import('@/src/lib/auth/actions');

        const result = await register({
            email: 'new@example.com',
            password: PASSWORD,
            confirmPassword: 'a-different-password',
        });

        expect(result).toEqual({ success: false, error: 'auth.errors.passwordMismatch' });
        expect(db.insert).not.toHaveBeenCalled();
    });

    it('refuses an email that is already registered', async () => {
        selectResults = [[{ id: 1 }]];
        const { register } = await import('@/src/lib/auth/actions');

        const result = await register({
            email: 'taken@example.com',
            password: PASSWORD,
            confirmPassword: PASSWORD,
        });

        expect(result).toEqual({ success: false, error: 'auth.errors.emailTaken' });
        expect(db.insert).not.toHaveBeenCalled();
    });

    it('creates the profile and funds rows, signs in, and sends the user to onboarding', async () => {
        selectResults = [
            [], // the duplicate-email check
            [{ id: 99, eMail: 'new@example.com', userName: null, roles: '' }], // read back
        ];
        const { register } = await import('@/src/lib/auth/actions');

        const result = await register({
            email: 'new@example.com',
            password: PASSWORD,
            confirmPassword: PASSWORD,
        });

        expect(result).toEqual({ success: true, redirectTo: '/profile' });
        expect(inserted).toHaveLength(2);

        const profileValues = inserted[0] as { passwordHash: string; eMail: string };
        expect(profileValues.passwordHash.startsWith('scrypt$')).toBe(true);
        expect(profileValues.passwordHash).not.toContain(PASSWORD);

        // userName is left unset on purpose, so onboarding still runs.
        expect(profileValues).not.toHaveProperty('userName');

        expect(cookieStore.set).toHaveBeenCalled();
    });

    it('normalises the email, so case cannot be used to bypass the unique index', async () => {
        selectResults = [[], [{ id: 99, eMail: 'new@example.com', userName: null, roles: '' }]];
        const { register } = await import('@/src/lib/auth/actions');

        await register({
            email: '  NEW@Example.COM  ',
            password: PASSWORD,
            confirmPassword: PASSWORD,
        });

        expect((inserted[0] as { eMail: string }).eMail).toBe('new@example.com');
    });
});

describe('login', () => {
    it('signs in with the right password and issues a cookie', async () => {
        const passwordHash = await hashOf(PASSWORD);
        selectResults = [[userRow({ passwordHash, roles: 'Business' })]];
        const { login } = await import('@/src/lib/auth/actions');

        const result = await login({ email: 'player@example.com', password: PASSWORD });

        expect(result).toEqual({ success: true, redirectTo: '/' });
        expect(cookieStore.set).toHaveBeenCalled();
        // lastLogin is refreshed on a successful sign-in.
        expect(updated).toHaveLength(1);
    });

    it('gives the same opaque error for a wrong password and an unknown account', async () => {
        const passwordHash = await hashOf(PASSWORD);
        const { login } = await import('@/src/lib/auth/actions');

        selectResults = [[userRow({ passwordHash })]];
        const wrongPassword = await login({ email: 'player@example.com', password: 'wrong-password-here' });

        selectResults = [[]];
        const noSuchUser = await login({ email: 'nobody@example.com', password: 'wrong-password-here' });

        expect(wrongPassword).toEqual({ success: false, error: 'auth.errors.invalidCredentials' });
        expect(noSuchUser).toEqual(wrongPassword);
        expect(cookieStore.set).not.toHaveBeenCalled();
    });

    it('refuses a deactivated account even with the right password', async () => {
        const passwordHash = await hashOf(PASSWORD);
        selectResults = [[userRow({ passwordHash, deactivatedAt: new Date() })]];
        const { login } = await import('@/src/lib/auth/actions');

        const result = await login({ email: 'player@example.com', password: PASSWORD });

        expect(result).toEqual({ success: false, error: 'auth.errors.invalidCredentials' });
        expect(cookieStore.set).not.toHaveBeenCalled();
    });

    it('refuses an account with no password set', async () => {
        selectResults = [[userRow({ passwordHash: null })]];
        const { login } = await import('@/src/lib/auth/actions');

        const result = await login({ email: 'player@example.com', password: PASSWORD });

        expect(result).toEqual({ success: false, error: 'auth.errors.invalidCredentials' });
    });

    it.each([
        ['an absolute URL', 'https://evil.example.com/phish', '/'],
        ['a protocol-relative URL', '//evil.example.com', '/'],
        ['a bare word with no leading slash', 'evil', '/'],
        ['an empty value', '', '/'],
        ['a legitimate in-app path', '/inventory', '/inventory'],
        ['a path with a query string', '/wishlists/3?view=list', '/wishlists/3?view=list'],
    ])('refuses to redirect off-site: %s', async (_label, next, expected) => {
        const passwordHash = await hashOf(PASSWORD);
        selectResults = [[userRow({ passwordHash })]];
        const { login } = await import('@/src/lib/auth/actions');

        const result = await login({ email: 'player@example.com', password: PASSWORD, next });

        expect(result).toEqual({ success: true, redirectTo: expected });
    });
});

describe('logout', () => {
    it('clears the session cookie', async () => {
        const { logout } = await import('@/src/lib/auth/actions');
        const { SESSION_COOKIE } = await import('@/src/lib/auth/session');

        await logout();

        expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
    });
});
