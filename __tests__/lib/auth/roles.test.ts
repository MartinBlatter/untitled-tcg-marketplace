import { hasRole, parseRoles, serializeRoles } from '@/src/lib/auth/roles';

describe('parseRoles', () => {
    it.each([
        ['null', null, []],
        ['undefined', undefined, []],
        ['an empty string', '', []],
        ['only separators', ',,,', []],
        ['a single role', 'Business', ['Business']],
        ['several roles', 'Business,Admin', ['Business', 'Admin']],
        ['surrounding whitespace', ' Business , Admin ', ['Business', 'Admin']],
        ['duplicates', 'Business,Business', ['Business']],
        ['empty entries between roles', 'Business,,Admin', ['Business', 'Admin']],
    ])('handles %s', (_label, stored, expected) => {
        expect(parseRoles(stored as string | null | undefined)).toEqual(expected);
    });
});

describe('serializeRoles', () => {
    it('round-trips through parseRoles', () => {
        const roles = ['Business', 'Admin'];

        expect(parseRoles(serializeRoles(roles))).toEqual(roles);
    });

    it('stores an empty list as an empty string, not "null"', () => {
        expect(serializeRoles([])).toBe('');
    });

    it('drops blanks and duplicates so the column cannot accumulate junk', () => {
        expect(serializeRoles([' Business ', '', 'Business', 'Admin'])).toBe('Business,Admin');
    });

    it('fits the varchar(255) column for a realistic number of roles', () => {
        const many = Array.from({ length: 10 }, (_, i) => `SomeRoleName${i}`);

        expect(serializeRoles(many).length).toBeLessThanOrEqual(255);
    });
});

describe('hasRole', () => {
    it('matches exactly, and tolerates an absent list', () => {
        expect(hasRole(['Business'], 'Business')).toBe(true);
        expect(hasRole(['BusinessAdmin'], 'Business')).toBe(false);
        expect(hasRole([], 'Business')).toBe(false);
        expect(hasRole(undefined, 'Business')).toBe(false);
    });
});
