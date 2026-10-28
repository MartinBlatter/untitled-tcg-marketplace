import 'dotenv/config';
import mysql from 'mysql2/promise';
import { requireEnv } from '../src/env';
import { parseRoles, serializeRoles } from '../src/lib/auth/roles';

/**
 * Adds or removes a role on an account.
 *
 *   pnpm tsx scripts/grant-role.ts someone@example.com Business
 *   pnpm tsx scripts/grant-role.ts someone@example.com Business --remove
 *
 * Roles are part of the signed session cookie, so a change only reaches the
 * user once they log in again.
 */
async function main() {
    const email = process.argv[2]?.trim().toLowerCase();
    const role = process.argv[3]?.trim();
    const remove = process.argv.includes('--remove');

    if (!email || !role) {
        console.error('Usage: pnpm tsx scripts/grant-role.ts <email> <role> [--remove]');
        process.exit(1);
    }

    const connection = await mysql.createConnection({
        host: requireEnv('DB_HOST'),
        user: requireEnv('DB_USER'),
        password: requireEnv('DB_PASS'),
        database: requireEnv('DB_SCHEMA'),
    });

    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id, roles FROM profiledata WHERE eMail = ?',
            [email]
        );

        const user = rows[0];
        if (!user) {
            console.error(`No account found for ${email}.`);
            process.exit(1);
        }

        const current = parseRoles(user.roles);
        const next = remove
            ? current.filter(existing => existing !== role)
            : [...current, role];

        const serialized = serializeRoles(next);
        await connection.execute('UPDATE profiledata SET roles = ? WHERE id = ?', [serialized, user.id]);

        console.log(`${email}: [${current.join(', ')}] -> [${parseRoles(serialized).join(', ')}]`);
        console.log('The change takes effect the next time they log in.');
    } finally {
        await connection.end();
    }
}

main().catch(error => {
    console.error('Failed to change roles:', error);
    process.exit(1);
});
