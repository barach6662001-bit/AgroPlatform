import apiClient from './axios';
import type { FieldDto, FieldDetailDto, CropType, FieldGeometryPayload, FieldSeedingDto, FieldFertilizerDto, FieldProtectionDto, FieldHarvestDto, FieldZoneDto, SoilAnalysisDto, PrescriptionMapDto, RotationAdviceDto, FieldInspectionDto } from '../types/field';
import type { PaginatedResult } from '../types/common';

export const getFields = (params?: { page?: number; pageSize?: number; search?: string; ownershipType?: number[] }, signal?: AbortSignal) =>
  apiClient.get<PaginatedResult<FieldDto>>('/api/fields', { params, signal }).then((r) => r.data);

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

// Zones
export const getFieldZones = (fieldId: string) =>
  apiClient.get<FieldZoneDto[]>(`/api/fields/${fieldId}/zones`).then((r) => r.data);

export const createFieldZone = (fieldId: string, data: Omit<FieldZoneDto, 'id'>) =>
  apiClient.post(`/api/fields/${fieldId}/zones`, data).then((r) => r.data);

export const updateFieldZone = (fieldId: string, id: string, data: Omit<FieldZoneDto, 'id'>) =>
  apiClient.put(`/api/fields/${fieldId}/zones/${id}`, data).then((r) => r.data);

export const deleteFieldZone = (fieldId: string, id: string) =>
  apiClient.delete(`/api/fields/${fieldId}/zones/${id}`);

// Soil Analyses
export const getSoilAnalyses = (fieldId: string) =>
  apiClient.get<SoilAnalysisDto[]>(`/api/fields/${fieldId}/soil-analyses`).then((r) => r.data);

export const createSoilAnalysis = (fieldId: string, data: Omit<SoilAnalysisDto, 'id'>) =>
  apiClient.post(`/api/fields/${fieldId}/soil-analyses`, data).then((r) => r.data);

export const updateSoilAnalysis = (fieldId: string, id: string, data: Omit<SoilAnalysisDto, 'id'>) =>
  apiClient.put(`/api/fields/${fieldId}/soil-analyses/${id}`, data).then((r) => r.data);

export const deleteSoilAnalysis = (fieldId: string, id: string) =>
  apiClient.delete(`/api/fields/${fieldId}/soil-analyses/${id}`);


// Prescription Map
export const getPrescriptionMap = (fieldId: string, nutrient = 'Nitrogen', ndviDate?: string) => {
  const params: Record<string, string> = { nutrient };
  if (ndviDate) params.ndviDate = ndviDate;
  return apiClient.get<PrescriptionMapDto>(`/api/fields/${fieldId}/prescription-map`, { params }).then((r) => r.data);
};

export const exportPrescriptionMap = async (fieldId: string, nutrient = 'Nitrogen', ndviDate?: string) => {
  const params: Record<string, string> = { nutrient };
  if (ndviDate) params.ndviDate = ndviDate;
  const response = await apiClient.get(`/api/fields/${fieldId}/prescription-map/export`, {
    params,
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prescription-map-${nutrient.toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};


// Rotation Advice
export const getRotationAdvice = (years = 3) =>
  apiClient.get<RotationAdviceDto[]>('/api/fields/rotation-advice', { params: { years } }).then((r) => r.data);

// Inspections
export const getFieldInspections = (fieldId: string) =>
  apiClient.get<FieldInspectionDto[]>(`/api/fields/${fieldId}/inspections`).then((r) => r.data);

export const createFieldInspection = (fieldId: string, data: Omit<FieldInspectionDto, 'id'>) =>
  apiClient.post(`/api/fields/${fieldId}/inspections`, data).then((r) => r.data);

export const deleteFieldInspection = (fieldId: string, id: string) =>
  apiClient.delete(`/api/fields/${fieldId}/inspections/${id}`);
