/**
 * Runs once when a Next.js server instance boots — not during `next build`.
 *
 * This is the fail-fast point for environment validation: throwing here aborts
 * the server start with one clear error naming every missing variable, instead
 * of letting a missing variable surface later as an opaque runtime failure.
 */
export async function register(): Promise<void> {
    // Only the Node.js server runtime sees server-only variables.
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    // The dynamic import keeps src/env out of the edge bundle.
    const { validateServerEnv } = await import('./src/env');
    validateServerEnv();
}
