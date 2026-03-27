import apiClient from './axios';

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
    .get<{ configured: boolean; dates: string[] } | string[]>(`/api/satellite/dates/${fieldId}`)
    .then((r) => {
      const data = r.data;
      // Backend returns { configured, dates } — extract dates array
      if (data && typeof data === 'object' && 'dates' in data) {
        return (data as { dates: string[] }).dates;
      }
      return data as string[];
    });

export interface NdviDetectProblemRequest {
  date: string;
  stressedPercent: number;
  message: string;
}

export const reportNdviProblem = (fieldId: string, body: NdviDetectProblemRequest) =>
  apiClient.post(`/api/satellite/ndvi/${fieldId}/detect-problem`, body);
