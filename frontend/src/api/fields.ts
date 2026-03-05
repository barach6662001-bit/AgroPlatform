import apiClient from './axios';
import type { FieldDto, FieldDetailDto } from '../types/field';

export const getFields = () =>
  apiClient.get<FieldDto[]>('/api/fields').then((r) => r.data);

export const getFieldById = (id: string) =>
  apiClient.get<FieldDetailDto>(`/api/fields/${id}`).then((r) => r.data);

export const createField = (data: Partial<FieldDto>) =>
  apiClient.post<FieldDto>('/api/fields', data).then((r) => r.data);

export const updateField = (id: string, data: Partial<FieldDto>) =>
  apiClient.put<FieldDto>(`/api/fields/${id}`, data).then((r) => r.data);

export const deleteField = (id: string) =>
  apiClient.delete(`/api/fields/${id}`);
