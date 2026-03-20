import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock IndexedDB with a simple in-memory store ─────────────────────────────
type Store = Map<string | number, unknown>;

function makeRequest<T>(result: T, error?: Error) {
  const req: Partial<IDBRequest<T>> = {
    result,
    error: error ?? null,
    onsuccess: null,
    onerror: null,
  };
  setTimeout(() => {
    if (error && req.onerror) {
      (req as unknown as { onerror: (e: Event) => void }).onerror(new Event('error'));
    } else if (req.onsuccess) {
      (req as unknown as { onsuccess: (e: Event) => void }).onsuccess(new Event('success'));
    }
  }, 0);
  return req as IDBRequest<T>;
}

function buildMockIdb() {
  const stores: Record<string, Store> = {
    'sync-queue': new Map(),
    cache: new Map(),
  };
  let nextKey = 1;

  const makeObjectStore = (name: string): Partial<IDBObjectStore> => ({
    add: vi.fn((value: unknown) => {
      const id = nextKey++;
      const item = { ...(value as object), id } as unknown;
      stores[name].set(id, item);
      return makeRequest<IDBValidKey>(id);
    }),
    put: vi.fn((value: unknown) => {
      const key = (value as { url?: string; id?: number }).url ?? (value as { id: number }).id;
      stores[name].set(key, value);
      return makeRequest<IDBValidKey>(key as IDBValidKey);
    }),
    delete: vi.fn((key: IDBValidKey) => {
      stores[name].delete(key as string | number);
      return makeRequest<undefined>(undefined);
    }),
    get: vi.fn((key: IDBValidKey) => {
      return makeRequest(stores[name].get(key as string | number) ?? undefined);
    }),
    getAll: vi.fn(() => {
      return makeRequest([...stores[name].values()]);
    }),
    clear: vi.fn(() => {
      stores[name].clear();
      return makeRequest<undefined>(undefined);
    }),
  });

  const makeTransaction = (storeName: string): Partial<IDBTransaction> => ({
    objectStore: vi.fn(() => makeObjectStore(storeName) as IDBObjectStore),
  });

  const db: Partial<IDBDatabase> = {
    objectStoreNames: {
      contains: () => true,
    } as unknown as DOMStringList,
    transaction: vi.fn((storeName: string) => makeTransaction(storeName) as IDBTransaction),
  };

  return {
    open: vi.fn(() => {
      const req: Partial<IDBOpenDBRequest> = {
        result: db as IDBDatabase,
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        error: null,
      };
      setTimeout(() => {
        if (req.onsuccess)
          (req as unknown as { onsuccess: (e: Event) => void }).onsuccess(new Event('success'));
      }, 0);
      return req as IDBOpenDBRequest;
    }),
    stores,
    resetNextKey: () => { nextKey = 1; },
  };
}

// Apply mock globally before importing the module under test
const mockIdb = buildMockIdb();
vi.stubGlobal('indexedDB', mockIdb);

// Now import the module (after the global stub is in place)
import { enqueue, getQueue, dequeue, clearQueue, setCache, getCache } from '../offlineDb';

// ─────────────────────────────────────────────────────────────────────────────

describe('offlineDb', () => {
  beforeEach(() => {
    mockIdb.stores['sync-queue'].clear();
    mockIdb.stores['cache'].clear();
    mockIdb.resetNextKey();
  });

  // ── enqueue / getQueue / dequeue / clearQueue ────────────────────────────

  it('enqueue adds an item and returns a numeric id', async () => {
    const id = await enqueue({
      method: 'post',
      url: '/api/fields',
      data: { name: 'North Field' },
      headers: { Authorization: 'Bearer tok' },
      enqueuedAt: '2024-01-01T00:00:00Z',
    });
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  it('getQueue returns all enqueued items', async () => {
    await enqueue({ method: 'post', url: '/api/a', data: null, headers: {}, enqueuedAt: '2024-01-01T00:00:00Z' });
    await enqueue({ method: 'delete', url: '/api/b', data: null, headers: {}, enqueuedAt: '2024-01-01T00:00:01Z' });

    const queue = await getQueue();
    expect(queue).toHaveLength(2);
    expect(queue[0].url).toBe('/api/a');
    expect(queue[1].url).toBe('/api/b');
  });

  it('dequeue removes the specified item by id', async () => {
    const id = await enqueue({ method: 'put', url: '/api/x', data: {}, headers: {}, enqueuedAt: '2024-01-01T00:00:00Z' });
    await dequeue(id);

    const queue = await getQueue();
    expect(queue).toHaveLength(0);
  });

  it('clearQueue removes all items', async () => {
    await enqueue({ method: 'post', url: '/api/1', data: null, headers: {}, enqueuedAt: '2024-01-01T00:00:00Z' });
    await enqueue({ method: 'post', url: '/api/2', data: null, headers: {}, enqueuedAt: '2024-01-01T00:00:00Z' });
    await clearQueue();

    const queue = await getQueue();
    expect(queue).toHaveLength(0);
  });

  // ── setCache / getCache ──────────────────────────────────────────────────

  it('setCache stores a response under the given URL', async () => {
    await setCache('/api/fields', [{ id: '1', name: 'Field A' }]);
    const stored = mockIdb.stores['cache'].get('/api/fields') as { data: unknown; url: string };
    expect(stored).toBeDefined();
    expect(stored.url).toBe('/api/fields');
  });

  it('getCache retrieves a previously stored response', async () => {
    const payload = [{ id: '42' }];
    await setCache('/api/fields', payload);

    const result = await getCache('/api/fields');
    expect(result).not.toBeNull();
    expect(result!.url).toBe('/api/fields');
    expect(result!.data).toEqual(payload);
  });

  it('getCache returns null for an unknown URL', async () => {
    const result = await getCache('/api/missing');
    expect(result).toBeNull();
  });
});
