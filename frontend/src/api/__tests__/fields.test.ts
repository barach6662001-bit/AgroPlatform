import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateFieldGeometry } from '../fields';
import apiClient from '../axios';

vi.mock('../axios', () => ({
  default: {
    put: vi.fn(),
  },
}));

const mockedApiClient = apiClient as unknown as { put: ReturnType<typeof vi.fn> };

describe('updateFieldGeometry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls PUT /api/fields/:id/geometry with correct payload', async () => {
    const mockGeoJson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[[30, 48], [31, 48], [31, 49], [30, 48]]] },
          properties: {},
        },
      ],
    });

    mockedApiClient.put.mockResolvedValueOnce({ data: undefined });

    await updateFieldGeometry('field-123', { geoJson: mockGeoJson });

    expect(mockedApiClient.put).toHaveBeenCalledWith(
      '/api/fields/field-123/geometry',
      { geoJson: mockGeoJson },
    );
    expect(mockedApiClient.put).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from API client', async () => {
    mockedApiClient.put.mockRejectedValueOnce(new Error('Network Error'));

    await expect(updateFieldGeometry('field-abc', { geoJson: '{}' })).rejects.toThrow('Network Error');
  });

  it('serializes GeoJSON feature collection correctly', async () => {
    const polygon = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[28.5, 49.0], [29.0, 49.0], [29.0, 49.5], [28.5, 49.0]]],
          },
          properties: {},
        },
      ],
    };
    const geoJson = JSON.stringify(polygon);

    // Verify round-trip serialization is valid
    const parsed = JSON.parse(geoJson);
    expect(parsed.type).toBe('FeatureCollection');
    expect(parsed.features).toHaveLength(1);
    expect(parsed.features[0].geometry.type).toBe('Polygon');

    mockedApiClient.put.mockResolvedValueOnce({ data: undefined });
    await updateFieldGeometry('field-xyz', { geoJson });
    expect(mockedApiClient.put).toHaveBeenCalledWith('/api/fields/field-xyz/geometry', { geoJson });
  });
});
