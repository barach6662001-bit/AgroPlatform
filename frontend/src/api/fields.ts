import apiClient from './axios';
import type { FieldDto, FieldDetailDto, CropType, FieldGeometryPayload } from '../types/field';
import type { PaginatedResult } from '../types/common';

export const getFields = (params?: { page?: number; pageSize?: number; search?: string }) =>
  apiClient.get<PaginatedResult<FieldDto>>('/api/fields', { params }).then((r) => r.data);

export const getFieldById = (id: string) =>
  apiClient.get<FieldDetailDto>(`/api/fields/${id}`).then((r) => r.data);

export const createField = (data: Partial<FieldDto>) =>
  apiClient.post<FieldDto>('/api/fields', data).then((r) => r.data);

export const updateField = (id: string, data: Partial<FieldDto>) =>
  apiClient.put<FieldDto>(`/api/fields/${id}`, data).then((r) => r.data);

export const deleteField = (id: string) =>
  apiClient.delete(`/api/fields/${id}`);

export const assignCrop = (data: { fieldId: string; cropType: CropType; year: number; notes?: string }) =>
  apiClient.post('/api/fields/assign-crop', data).then((r) => r.data);

export const updateCropYield = (id: string, data: { yieldTonnesPerHa: number; notes?: string }) =>
  apiClient.put(`/api/fields/crop-history/${id}/yield`, data).then((r) => r.data);

export const createRotationPlan = (data: { fieldId: string; plannedCrop: CropType; plannedYear: number; notes?: string }) =>
  apiClient.post('/api/fields/rotation-plans', data).then((r) => r.data);

export const deleteRotationPlan = (id: string) =>
  apiClient.delete(`/api/fields/rotation-plans/${id}`);

export const updateFieldGeometry = (id: string, data: FieldGeometryPayload) =>
  apiClient.put<void>(`/api/fields/${id}/geometry`, data).then((r) => r.data);

