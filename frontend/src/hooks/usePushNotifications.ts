import { useCallback, useEffect, useState } from 'react';
import { registerPushSubscription } from '../api/notifications';

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface UsePushNotificationsReturn {
  permissionState: PushPermissionState;
  isRegistering: boolean;
  requestPermission: () => Promise<void>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [permissionState, setPermissionState] = useState<PushPermissionState>('default');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermissionState('unsupported');
      return;
    }
    const current = Notification.permission;
    if (current === 'granted' || current === 'denied') {
      setPermissionState(current);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermissionState('unsupported');
      return;
    }

    setIsRegistering(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission === 'granted' || permission === 'denied' ? permission : 'default');

      if (permission !== 'granted') return;

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
      if (!vapidPublicKey) return;

      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) return;

      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        const json = subscription.toJSON();
        await registerPushSubscription({
          endpoint: json.endpoint ?? '',
          p256dhKey: json.keys?.p256dh ?? null,
          authKey: json.keys?.auth ?? null,
          userAgent: navigator.userAgent.slice(0, 512),
        });
      } catch (err) {
        console.warn('[PushNotifications] Failed to subscribe:', err);
      }
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return { permissionState, isRegistering, requestPermission };
}
