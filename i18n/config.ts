export type Locale = (typeof locales)[number];

export const locales = ['en', 'de', 'fr', 'es', 'it'] as const;
export const localesStrings: { [char: string]: string } = { en: 'English', de: 'German', fr: 'French', es: 'Spanish', it: 'Italian' } as const;
export const defaultLocale: Locale = 'en';