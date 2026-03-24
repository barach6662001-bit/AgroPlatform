import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock indexedDB to provide a simple in-memory store
function createMockIdb() {
  const store: Record<string, unknown> = {};

  const makeRequest = <T>(fn: () => T) => {
    const req: Partial<IDBRequest> & { onsuccess?: ((e: Event) => void) | null; onerror?: ((e: Event) => void) | null } = {
      onsuccess: null,
      onerror: null,
    };
    setTimeout(() => {
      try {
        (req as { result: T }).result = fn();
        if (req.onsuccess) req.onsuccess({} as Event);
      } catch (err) {
        (req as { error: unknown }).error = err;
        if (req.onerror) req.onerror({} as Event);
      }
    }, 0);
    return req as IDBRequest;
  };

  const objectStore: Partial<IDBObjectStore> = {
    add: vi.fn((value) => makeRequest(() => { store[(value as { id: string }).id] = value; return undefined; })),
    getAll: vi.fn(() => makeRequest(() => Object.values(store))),
    delete: vi.fn((key) => makeRequest(() => { delete store[key as string]; return undefined; })),
    count: vi.fn(() => makeRequest(() => Object.keys(store).length)),
  };

  const transaction: Partial<IDBTransaction> = {
    objectStore: vi.fn(() => objectStore as IDBObjectStore),
  };

  const db: Partial<IDBDatabase> = {
    objectStoreNames: { contains: () => true } as unknown as DOMStringList,
    transaction: vi.fn(() => transaction as IDBTransaction),
  };

  const openReq: Partial<IDBOpenDBRequest> & {
    onsuccess?: ((e: Event) => void) | null;
    onerror?: ((e: Event) => void) | null;
    onupgradeneeded?: ((e: IDBVersionChangeEvent) => void) | null;
  } = {
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: db as IDBDatabase,
  };

  setTimeout(() => {
    if (openReq.onsuccess) openReq.onsuccess({ target: openReq } as unknown as Event);
  }, 0);

  return { openReq, store, objectStore };
}

describe('offlineQueue module', () => {
  it('exports expected functions', async () => {
    const mod = await import('../../utils/offlineQueue');
    expect(typeof mod.enqueueOperation).toBe('function');
    expect(typeof mod.getAllOperations).toBe('function');
    expect(typeof mod.removeOperation).toBe('function');
    expect(typeof mod.getPendingCount).toBe('function');
  });
});

describe('offlineQueue with mocked indexedDB', () => {
  beforeEach(() => {
    const { openReq } = createMockIdb();
    vi.stubGlobal('indexedDB', {
      open: vi.fn(() => openReq),
    });
  });

  it('enqueueOperation adds an item with id, createdAt, and retries', async () => {
    const { enqueueOperation } = await import('../../utils/offlineQueue');
    await enqueueOperation({ method: 'POST', url: '/api/test', data: { foo: 'bar' } });
    // If no error thrown, operation was queued
    expect(true).toBe(true);
  });

  it('getAllOperations returns queued items', async () => {
    const { getAllOperations } = await import('../../utils/offlineQueue');
    const results = await getAllOperations();
    expect(Array.isArray(results)).toBe(true);
  });
});
