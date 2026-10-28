/**
 * next/server pulls in the Web `Request` global, which jsdom does not provide.
 * @jest-environment node
 */
import { GET } from '@/app/api/cron/pay-orders/route';
import db from '@/src/db/mysql';
import { NextRequest } from 'next/server';

jest.mock('@/src/db/mysql', () => ({
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
}));

// payOrder moves money and drags in @/drizzle/schema; this suite only covers the
// auth contract, so stub it out entirely.
jest.mock('@/src/utils/cart.helper', () => ({
  payOrder: jest.fn(),
}));

global.console = {
  ...console,
  error: jest.fn(),
};

const CRON_SECRET = 'test-cron-secret';

/** The route only reads `request.headers`, so a Headers-carrying stub is enough. */
function cronRequest(
  headers: Record<string, string> = { authorization: `Bearer ${CRON_SECRET}` }
): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

describe('Pay Orders Cron — authentication', () => {
  let originalCronSecret: string | undefined;

  beforeAll(() => {
    originalCronSecret = process.env.CRON_SECRET;
  });

  afterAll(() => {
    if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalCronSecret;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;
  });

  it('rejects a request with no Authorization header', async () => {
    const response = await GET(cronRequest({}));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(db.select).not.toHaveBeenCalled();
  });

  it('rejects a request with the wrong bearer token', async () => {
    const response = await GET(cronRequest({ authorization: 'Bearer not-the-secret' }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(db.select).not.toHaveBeenCalled();
  });

  it('refuses to run when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;

    const response = await GET(cronRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'cron_not_configured' });
    expect(db.select).not.toHaveBeenCalled();
  });
});
