import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/src/lib/auth/dal';
import { ROLES } from '@/src/lib/auth/roles';

export const runtime = 'nodejs';

/**
 * Card image download/upload endpoint.
 *
 * The previous implementation fetched card art from Scryfall and uploaded it by
 * SFTP to the host served by NEXT_PUBLIC_IMAGE_HOST. It has been removed because
 * it carried hardcoded SFTP credentials.
 *
 * To re-enable it, reimplement the Scryfall download + upload here and read the
 * connection details from environment variables (see .env.example), never from
 * literals in source.
 */
export async function GET(request: NextRequest) {
    // Admin only, gated now rather than when the implementation returns: this
    // fetches from Scryfall and writes to the image host, so it must never be
    // reachable by an ordinary account.
    const { response } = await requireRole(ROLES.ADMIN);
    if (response) return response;

    return NextResponse.json({
        message: 'This API endpoint is temporarily disabled',
        status: 'unavailable',
    });
}
