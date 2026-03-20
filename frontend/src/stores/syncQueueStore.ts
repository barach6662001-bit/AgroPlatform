import { create } from 'zustand';

interface SyncQueueState {
  isOnline: boolean;
  pendingCount: number;
  setOnline: (online: boolean) => void;
  setPendingCount: (count: number) => void;
  incrementPending: () => void;
  decrementPending: () => void;
}

export const useSyncQueueStore = create<SyncQueueState>()((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  setOnline: (online) => set({ isOnline: online }),
  setPendingCount: (count) => set({ pendingCount: count }),
  incrementPending: () => set((s) => ({ pendingCount: s.pendingCount + 1 })),
  decrementPending: () => set((s) => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
}));
