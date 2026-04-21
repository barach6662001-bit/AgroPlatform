import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { notification } from 'antd';
import { useAuthStore } from '../stores/authStore';

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
    forbidden: 'Доступ заборонено',
    forbiddenDesc: 'У вас немає прав для виконання цієї дії.',
    serverError: 'Помилка сервера',
    serverErrorDesc: 'Виникла неочікувана помилка. Спробуйте ще раз.',
    sessionExpired: 'Сесія закінчилася',
    sessionExpiredDesc: 'Будь ласка, увійдіть знову.',
  },
  en: {
    conflict: 'Conflict',
    conflictDesc: 'A record with the same identifier already exists.',
    forbidden: 'Access Denied',
    forbiddenDesc: 'You do not have permission to perform this action.',
    serverError: 'Server Error',
    serverErrorDesc: 'An unexpected server error occurred.',
    sessionExpired: 'Session expired',
    sessionExpiredDesc: 'Please log in again.',
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

// ─ Silent token refresh logic ─
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (config: InternalAxiosRequestConfig) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve({ headers: { Authorization: `Bearer ${token}` } } as InternalAxiosRequestConfig);
    }
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // ─ AUTO-REFRESH ON 401 ─
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const state = useAuthStore.getState();
      const refreshToken = state.refreshToken;

      // No refresh token or request was to auth endpoints — just logout
      if (!refreshToken || originalRequest.url?.startsWith('/api/auth/refresh')) {
        useAuthStore.getState().logout();
        const e = i18nErrors[getLang()];
        notification.warning({
          message: e.sessionExpired,
          description: e.sessionExpiredDesc,
        });
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((config) => {
          originalRequest.headers.Authorization = config.headers.Authorization;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{
          token: string;
          refreshToken: string;
          email: string;
          role: string;
          tenantId: string;
          requirePasswordChange: boolean;
          hasCompletedOnboarding: boolean;
          firstName?: string;
          lastName?: string;
        }>(
          `${apiClient.defaults.baseURL || ''}/api/auth/refresh`,
          { refreshToken }
        );

        useAuthStore.getState().setTokens(data.token, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        processQueue(null, data.token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        const e = i18nErrors[getLang()];
        notification.warning({
          message: e.sessionExpired,
          description: e.sessionExpiredDesc,
        });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      const e = i18nErrors[getLang()];
      notification.warning({
        message: e.forbidden,
        description: e.forbiddenDesc,
      });
    }
    if (error.response?.status === 409) {
      const e = i18nErrors[getLang()];
      notification.warning({
        message: e.conflict,
        description: (error.response?.data as { detail?: string })?.detail ?? e.conflictDesc,
      });
    }
    if (error.response?.status && error.response.status >= 500) {
      const e = i18nErrors[getLang()];
      notification.error({
        message: e.serverError,
        description: (error.response?.data as { detail?: string })?.detail ?? error.message ?? e.serverErrorDesc,
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
