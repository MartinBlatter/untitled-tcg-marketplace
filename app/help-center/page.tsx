import HelpCenter from '@/src/components/HelpCenter/HelpCenter';
import { getLocale } from 'next-intl/server';

export default async function HelpCenterPage() {
    const currentLanguage = await getLocale();
    return <HelpCenter currentLanguage={currentLanguage} />;
}
