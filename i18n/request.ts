import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './locale';

export default getRequestConfig(async () => {
    const locale = await getUserLocale();

    return {
        locale,
        messages: {
            ...(await import(`../messages/${locale}/common.json`)).default,
            ...(await import(`../messages/${locale}/auth.json`)).default,
            ...(await import(`../messages/${locale}/products.json`)).default,
            ...(await import(`../messages/${locale}/profile.json`)).default,
            ...(await import(`../messages/${locale}/inventory.json`)).default,
            ...(await import(`../messages/${locale}/search.json`)).default,
            ...(await import(`../messages/${locale}/wishlists.json`)).default,
            ...(await import(`../messages/${locale}/messages.json`)).default,
            ...(await import(`../messages/${locale}/shipping.json`)).default,
            ...(await import(`../messages/${locale}/checkout.json`)).default,
            ...(await import(`../messages/${locale}/purchases.json`)).default,
            ...(await import(`../messages/${locale}/sales.json`)).default,
            ...(await import(`../messages/${locale}/pickinglists.json`)).default,
            ...(await import(`../messages/${locale}/statistics.json`)).default,
            ...(await import(`../messages/${locale}/helpcenter.json`)).default,
            ...(await import(`../messages/${locale}/buylist.json`)).default,
        }
    };
});