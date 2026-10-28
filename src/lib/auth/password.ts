/**
 * Password hashing, built on `node:crypto` scrypt.
 *
 * scrypt rather than bcrypt or argon2 because it ships with Node: no native
 * module to compile, nothing to rebuild when Node moves, and no new dependency.
 * It is a memory-hard KDF, which is the property that matters here.
 *
 * The stored string is self-describing:
 *
 *   scrypt$N=32768,r=8,p=1$<salt-base64>$<hash-base64>
 *
 * so the cost can be raised later without a migration — `verifyPassword` reads
 * the parameters out of the stored value, and only `hashPassword` decides what
 * new hashes cost.
 */

import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Promisified by hand rather than with `promisify`, which resolves to
 * `scrypt`'s three-argument overload and so rejects the options object.
 */
function scrypt(
    password: string,
    salt: Buffer,
    keylen: number,
    options: ScryptOptions
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scryptCallback(password, salt, keylen, options, (error, derived) => {
            if (error) reject(error);
            else resolve(derived);
        });
    });
}

/** Cost of newly created hashes. Raising these is backwards compatible. */
const PARAMS = { N: 32768, r: 8, p: 1 } as const;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * scrypt needs roughly `128 * N * r` bytes, which at the parameters above is
 * exactly the 32 MB default limit — so it has to be raised or the call throws.
 */
const MAX_MEM = 64 * 1024 * 1024;

type ScryptParams = { N: number; r: number; p: number };

async function derive(password: string, salt: Buffer, params: ScryptParams): Promise<Buffer> {
    return scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, {
        N: params.N,
        r: params.r,
        p: params.p,
        maxmem: MAX_MEM,
    });
}

function formatParams(params: ScryptParams): string {
    return `N=${params.N},r=${params.r},p=${params.p}`;
}

/** Returns `null` for anything we do not recognise, so callers can fail closed. */
function parseParams(encoded: string): ScryptParams | null {
    const parsed: Record<string, number> = {};

    for (const pair of encoded.split(',')) {
        const [key, value] = pair.split('=');
        const n = Number(value);
        if (!key || !Number.isInteger(n) || n <= 0) return null;
        parsed[key] = n;
    }

    const { N, r, p } = parsed;
    if (!N || !r || !p) return null;

    // Refuse absurd work factors: a crafted row must not be able to pin a CPU.
    if (N > 1 << 20 || r > 32 || p > 16) return null;

    return { N, r, p };
}

/** Hashes a plaintext password into the storable self-describing string. */
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const hash = await derive(password, salt, PARAMS);

    return [
        'scrypt',
        formatParams(PARAMS),
        salt.toString('base64'),
        hash.toString('base64'),
    ].join('$');
}

/**
 * Constant-time check of a password against a stored hash.
 *
 * Returns `false` rather than throwing for a malformed, truncated or
 * unknown-algorithm value, so a bad row cannot 500 the login route.
 */
export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
    if (!stored) return false;

    const parts = stored.split('$');
    if (parts.length !== 4) return false;

    const [algorithm, encodedParams, encodedSalt, encodedHash] = parts;
    if (algorithm !== 'scrypt') return false;

    const params = parseParams(encodedParams);
    if (!params) return false;

    const salt = Buffer.from(encodedSalt, 'base64');
    const expected = Buffer.from(encodedHash, 'base64');
    if (salt.length === 0 || expected.length === 0) return false;

    let actual: Buffer;
    try {
        actual = await derive(password, salt, { ...params });
    } catch {
        return false;
    }

    // `timingSafeEqual` throws on a length mismatch, which would itself be a
    // signal, so check the length separately and first.
    if (actual.length !== expected.length) return false;

    return timingSafeEqual(actual, expected);
}

/**
 * A hash of a value nobody can supply, used to spend the same CPU time on a
 * login attempt for an address that does not exist as for one that does.
 *
 * Without it, "unknown email" returns measurably faster than "wrong password"
 * and the login route becomes an account-enumeration oracle.
 */
export const DUMMY_HASH =
    'scrypt$N=32768,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA==$' +
    'V0hBVEVWRVItVEhJUy1JUy1OT1QtQS1SRUFMLUhBU0gtSVQtSlVTVC1CVVJOUy1DUFUtVElNRQ==';
