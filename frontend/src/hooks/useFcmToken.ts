import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../firebase';
import { saveFcmToken } from '../api/notifications';
import { useNotificationStore } from './useNotifications';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
const MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
const APP_ID = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

/**
 * Requests push-notification permission, retrieves the FCM registration token,
 * saves it to the backend, and subscribes to foreground messages.
 *
 * This hook is a no-op when Firebase is not configured (env vars absent).
 */
export function useFcmToken(): void {
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const swParams = new URLSearchParams({
      apiKey: API_KEY ?? '',
      authDomain: AUTH_DOMAIN ?? '',
      projectId: PROJECT_ID ?? '',
      storageBucket: STORAGE_BUCKET ?? '',
      messagingSenderId: MESSAGING_SENDER_ID ?? '',
      appId: APP_ID ?? '',
    });

    const swUrl = `/firebase-messaging-sw.js?${swParams.toString()}`;

    const registerAndGetToken = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.register(swUrl);

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        await saveFcmToken(token).catch(() => {
          // Silently ignore — token will be retried on next load.
        });
      }
    };

    if ('Notification' in window && 'serviceWorker' in navigator) {
      registerAndGetToken().catch(() => {
        // Silently ignore FCM setup errors (e.g., unsupported browser, blocked).
      });
    }

    // Handle foreground push messages.
    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? '';
      const body = payload.notification?.body ?? '';
      if (title || body) {
        addNotification({
          id: crypto.randomUUID(),
          type: 'info',
          message: title ? `${title}: ${body}` : body,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    });

    return () => unsubscribe();
  }, [addNotification]);
}
