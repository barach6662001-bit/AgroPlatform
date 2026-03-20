/**
 * IndexedDB wrapper for offline mode.
 *
 * Two object stores:
 *  - "sync-queue"  stores pending mutations (POST / PUT / PATCH / DELETE) that
 *                  could not be sent while the app was offline.
 *  - "cache"       stores the latest successful GET responses keyed by URL so
 *                  that data can be displayed when the network is unavailable.
 */

const DB_NAME = 'agroplatform-offline';
const DB_VERSION = 1;
const STORE_QUEUE = 'sync-queue';
const STORE_CACHE = 'cache';

export interface QueuedRequest {
  id?: number;
  method: string;
  url: string;
  data: unknown;
  headers: Record<string, string>;
  enqueuedAt: string;
}

export interface CachedResponse {
  url: string;
  data: unknown;
  cachedAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: 'url' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Sync queue ────────────────────────────────────────────────────────────────

/** Add a mutation to the sync queue. Returns the generated id. */
export async function enqueue(item: Omit<QueuedRequest, 'id'>): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, 'readwrite');
    const req = tx.objectStore(STORE_QUEUE).add(item);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

/** Return all items currently in the sync queue, ordered by id (FIFO). */
export async function getQueue(): Promise<QueuedRequest[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, 'readonly');
    const req = tx.objectStore(STORE_QUEUE).getAll();
    req.onsuccess = () => resolve(req.result as QueuedRequest[]);
    req.onerror = () => reject(req.error);
  });
}

/** Remove a single item from the sync queue by its auto-generated id. */
export async function dequeue(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, 'readwrite');
    const req = tx.objectStore(STORE_QUEUE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Remove every item from the sync queue. */
export async function clearQueue(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, 'readwrite');
    const req = tx.objectStore(STORE_QUEUE).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Response cache ────────────────────────────────────────────────────────────

/** Persist a GET response in the cache. */
export async function setCache(url: string, data: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CACHE, 'readwrite');
    const item: CachedResponse = { url, data, cachedAt: new Date().toISOString() };
    const req = tx.objectStore(STORE_CACHE).put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Retrieve a cached GET response. Returns null when not found. */
export async function getCache(url: string): Promise<CachedResponse | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CACHE, 'readonly');
    const req = tx.objectStore(STORE_CACHE).get(url);
    req.onsuccess = () => resolve((req.result as CachedResponse) ?? null);
    req.onerror = () => reject(req.error);
  });
}
