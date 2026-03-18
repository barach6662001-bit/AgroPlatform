import apiClient from './axios';
import type { FieldDto, FieldDetailDto, CropType, FieldGeometryPayload } from '../types/field';
import type { PaginatedResult } from '../types/common';

export const getFields = (params?: { page?: number; pageSize?: number; search?: string; ownershipType?: number[] }) =>
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
  apiClient.post('/api/fields/assign-crop', { fieldId: data.fieldId, crop: data.cropType, year: data.year, notes: data.notes }).then((r) => r.data);

export const updateCropYield = (id: string, data: { yieldPerHectare: number }) =>
  apiClient.put(`/api/fields/crop-history/${id}/yield`, { cropHistoryId: id, yieldPerHectare: data.yieldPerHectare }).then((r) => r.data);

export const createRotationPlan = (data: { fieldId: string; plannedCrop: CropType; plannedYear: number; notes?: string }) =>
  apiClient.post('/api/fields/rotation-plans', { fieldId: data.fieldId, plannedCrop: data.plannedCrop, year: data.plannedYear, notes: data.notes }).then((r) => r.data);

export const deleteRotationPlan = (id: string) =>
  apiClient.delete(`/api/fields/rotation-plans/${id}`);

export const updateFieldGeometry = (id: string, data: FieldGeometryPayload) =>
  apiClient.put<void>(`/api/fields/${id}/geometry`, data).then((r) => r.data);

