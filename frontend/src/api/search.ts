import apiClient from './axios';

export interface GlobalSearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export const globalSearch = (q: string, signal?: AbortSignal) =>
  apiClient.get<GlobalSearchResult[]>('/api/search', { params: { q }, signal }).then((r) => r.data);
