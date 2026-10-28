/**
 * Environment variable access and validation.
 *
 * Hand-rolled on purpose: no dependency, and importing this module validates
 * nothing. That matters because `next build` evaluates route modules, so a
 * module that threw on import would break the build.
 *
 * Enforcement lives in exactly one place: `validateServerEnv()`, called from the
 * root `instrumentation.ts` when a server instance boots. A misconfigured server
 * therefore fails at startup with a single error listing everything that is
 * missing, instead of surfacing as a mysterious failure on the first request.
 *
 * Which accessor to use:
 *   - `serverEnv()`   inside the Next server, where startup validation has
 *                     already guaranteed the variable is present.
 *   - `requireEnv()`  in CLI contexts that never run instrumentation
 *                     (`drizzle.config.ts`, `scripts/`), where throwing is the
 *                     whole point.
 *   - `optionalEnv()` for variables that are genuinely optional.
 */

type EnvSpec = {
    readonly name: RequiredEnvVar;
    /** `DB_PASS` may legitimately be empty — a passwordless local MySQL is valid. */
    readonly allowEmpty?: boolean;
};

export type RequiredEnvVar =
    | 'DB_HOST'
    | 'DB_USER'
    | 'DB_PASS'
    | 'DB_SCHEMA'
    | 'SESSION_SECRET'
    | 'NEXT_PUBLIC_IMAGE_HOST';

export type OptionalEnvVar =
    | 'CRON_SECRET'
    | 'DB_LOG_QUERIES';

/** Server-only variables the running app cannot work without. */
const SERVER_ENV: readonly EnvSpec[] = [
    { name: 'DB_HOST' },
    { name: 'DB_USER' },
    { name: 'DB_PASS', allowEmpty: true },
    { name: 'DB_SCHEMA' },
    // Signs the session cookie. Rotating it invalidates every session.
    { name: 'SESSION_SECRET' },
];

/**
 * NEXT_PUBLIC_* values are inlined at build time, so a missing one is a build
 * problem rather than a boot problem. Checked all the same.
 */
const PUBLIC_ENV: readonly EnvSpec[] = [
    { name: 'NEXT_PUBLIC_IMAGE_HOST' },
];

export class MissingEnvError extends Error {
    readonly missing: readonly string[];

    constructor(missing: readonly string[]) {
        super(
            `Missing required environment variable(s): ${missing.join(', ')}. ` +
            'Copy .env.example to .env and fill them in — see the "Environment ' +
            'variables" section of the README.'
        );
        this.name = 'MissingEnvError';
        this.missing = missing;
    }
}

function isSet(spec: EnvSpec): boolean {
    const value = process.env[spec.name];
    if (value === undefined) return false;
    return spec.allowEmpty ? true : value.trim() !== '';
}

/** Every missing required variable, server and public, in declaration order. */
export function collectMissingEnv(): RequiredEnvVar[] {
    return [...SERVER_ENV, ...PUBLIC_ENV]
        .filter(spec => !isSet(spec))
        .map(spec => spec.name);
}

let validated = false;

/**
 * Throws a single `MissingEnvError` naming *all* missing variables rather than
 * failing on the first one. Idempotent: does nothing once it has succeeded.
 */
export function validateServerEnv(logger: Pick<Console, 'warn'> = console): void {
    if (validated) return;

    const missing = collectMissingEnv();
    if (missing.length > 0) {
        throw new MissingEnvError(missing);
    }

    if (!optionalEnv('CRON_SECRET')) {
        logger.warn(
            '[env] CRON_SECRET is not set — the /api/cron/* endpoints will refuse ' +
            'to run and return 503. See the "Scheduled jobs" section of the README.'
        );
    }

    validated = true;
}

/**
 * Typed read for use inside the Next server, where `validateServerEnv()` has
 * already run at startup. Deliberately does not throw, so that pulling it into a
 * route module cannot break `next build`.
 */
export function serverEnv(name: RequiredEnvVar): string {
    return process.env[name] ?? '';
}

/**
 * Throwing read for CLI contexts that never execute `instrumentation.ts`, such
 * as `drizzle.config.ts` and the one-off scripts under `scripts/`.
 */
export function requireEnv(name: RequiredEnvVar): string {
    const value = process.env[name];
    if (value === undefined || (value.trim() === '' && name !== 'DB_PASS')) {
        throw new MissingEnvError([name]);
    }
    return value;
}

/** Reads an optional variable, treating an empty value as unset. */
export function optionalEnv(name: OptionalEnvVar): string | undefined {
    const value = process.env[name];
    return value === undefined || value.trim() === '' ? undefined : value;
}
