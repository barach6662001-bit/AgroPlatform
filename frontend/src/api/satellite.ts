import apiClient from './axios';

/**
 * Fetches the Sentinel-2 NDVI image for a given field and date from the backend proxy.
 * Returns a temporary object URL that can be used as an ImageOverlay src in Leaflet.
 * The caller is responsible for revoking the URL with URL.revokeObjectURL() when done.
 */
export async function getNdviImageUrl(fieldId: string, date: string): Promise<string> {
  const response = await apiClient.get<Blob>(`/api/satellite/ndvi/${fieldId}`, {
    params: { date },
    responseType: 'blob',
  });
  return URL.createObjectURL(response.data);
}
