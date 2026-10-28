import 'dotenv/config';
import { createInterface } from 'node:readline';
import mysql from 'mysql2/promise';
import { requireEnv } from '../src/env';
import { hashPassword } from '../src/lib/auth/password';

/**
 * Sets a user's password.
 *
 * This is the password reset: the project has no mailer, so there is no
 * reset-by-link flow. Run it for a user who has locked themselves out, and give
 * them the new password over a channel you trust.
 *
 *   pnpm tsx scripts/set-password.ts someone@example.com
 *
 * The password is read from the terminal rather than taken as an argument, so
 * it does not end up in shell history or the process list.
 */

function prompt(question: string): Promise<string> {
    const rl = createInterface({ input: process.stdin, output: process.stdout });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    const email = process.argv[2]?.trim().toLowerCase();

    if (!email) {
        console.error('Usage: pnpm tsx scripts/set-password.ts <email>');
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
            'SELECT id, userName FROM profiledata WHERE eMail = ?',
            [email]
        );

        const user = rows[0];
        if (!user) {
            console.error(`No account found for ${email}.`);
            process.exit(1);
        }

        console.log(`Setting the password for ${email} (id ${user.id}, userName ${user.userName ?? '-'}).`);

        const password = await prompt('New password: ');
        if (password.length < 10) {
            console.error('Refusing to set a password shorter than 10 characters.');
            process.exit(1);
        }

        const confirmation = await prompt('Repeat it: ');
        if (password !== confirmation) {
            console.error('The two passwords do not match. Nothing was changed.');
            process.exit(1);
        }

        const hash = await hashPassword(password);
        await connection.execute('UPDATE profiledata SET passwordHash = ? WHERE id = ?', [hash, user.id]);

        console.log('Done. The user can log in with the new password.');
    } finally {
        await connection.end();
    }
}

main().catch(error => {
    console.error('Failed to set the password:', error);
    process.exit(1);
});
