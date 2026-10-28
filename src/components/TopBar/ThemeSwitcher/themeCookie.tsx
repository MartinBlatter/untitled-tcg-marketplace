'use server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'NEXT_THEME';

export async function getUserTheme() {
    if ((await cookies()).has(COOKIE_NAME)) {
        return (await cookies()).get(COOKIE_NAME)?.value;
    }
}

export async function setUserTheme(theme: string) {
    (await cookies()).set(COOKIE_NAME, theme);
}
