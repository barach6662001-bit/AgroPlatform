import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'offline-queue' });

export interface QueuedOperation {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: unknown;
  createdAt: string;
}

export function enqueueOperation(op: Omit<QueuedOperation, 'id' | 'createdAt'>): void {
  const queue = getQueue();
  const entry: QueuedOperation = {
    ...op,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };

  queue.push(entry);
  storage.set('queue', JSON.stringify(queue));
}

export function getQueue(): QueuedOperation[] {
  const raw = storage.getString('queue');
  return raw ? JSON.parse(raw) : [];
}

export function removeOperation(id: string): void {
  const queue = getQueue().filter((op) => op.id !== id);
  if (queue.length === 0) {
    storage.remove('queue');
  } else {
    storage.set('queue', JSON.stringify(queue));
  }
}

export function getPendingCount(): number {
  return getQueue().length;
}
