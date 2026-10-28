/**
 * next/server pulls in the Web `Request` global, which jsdom does not provide.
 * @jest-environment node
 */
import { GET } from '@/app/api/cron/cleanup-carts/route';
import db from '@/src/db/mysql';
import { NextRequest, NextResponse } from 'next/server';

// Mock the database module
jest.mock('@/src/db/mysql', () => ({
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue([]),
}));

// Mock Console methods to keep test output clean
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

const CRON_SECRET = 'test-cron-secret';

/** The route only reads `request.headers`, so a Headers-carrying stub is enough. */
function cronRequest(
  headers: Record<string, string> = { authorization: `Bearer ${CRON_SECRET}` }
): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

describe('Shopping Cart Cleanup Cron', () => {
  let originalCronSecret: string | undefined;

  // next/jest loads .env, so a real CRON_SECRET may be present. Saving and
  // restoring it is what keeps the 401/503 cases deterministic.
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

  it('should return success when no old carts are found', async () => {
    // Mock the select operation to return empty array (no old carts)
    (db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]),
    }));
    
    const response = await GET(cronRequest());
    const data = await response.json();
    
    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toEqual({
      success: true,
      message: 'No old shopping carts found to clean up.',
      processedCarts: 0,
    });
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it('should process old shopping carts and return items to inventory', async () => {
    // Mock old carts found
    const mockOldCarts = [
      { id: 1, createdAt: '2025-04-15T00:00:00Z' },
      { id: 2, createdAt: '2025-04-15T12:00:00Z' },
    ];
    
    // Mock cart items found
    const mockCartItems = [
      { id: 101, cartId: 1, game: 'mtg', foreignKeySource: 'inventory', foreignKey: '201', quantity: 2, sellerId: 301 },
      { id: 102, cartId: 1, game: 'shipping', foreignKey: null, quantity: 1, sellerId: 301 },
      { id: 103, cartId: 2, game: 'mtg', foreignKeySource: 'inventory', foreignKey: '202', quantity: 3, sellerId: 302 },
    ];
    
    // Setup mocks for database operations. The route selects carts first and
    // cart items second, so discriminate on call order: the drizzle condition
    // passed to .where() is an SQL object whose toString() does not name the
    // table, so it cannot be used to tell the two queries apart.
    (db.select as jest.Mock)
      .mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockOldCarts),
      }))
      .mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockCartItems),
      }));
    
    // Mock delete operations
    (db.delete as jest.Mock).mockImplementation(() => ({
      where: jest.fn().mockResolvedValue({ affectedRows: mockCartItems.length }),
    }));
    
    // Mock execute for SQL update operations
    (db.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
    
    const response = await GET(cronRequest());
    const data = await response.json();
    
    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toEqual(expect.objectContaining({
      success: true,
      processedCarts: 2,
      processedItems: 3,
      itemsReturned: 2, // Only 2 real items (not shipping)
    }));
    
    // Verify DB operations were called
    expect(db.select).toHaveBeenCalledTimes(2);
    expect(db.delete).toHaveBeenCalledTimes(2); // Once for items, once for carts
    expect(db.execute).toHaveBeenCalledTimes(2); // For each non-shipping item
  });

  it('should handle errors gracefully', async () => {
    // Mock a database error
    (db.select as jest.Mock).mockImplementation(() => {
      throw new Error('Database connection failed');
    });
    
    const response = await GET(cronRequest());
    const data = await response.json();
    
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: true,
      message: expect.stringContaining('Database connection failed'),
    });
  });
});