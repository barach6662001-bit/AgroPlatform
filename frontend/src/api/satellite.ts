import apiClient from './axios';
import type { PrescriptionMapDto } from '../types/prescription';

export interface NdviData {
  fieldId: string;
  date: string;
  imageUrl: string;
  bounds: [number, number, number, number] | null;
  configured: boolean;
}

export const getFieldNdvi = (fieldId: string, date?: string) =>
  apiClient
    .get<NdviData>(`/api/satellite/ndvi/${fieldId}`, { params: date ? { date } : undefined })
    .then((r) => r.data);

export const getFieldNdviDates = (fieldId: string) =>
  apiClient
    .get<string[]>(`/api/satellite/dates/${fieldId}`)
    .then((r) => r.data);

export interface NdviDetectProblemRequest {
  date: string;
  stressedPercent: number;
  message: string;
}

export const reportNdviProblem = (fieldId: string, body: NdviDetectProblemRequest) =>
  apiClient.post(`/api/satellite/ndvi/${fieldId}/detect-problem`, body);

export const getPrescriptionMap = (fieldId: string) =>
  apiClient.get<PrescriptionMapDto>(`/api/satellite/prescription/${fieldId}`).then((r) => r.data);

export const getPrescriptionCsvUrl = (fieldId: string) =>
  `/api/satellite/prescription/${fieldId}/csv`;
