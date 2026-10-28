import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

const NO_STORE = { 'cache-control': 'no-store' } as const;

/**
 * Hash both sides before comparing so the buffers are always the same length —
 * `timingSafeEqual` throws on a length mismatch, and comparing raw values would
 * leak the secret's length.
 */
function digest(value: string): Buffer {
    return createHash('sha256').update(value, 'utf8').digest();
}

/**
 * Guard for the /api/cron/* endpoints, which mutate orders and move funds.
 *
 * Returns `null` when the caller is an authorised cron invocation, otherwise the
 * response the route must return immediately.
 *
 * `CRON_SECRET` is read at call time and never captured at module load, so tests
 * can vary it per case and a platform-injected value is picked up.
 *
 * Fails closed: with no secret configured the endpoints refuse to run rather
 * than running unauthenticated. The distinct 503 separates "this deployment is
 * misconfigured" from the 401 "caller presented a bad token".
 */
export function rejectUnauthorizedCron(request: Request): NextResponse | null {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        console.error('[cron] CRON_SECRET is not configured — refusing to run this endpoint.');
        return NextResponse.json(
            { error: 'cron_not_configured' },
            { status: 503, headers: NO_STORE }
        );
    }

    const provided = request.headers.get('authorization') ?? '';
    if (!timingSafeEqual(digest(provided), digest(`Bearer ${secret}`))) {
        return NextResponse.json(
            { error: 'unauthorized' },
            { status: 401, headers: NO_STORE }
        );
    }

    return null;
}
