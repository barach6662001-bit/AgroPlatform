import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { getAllOperations, removeOperation, getPendingCount } from '../utils/offlineQueue';
import apiClient from '../api/axios';
import { useOnlineStatus } from './useOnlineStatus';

export interface OfflineSyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  triggerSync: () => Promise<void>;
}

export function useOfflineSync(): OfflineSyncState {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      // ignore IDB errors
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const ops = await getAllOperations();
      if (ops.length === 0) return;

      let synced = 0;
      let failed = 0;

      for (const op of ops) {
        try {
          await apiClient.request({ method: op.method, url: op.url, data: op.data });
          await removeOperation(op.id);
          synced++;
        } catch {
          failed++;
        }
      }

      await refreshCount();

      if (synced > 0 && failed === 0) {
        message.success(`✓ Синхронізовано ${synced} операцій`);
      } else if (synced > 0 && failed > 0) {
        message.warning(`Синхронізовано ${synced}, помилок: ${failed}`);
      } else if (failed > 0) {
        message.error(`Не вдалось синхронізувати ${failed} операцій`);
      }
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refreshCount]);

  // Refresh count on mount and when online status changes
  useEffect(() => {
    refreshCount();
  }, [refreshCount, isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      triggerSync();
    }
  }, [isOnline, triggerSync]);

  return { isOnline, pendingCount, isSyncing, triggerSync };
}
