'use server';

import { eq, sql } from 'drizzle-orm';
import db from '@/src/db/mysql';
import { profileData } from '@/src/db/schema/user';
import { fundsData } from '@/src/db/schema/funds';
import { hashPassword, verifyPassword, DUMMY_HASH } from './password';
import { createSession, deleteSession, payloadFromProfile } from './session';
import { loginSchema, registerSchema } from './schemas';
import { INTERNAL_ROUTES } from '@/src/constants/internalRoutes';

/**
 * The login, registration and logout mutations.
 *
 * Server actions rather than route handlers because the session cookie has to
 * be set on the server and the plaintext password should travel no further than
 * the request that checks it. The forms are still Formik + Yup, matching the
 * rest of the app - they call these directly from `onSubmit`.
 *
 * Every failure returns the same opaque `invalidCredentials` message. Telling a
 * caller which half was wrong turns the form into an account-enumeration
 * oracle, and the same reasoning drives the dummy hash below.
 */

export type AuthResult =
    /** `redirectTo` is where the client should navigate on success. */
    | { success: true; redirectTo: string }
    | { success: false; error: string };

/**
 * Only ever redirect within this app. A '?next=' value is attacker-controllable,
 * so anything that is not a plain absolute path is discarded. '//evil.com' is a
 * protocol-relative URL, which is why a second leading slash is rejected too.
 */
function safeNext(next: string | undefined): string {
    if (!next || !next.startsWith('/') || next.startsWith('//')) {
        return INTERNAL_ROUTES.HOME;
    }
    return next;
}

/** Yup error keys are i18n message keys; the first one is good enough for a form. */
function firstError(error: unknown): string {
    if (error && typeof error === 'object' && 'errors' in error) {
        const errors = (error as { errors?: unknown }).errors;
        if (Array.isArray(errors) && typeof errors[0] === 'string') return errors[0];
    }
    return 'auth.errors.unexpected';
}

export async function login(input: { email: string; password: string; next?: string }): Promise<AuthResult> {
    let email: string;
    let password: string;

    try {
        const valid = await loginSchema.validate(input, { abortEarly: true });
        email = valid.email;
        password = valid.password;
    } catch (error) {
        return { success: false, error: firstError(error) };
    }

    try {
        const rows = await db
            .select({
                id: profileData.id,
                eMail: profileData.eMail,
                userName: profileData.userName,
                roles: profileData.roles,
                passwordHash: profileData.passwordHash,
                deactivatedAt: profileData.deactivatedAt,
            })
            .from(profileData)
            // `eq`, not the `like` used elsewhere in this codebase: a `like`
            // pattern from user input (`%`, `_`) would match other accounts.
            .where(eq(profileData.eMail, email));

        const user = rows[0];

        // Always run a derivation, even with no user and no hash, so that an
        // unknown address takes as long to reject as a wrong password.
        const passwordMatches = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

        if (!user || !passwordMatches || user.deactivatedAt) {
            return { success: false, error: 'auth.errors.invalidCredentials' };
        }

        await createSession(payloadFromProfile(user));

        // `date` column, so a date-only value is what it can hold.
        await db
            .update(profileData)
            .set({ lastLogin: sql`CURRENT_DATE` })
            .where(eq(profileData.id, user.id));

        return { success: true, redirectTo: safeNext(input.next) };
    } catch (error) {
        console.error('[auth] login failed', error);
        return { success: false, error: 'auth.errors.unexpected' };
    }
}

/**
 * Creates the account and its funds row, then logs the user straight in.
 *
 * `userName` is deliberately left null: the existing onboarding gate
 * (src/components/ProfileRedirect/ProfileRedirect.tsx) sends a user with no
 * userName to /profile, which is where the name, address and country that
 * checkout needs get collected. Setting it here would skip that.
 */
export async function register(input: {
    email: string;
    password: string;
    confirmPassword: string;
}): Promise<AuthResult> {
    let email: string;
    let password: string;

    try {
        const valid = await registerSchema.validate(input, { abortEarly: true });
        email = valid.email;
        password = valid.password;
    } catch (error) {
        return { success: false, error: firstError(error) };
    }

    try {
        const existing = await db
            .select({ id: profileData.id })
            .from(profileData)
            .where(eq(profileData.eMail, email));

        if (existing.length > 0) {
            return { success: false, error: 'auth.errors.emailTaken' };
        }

        const passwordHash = await hashPassword(password);

        await db.insert(profileData).values({
            eMail: email,
            passwordHash,
            roles: '',
            active: 1,
            onVacation: 0,
        });

        const created = await db
            .select({
                id: profileData.id,
                eMail: profileData.eMail,
                userName: profileData.userName,
                roles: profileData.roles,
            })
            .from(profileData)
            .where(eq(profileData.eMail, email));

        const user = created[0];
        if (!user) {
            console.error('[auth] registered row for %s could not be read back', email);
            return { success: false, error: 'auth.errors.unexpected' };
        }

        await db.insert(fundsData).values({ userId: user.id, funds: '0' });
        await createSession(payloadFromProfile(user));

        // Straight to onboarding: the row has no userName, name or address yet.
        return { success: true, redirectTo: INTERNAL_ROUTES.PROFILE.ROOT };
    } catch (error) {
        console.error('[auth] registration failed', error);
        return { success: false, error: 'auth.errors.unexpected' };
    }
}

export async function logout(): Promise<void> {
    await deleteSession();
}
