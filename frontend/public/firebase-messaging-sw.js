// firebase-messaging-sw.js
// This service worker handles background push notifications from Firebase Cloud Messaging.
// It must be placed in the `public/` directory so it is served from the root scope.

importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

// Firebase config is injected by the app when registering the service worker.
// Read from the URL query string set during registration:  ?apiKey=...&projectId=...
const params = new URL(self.location.href).searchParams;

firebase.initializeApp({
  apiKey: params.get('apiKey') || '',
  authDomain: params.get('authDomain') || '',
  projectId: params.get('projectId') || '',
  storageBucket: params.get('storageBucket') || '',
  messagingSenderId: params.get('messagingSenderId') || '',
  appId: params.get('appId') || '',
});

const messaging = firebase.messaging();

// Handle background messages (app not in foreground).
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'AgroPlatform';
  const body = payload.notification?.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/logo.svg',
  });
});
