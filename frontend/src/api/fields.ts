import apiClient from './axios';
import type { FieldDto, FieldDetailDto, CropType, FieldGeometryPayload, FieldSeedingDto, FieldFertilizerDto, FieldProtectionDto, FieldHarvestDto, SoilAnalysisDto } from '../types/field';
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

// Seedings
export const getFieldSeedings = (fieldId: string, year?: number) =>
  apiClient.get<FieldSeedingDto[]>(`/api/fields/${fieldId}/seedings`, { params: year ? { year } : undefined }).then((r) => r.data);

export const createFieldSeeding = (fieldId: string, data: Omit<FieldSeedingDto, 'id'>) =>
  apiClient.post(`/api/fields/${fieldId}/seedings`, data).then((r) => r.data);

export const deleteFieldSeeding = (fieldId: string, id: string) =>
  apiClient.delete(`/api/fields/${fieldId}/seedings/${id}`);

// Fertilizers
export const getFieldFertilizers = (fieldId: string, year?: number) =>
  apiClient.get<FieldFertilizerDto[]>(`/api/fields/${fieldId}/fertilizers`, { params: year ? { year } : undefined }).then((r) => r.data);

export const createFieldFertilizer = (fieldId: string, data: Omit<FieldFertilizerDto, 'id'>) =>
  apiClient.post(`/api/fields/${fieldId}/fertilizers`, data).then((r) => r.data);

export const deleteFieldFertilizer = (fieldId: string, id: string) =>
  apiClient.delete(`/api/fields/${fieldId}/fertilizers/${id}`);

// Protections
export const getFieldProtections = (fieldId: string, year?: number) =>
  apiClient.get<FieldProtectionDto[]>(`/api/fields/${fieldId}/protections`, { params: year ? { year } : undefined }).then((r) => r.data);

export const createFieldProtection = (fieldId: string, data: Omit<FieldProtectionDto, 'id'>) =>
  apiClient.post(`/api/fields/${fieldId}/protections`, data).then((r) => r.data);

export const deleteFieldProtection = (fieldId: string, id: string) =>
  apiClient.delete(`/api/fields/${fieldId}/protections/${id}`);

// Harvests
export const getFieldHarvests = (fieldId: string, year?: number) =>
  apiClient.get<FieldHarvestDto[]>(`/api/fields/${fieldId}/harvests`, { params: year ? { year } : undefined }).then((r) => r.data);

export const createFieldHarvest = (fieldId: string, data: Omit<FieldHarvestDto, 'id' | 'yieldTonsPerHa' | 'totalRevenue'>) =>
  apiClient.post(`/api/fields/${fieldId}/harvests`, data).then((r) => r.data);

export const deleteFieldHarvest = (fieldId: string, id: string) =>
  apiClient.delete(`/api/fields/${fieldId}/harvests/${id}`);


// Soil Analyses
export const getSoilAnalyses = (fieldId: string) =>
  apiClient.get<SoilAnalysisDto[]>(`/api/fields/${fieldId}/soil-analyses`).then((r) => r.data);

export const createSoilAnalysis = (fieldId: string, data: Omit<SoilAnalysisDto, 'id'>) =>
  apiClient.post(`/api/fields/${fieldId}/soil-analyses`, data).then((r) => r.data);

export const updateSoilAnalysis = (fieldId: string, id: string, data: Omit<SoilAnalysisDto, 'id'>) =>
  apiClient.put(`/api/fields/${fieldId}/soil-analyses/${id}`, data).then((r) => r.data);

export const deleteSoilAnalysis = (fieldId: string, id: string) =>
  apiClient.delete(`/api/fields/${fieldId}/soil-analyses/${id}`);
