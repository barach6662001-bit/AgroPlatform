import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialise when the required config is present.
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId,
);

export const firebaseApp = isConfigured
  ? (getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig))
  : null;

export function getFirebaseMessaging(): Messaging | null {
  if (!firebaseApp) return null;
  try {
    return getMessaging(firebaseApp);
  } catch {
    return null;
  }
}
