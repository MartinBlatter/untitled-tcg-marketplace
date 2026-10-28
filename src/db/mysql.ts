import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { optionalEnv, serverEnv } from "../env";

const poolConnection = mysql.createPool({
    host: serverEnv('DB_HOST'),
    user: serverEnv('DB_USER'),
    password: serverEnv('DB_PASS'),
    database: serverEnv('DB_SCHEMA'),
});

// Query logging is opt-in: every statement, bound parameters included, would
// otherwise be written to the console in production.
const db = drizzle(poolConnection, { logger: optionalEnv('DB_LOG_QUERIES') === 'true' });
export default db;
