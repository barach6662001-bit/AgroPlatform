import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'leaflet/dist/leaflet.css';
import './styles/index.css';
import './theme/global.css';
import './utils/leafletFix';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.tsx';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeBridge } from '@/components/theme-bridge';
import { usePreferencesStore } from '@/stores/preferencesStore';

// Apply saved density before first render
const _initialDensity = usePreferencesStore.getState().density;
document.documentElement.dataset.density = _initialDensity;

registerSW({ immediate: false });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ThemeBridge />
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
