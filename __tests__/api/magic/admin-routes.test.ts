/**
 * next/server pulls in the Web `Request` global, which jsdom does not provide.
 * @jest-environment node
 */

/**
 * The catalogue-maintenance endpoints under /api/magic must be reachable only
 * by an account holding the Admin role.
 *
 * `requireRole` itself is covered in __tests__/lib/auth/dal.test.ts. What is
 * covered here is the thing that was actually wrong: the helper existed, and
 * the routes did not call it. Two of these endpoints checked only that *some*
 * session existed, and two checked nothing whatsoever - so any signed-in user,
 * or in two cases any anonymous caller, could rebuild the shared card tables or
 * rewrite every seller's inventory keys.
 *
 * These assert the gate, not the work behind it: the work is a multi-minute
 * MySQL import that has no business running in a unit test.
 */

export {};

const getServerSession = jest.fn();

jest.mock('@/src/lib/auth/session', () => ({
    __esModule: true,
    getServerSession: (...args: unknown[]) => getServerSession(...args),
}));

// These routes open their own mysql2 pool at module scope.
jest.mock('mysql2/promise', () => ({
    __esModule: true,
    default: {
        createPool: jest.fn(() => ({
            on: jest.fn(),
            getConnection: jest.fn(),
            query: jest.fn(async () => [[], []]),
            execute: jest.fn(async () => [[], []]),
            end: jest.fn(),
        })),
    },
}));

const dbSelect = jest.fn(() => ({ from: jest.fn(() => ({ where: jest.fn(async () => []) })) }));
jest.mock('@/src/db/mysql', () => ({
    __esModule: true,
    default: { select: (...a: unknown[]) => dbSelect(...(a as [])), execute: jest.fn(async () => []) },
}));

global.console = { ...console, log: jest.fn(), error: jest.fn(), warn: jest.fn() };

/** A session for a signed-in account carrying the given roles. */
function sessionWith(roles: string[]) {
    return {
        user: { name: 'Someone', email: 'someone@example.com' },
        userId: 7,
        userName: 'Someone',
        roles,
        expires: new Date(Date.now() + 86_400_000).toISOString(),
    };
}

/** The routes only read headers and searchParams off the request. */
function req(url = 'http://localhost:3000/api/magic/x') {
    return {
        headers: new Headers(),
        nextUrl: new URL(url),
    } as unknown as import('next/server').NextRequest;
}

type Handler = () => Promise<{ GET: (r: ReturnType<typeof req>) => Promise<Response> }>;

const ROUTES: ReadonlyArray<readonly [string, Handler]> = [
    ['import', () => import('@/app/api/magic/import/route')],
    ['update-inventory-keys', () => import('@/app/api/magic/update-inventory-keys/route')],
    ['image-update-report', () => import('@/app/api/magic/image-update-report/route')],
    ['download-card-images', () => import('@/app/api/magic/download-card-images/route')],
];

beforeEach(() => {
    jest.clearAllMocks();
    process.env.DB_HOST ||= 'localhost';
    process.env.DB_USER ||= 'test';
    process.env.DB_PASS ||= '';
    process.env.DB_SCHEMA ||= 'test';
});

describe.each(ROUTES)('/api/magic/%s', (name, load) => {
    it('401s an anonymous caller', async () => {
        getServerSession.mockResolvedValue(null);
        const { GET } = await load();

        const response = await GET(req());

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    });

    it('403s a signed-in account without the Admin role', async () => {
        getServerSession.mockResolvedValue(sessionWith(['Business']));
        const { GET } = await load();

        const response = await GET(req());

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'forbidden' });
    });

    it('does not leak caching of an authorisation failure', async () => {
        getServerSession.mockResolvedValue(sessionWith([]));
        const { GET } = await load();

        const response = await GET(req());

        expect(response.headers.get('cache-control')).toBe('no-store');
    });
});

describe('role matching', () => {
    it('is exact, so a role merely containing "Admin" does not pass', async () => {
        getServerSession.mockResolvedValue(sessionWith(['Administrator', 'NotAdmin']));
        const { GET } = await import('@/app/api/magic/update-inventory-keys/route');

        const response = await GET(req());

        expect(response.status).toBe(403);
    });
});
