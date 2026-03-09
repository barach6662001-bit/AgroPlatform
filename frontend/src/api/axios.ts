import axios from 'axios';
import { notification } from 'antd';
import { useAuthStore } from '../stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

apiClient.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  if (state.token) {
    config.headers.Authorization = `Bearer ${state.token}`;
  }
  const tenantId = state.tenantId || localStorage.getItem('tenantId');
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }
  return config;
});

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
    if (error.response?.status >= 500) {
      notification.error({
        message: 'Server Error',
        description: error.response?.data?.detail ?? error.message ?? 'An unexpected server error occurred.',
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
