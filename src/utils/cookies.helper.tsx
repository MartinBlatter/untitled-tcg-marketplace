'use server';

import { cookies } from 'next/headers';

const CONSENT_COOKIE_NAME = 'DM_CONSENT_COOKIE';

export async function getCookieConsent() {
    return (await cookies()).get(CONSENT_COOKIE_NAME)?.value || null;
}

export async function setCookieConsent(consent: string) {
    (await cookies()).set(CONSENT_COOKIE_NAME, consent);
}