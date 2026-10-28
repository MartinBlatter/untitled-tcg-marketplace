/**
 * The session shape the application consumes.
 *
 * Replaces the two competing `declare module "next-auth"` augmentations that
 * used to live in types/next-auth.d.ts and src/types/next-auth-d.ts. Those both
 * reached the compiler and merged, leaving `Session` with a flat `userName` and
 * a nested `user.userName` at the same time. This is a plain type instead of a
 * module augmentation, so there is one definition and it is findable.
 */

/** One row of `profileSettings`. Client-side only - see src/lib/auth/session.ts. */
export type ProfileSetting = {
    id: number;
    userId: number;
    name: string | null;
    value: string | null;
};

/** What is signed into the session cookie. Keep it small. */
export type SessionPayload = {
    userId: number;
    email: string;
    userName: string | null;
    roles: string[];
    /** Epoch milliseconds. Mirrors the JWT `exp` claim. */
    expiresAt: number;
};

export type Session = {
    /**
     * Nested under `user` because ~96 call sites read `session.user.email`.
     * `name` is a display fallback and mirrors `userName`.
     */
    user: {
        name: string | null;
        email: string;
    };
    userId: number;
    userName: string | null;
    roles: string[];
    /**
     * Only populated by GET /api/auth/session, i.e. only ever present on the
     * client. Server code must not rely on it.
     *
     * Typed `any` to match the shape this replaced. The ~8 pages that read it
     * do `settings.find(...)?.value` and feed the result straight into
     * `useState<string>`, so a precise type here means changing all of them -
     * a separate cleanup, not part of the auth migration. `ProfileSetting`
     * above is the real shape, for new code that wants it.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings?: any;
    /** ISO 8601. */
    expires: string;
};

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';
