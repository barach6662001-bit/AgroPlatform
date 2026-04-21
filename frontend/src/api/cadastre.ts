import apiClient from './axios';

export interface CadastreParcelResult {
  found: boolean;
  cadnum: string;
  area?: string;
  purpose?: string;
  ownership?: string;
  cached?: boolean;
  fetchedAt?: string;
  error?: string;
  sourceUrl?: string;
}

export async function getCadastreParcel(cadnum: string): Promise<CadastreParcelResult> {
  const { data } = await apiClient.get('/api/cadastre/parcel', { params: { cadnum } });
  return data;
}

export async function cacheCadastreData(
  fieldId: string,
  payload: {
    cadastralNumber: string;
    area?: number;
    purpose?: string;
    ownership?: string;
  }
): Promise<void> {
  await apiClient.post(`/api/cadastre/cache/${fieldId}`, payload);
}
