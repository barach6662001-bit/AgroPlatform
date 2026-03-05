import axios from 'axios';
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
    return Promise.reject(error);
  }
);

export default apiClient;
