import { useEffect } from 'react';
import { notification } from 'antd';
import { useSyncQueueStore } from '../stores/syncQueueStore';
import { getQueue, dequeue } from '../utils/offlineDb';
import apiClient from '../api/axios';
import uk from '../i18n/uk';
import en from '../i18n/en';

function getLang(): 'uk' | 'en' {
  try {
    const stored = localStorage.getItem('lang-storage');
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.state?.lang === 'en' ? 'en' : 'uk';
  } catch {
    return 'uk';
  }
}

function getOfflineTranslations() {
  return getLang() === 'en' ? en.offline : uk.offline;
}

/** Replay every queued mutation against the live API (FIFO). */
async function flushQueue(
  setOnline: (v: boolean) => void,
  setPendingCount: (n: number) => void
): Promise<void> {
  const t = getOfflineTranslations();

  const items = await getQueue();
  if (items.length === 0) return;

  notification.info({ message: t.onlineTitle, description: t.onlineDesc });

  let failed = 0;
  for (const item of items) {
    try {
      await apiClient.request({
        method: item.method,
        url: item.url,
        data: item.data,
        headers: item.headers,
      });
      await dequeue(item.id!);
    } catch {
      failed += 1;
    }
  }

  const remaining = await getQueue();
  setPendingCount(remaining.length);
  setOnline(true);

  if (failed === 0) {
    notification.success({ message: t.syncDone });
  } else {
    notification.warning({ message: t.syncError });
  }
}

/**
 * Hook that tracks online/offline status and replays the sync queue once the
 * network is restored.  Mount once at the application root level.
 */
export function useOfflineSync() {
  const { setOnline, setPendingCount } = useSyncQueueStore();

  useEffect(() => {
    const handleOffline = () => {
      const t = getOfflineTranslations();
      setOnline(false);
      notification.warning({
        key: 'offline-banner',
        message: t.offlineTitle,
        description: t.offlineDesc,
        duration: 0,
      });
    };

    const handleOnline = () => {
      notification.destroy('offline-banner');
      flushQueue(setOnline, setPendingCount);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [setOnline, setPendingCount]);
}
