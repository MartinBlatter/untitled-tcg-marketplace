import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { requireEnv } from './src/env';
export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema',
    dialect: 'mysql',
    dbCredentials: {
        host: requireEnv('DB_HOST'),
        user: requireEnv('DB_USER'),
        password: requireEnv('DB_PASS'),
        database: requireEnv('DB_SCHEMA'),
    },
});