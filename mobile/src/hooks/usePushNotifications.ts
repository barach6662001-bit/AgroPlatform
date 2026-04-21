import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Invalidate notifications query so badge / list refresh
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      if (data?.entityType) {
        navigateByEntity(router, data.entityType, data.entityId);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router, queryClient]);
}

function navigateByEntity(
  router: ReturnType<typeof useRouter>,
  entityType: string,
  entityId?: string,
) {
  switch (entityType) {
    case 'Warehouse':
      router.push(entityId ? `/warehouse/${entityId}` : '/(tabs)/warehouse');
      break;
    case 'GrainStorage':
      router.push(entityId ? `/grain/${entityId}` : '/(tabs)/grain');
      break;
    case 'AgroOperation':
      router.push(entityId ? `/operations/${entityId}` : '/(tabs)/operations');
      break;
    case 'Notification':
      router.push('/notifications');
      break;
    default:
      router.push('/notifications');
  }
}

async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  try {
    await apiClient.post('/api/notifications/push-token', {
      token,
      platform: Platform.OS,
    });
  } catch {
    // Ignore push token registration errors on startup
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}
