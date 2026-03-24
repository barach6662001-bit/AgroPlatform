import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'leaflet/dist/leaflet.css';
import './theme/global.css';
import './utils/leafletFix';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.tsx';

registerSW({ immediate: false });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
