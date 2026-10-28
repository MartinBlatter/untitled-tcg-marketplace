import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Card images are served from NEXT_PUBLIC_IMAGE_HOST (see .env.example). The
// next/image remote pattern is derived from that value so that no deployment's
// image host is hardcoded here.
function imageHostPatterns() {
    const raw = process.env.NEXT_PUBLIC_IMAGE_HOST;
    if (!raw) return [];
    try {
        const url = new URL(raw);
        return [
            {
                protocol: url.protocol.replace(':', ''),
                hostname: url.hostname,
                port: url.port,
                search: '',
            },
        ];
    } catch {
        console.warn(
            `next.config: NEXT_PUBLIC_IMAGE_HOST is not a valid URL, ignoring it: ${raw}`
        );
        return [];
    }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                search: '',
            },
            ...imageHostPatterns(),
        ],
    },
};

export default withNextIntl(nextConfig);
