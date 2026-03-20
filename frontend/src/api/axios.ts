import axios, { type InternalAxiosRequestConfig } from 'axios';
import { notification } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { enqueue, setCache, getCache } from '../utils/offlineDb';
import { useSyncQueueStore } from '../stores/syncQueueStore';

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

function getTenantIdFromJwt(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded['TenantId'] ?? null;
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  if (state.token) {
    config.headers.Authorization = `Bearer ${state.token}`;
  }
  const tenantId = state.tenantId
    || localStorage.getItem('tenantId')
    || (state.token ? getTenantIdFromJwt(state.token) : null);
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }
  return config;
});

const i18nErrors = {
  uk: {
    conflict: 'Конфлікт',
    conflictDesc: 'Запис з таким ідентифікатором вже існує.',
    serverError: 'Помилка сервера',
    serverErrorDesc: 'Виникла неочікувана помилка. Спробуйте ще раз.',
  },
  en: {
    conflict: 'Conflict',
    conflictDesc: 'A record with the same identifier already exists.',
    serverError: 'Server Error',
    serverErrorDesc: 'An unexpected server error occurred.',
  },
};

function getLang(): 'uk' | 'en' {
  try {
    const stored = localStorage.getItem('lang-storage');
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.state?.lang === 'en' ? 'en' : 'uk';
  } catch {
    return 'uk';
  }
}

apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses for offline use
    const method = response.config.method?.toLowerCase();
    if (method === 'get' && response.config.url) {
      setCache(response.config.url, response.data).catch(() => undefined);
    }
    return response;
  },
  async (error) => {
    const config = error.config as InternalAxiosRequestConfig & { _offlineRetry?: boolean };
    const isNetworkError = !error.response;

    // ── Offline / network-failure handling ───────────────────────────────────
    if (isNetworkError && config && !config._offlineRetry) {
      const method = config.method?.toLowerCase() ?? '';

      if (MUTATION_METHODS.has(method)) {
        // Queue mutation for later sync
        const headers: Record<string, string> = {};
        if (config.headers?.Authorization) headers['Authorization'] = String(config.headers.Authorization);
        if (config.headers?.['X-Tenant-Id']) headers['X-Tenant-Id'] = String(config.headers['X-Tenant-Id']);

        await enqueue({
          method,
          url: config.url ?? '',
          data: typeof config.data === 'string'
            ? (() => { try { return JSON.parse(config.data as string); } catch { return config.data; } })()
            : config.data,
          headers,
          enqueuedAt: new Date().toISOString(),
        }).catch(() => undefined);

        useSyncQueueStore.getState().incrementPending();
        // Resolve so callers don't crash — the action is queued
        return Promise.resolve({ data: null, status: 0, statusText: 'queued', headers: {}, config });
      }

      if (method === 'get' && config.url) {
        // Serve stale data from cache
        const cached = await getCache(config.url).catch(() => null);
        if (cached) {
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'cached',
            headers: {},
            config,
          });
        }
      }
    }

    // ── HTTP error handling ──────────────────────────────────────────────────
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      window.location.href = '/access-denied';
    }
    if (error.response?.status === 409) {
      const e = i18nErrors[getLang()];
      notification.warning({
        message: e.conflict,
        description: error.response?.data?.detail ?? e.conflictDesc,
      });
    }
    if (error.response?.status >= 500) {
      const e = i18nErrors[getLang()];
      notification.error({
        message: e.serverError,
        description: error.response?.data?.detail ?? error.message ?? e.serverErrorDesc,
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
