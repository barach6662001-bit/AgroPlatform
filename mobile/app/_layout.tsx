import { useEffect, type ReactNode } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/hooks/useTheme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { isDark } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="warehouse/[id]" options={{ headerShown: true, title: 'Склад' }} />
          <Stack.Screen name="warehouse/receipt" options={{ headerShown: true, title: 'Прихід' }} />
          <Stack.Screen name="warehouse/issue" options={{ headerShown: true, title: 'Витрата' }} />
          <Stack.Screen name="warehouse/transfer" options={{ headerShown: true, title: 'Переміщення' }} />
        </Stack>
      </AuthGuard>
    </QueryClientProvider>
  );
}
