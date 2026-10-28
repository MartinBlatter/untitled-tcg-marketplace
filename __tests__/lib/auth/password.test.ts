import { DUMMY_HASH, hashPassword, verifyPassword } from '@/src/lib/auth/password';

// scrypt at the configured cost takes ~50ms per derivation, and several of
// these do two.
jest.setTimeout(30000);

describe('hashPassword', () => {
    it('produces a self-describing scrypt string', async () => {
        const hash = await hashPassword('correct horse battery staple');

        expect(hash.split('$')).toHaveLength(4);
        expect(hash.startsWith('scrypt$N=32768,r=8,p=1$')).toBe(true);
    });

    it('salts, so the same password never hashes to the same value twice', async () => {
        const [first, second] = await Promise.all([
            hashPassword('same password'),
            hashPassword('same password'),
        ]);

        expect(first).not.toEqual(second);
    });

    it('fits the varchar(255) column it is stored in', async () => {
        const hash = await hashPassword('x'.repeat(200));

        expect(hash.length).toBeLessThanOrEqual(255);
    });
});

describe('verifyPassword', () => {
    it('accepts the password it was given', async () => {
        const hash = await hashPassword('s3cret passphrase');

        await expect(verifyPassword('s3cret passphrase', hash)).resolves.toBe(true);
    });

    it('rejects a wrong password', async () => {
        const hash = await hashPassword('s3cret passphrase');

        await expect(verifyPassword('s3cret passphrasf', hash)).resolves.toBe(false);
    });

    it('normalises unicode, so the same typed password matches either encoding', async () => {
        // The same character as a single code point and as base + combining mark.
        const hash = await hashPassword('pañol');

        await expect(verifyPassword('pañol', hash)).resolves.toBe(true);
    });

    it.each([
        ['null', null],
        ['undefined', undefined],
        ['empty', ''],
        ['too few fields', 'scrypt$N=32768,r=8,p=1$c2FsdA=='],
        ['an unknown algorithm', 'bcrypt$N=32768,r=8,p=1$c2FsdA==$aGFzaA=='],
        ['unparseable parameters', 'scrypt$N=abc,r=8,p=1$c2FsdA==$aGFzaA=='],
        ['a missing parameter', 'scrypt$r=8,p=1$c2FsdA==$aGFzaA=='],
        ['an empty salt', 'scrypt$N=32768,r=8,p=1$$aGFzaA=='],
        ['a short hash', 'scrypt$N=32768,r=8,p=1$c2FsdA==$aGFzaA=='],
    ])('returns false rather than throwing for %s', async (_label, stored) => {
        await expect(verifyPassword('anything', stored as string | null | undefined)).resolves.toBe(false);
    });

    it('refuses an absurd work factor instead of pinning the CPU', async () => {
        const hostile = 'scrypt$N=1048577,r=8,p=1$c2FsdA==$aGFzaA==';

        const started = Date.now();
        await expect(verifyPassword('anything', hostile)).resolves.toBe(false);
        expect(Date.now() - started).toBeLessThan(1000);
    });

    it('rejects a tampered hash whose length still matches', async () => {
        const hash = await hashPassword('s3cret passphrase');
        const parts = hash.split('$');
        const bytes = Buffer.from(parts[3], 'base64');
        bytes[0] = bytes[0] ^ 0xff;
        parts[3] = bytes.toString('base64');

        await expect(verifyPassword('s3cret passphrase', parts.join('$'))).resolves.toBe(false);
    });

    it('spends real work on DUMMY_HASH, so an unknown email is not faster', async () => {
        // The point of the constant is the time it burns, so assert it is both
        // well formed and actually derived rather than short-circuited.
        const started = Date.now();
        await expect(verifyPassword('anything', DUMMY_HASH)).resolves.toBe(false);

        expect(Date.now() - started).toBeGreaterThan(5);
    });
});
