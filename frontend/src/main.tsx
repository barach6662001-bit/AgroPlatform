import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'leaflet/dist/leaflet.css';
import './styles/design-system.css';
import './theme/global.css';
import './utils/leafletFix';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.tsx';
import { isBypassEnabled } from './mocks/isBypassEnabled';
import apiClient from './api/axios';

registerSW({ immediate: false });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

async function bootstrap() {
  if (isBypassEnabled) {
    const [queryMocks, axiosMocks] = await Promise.all([
      import('./mocks/installQueryMocks'),
      import('./mocks/installAxiosMocks'),
    ]);
    queryMocks.installQueryMocks(queryClient);
    axiosMocks.installAxiosMocks(apiClient);
    // eslint-disable-next-line no-console
    console.warn('[AgroPlatform] DEV MOCK MODE active — auth bypass is ON. Do NOT ship a production build built with VITE_BYPASS_AUTH=true.');
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  );
}

void bootstrap();
