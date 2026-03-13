import axios from 'axios';
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
  (response) => response,
  (error) => {
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
