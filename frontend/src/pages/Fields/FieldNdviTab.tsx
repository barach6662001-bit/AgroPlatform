import { useState, useEffect, useRef } from 'react';
import { Button, DatePicker, Alert, Spin, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import { getNdviImageUrl } from '../../api/satellite';
import type { FieldDetailDto } from '../../types/field';
import { useTranslation } from '../../i18n';

interface Props {
  fieldId: string;
  field: FieldDetailDto;
}

/** Fits the map to the field geometry once on mount. */
function FitToField({ geoJson }: { geoJson: string }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current) return;
    try {
      const geo = JSON.parse(geoJson) as GeoJsonObject;
      const bounds = L.geoJSON(geo).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
        fitted.current = true;
      }
    } catch {
      // ignore invalid GeoJSON
    }
  }, [map, geoJson]);

  return null;
}

/** Computes the Leaflet LatLngBounds from a GeoJSON string for ImageOverlay. */
function computeLeafletBounds(geoJson: string): L.LatLngBoundsExpression | null {
  try {
    const geo = JSON.parse(geoJson) as GeoJsonObject;
    const bounds = L.geoJSON(geo).getBounds();
    if (!bounds.isValid()) return null;
    const buf = 0.001; // ~100 m buffer so the image covers the whole field
    return [
      [bounds.getSouth() - buf, bounds.getWest() - buf],
      [bounds.getNorth() + buf, bounds.getEast() + buf],
    ];
  } catch {
    return null;
  }
}

export default function FieldNdviTab({ fieldId, field }: Props) {
  const { t } = useTranslation();
  // Default to 7 days ago: Sentinel-2 revisit time is 5 days, so yesterday may have
  // no imagery yet. A week back gives a higher chance of a cloud-free scene.
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().subtract(7, 'day'));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevBlobUrl = useRef<string | null>(null);

  const hasGeometry = !!field.geoJson;
  const imageBounds = hasGeometry ? computeLeafletBounds(field.geoJson!) : null;

  // Revoke the previous blob URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
      }
    };
  }, []);

  const handleLoad = async () => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      // Revoke the old URL before creating a new one
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
        prevBlobUrl.current = null;
      }
      const url = await getNdviImageUrl(fieldId, selectedDate.format('YYYY-MM-DD'));
      prevBlobUrl.current = url;
      setImageUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || t.fields.ndviLoadError);
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Controls */}
      <Space style={{ marginBottom: 16 }} wrap>
        <DatePicker
          value={selectedDate}
          onChange={(d) => d && setSelectedDate(d)}
          format="DD.MM.YYYY"
          disabledDate={(d) => d.isAfter(dayjs())}
          allowClear={false}
          style={{ width: 160 }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleLoad}
          loading={loading}
          disabled={!hasGeometry}
        >
          {t.fields.ndviLoad}
        </Button>
      </Space>

      {!hasGeometry && (
        <Alert
          type="warning"
          showIcon
          message={t.fields.ndviNoGeometry}
          style={{ marginBottom: 16 }}
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* Map */}
      <Spin spinning={loading}>
        <div style={{ position: 'relative' }}>
          <MapContainer
            style={{ height: 480, width: '100%', borderRadius: 4 }}
            center={[48.5, 35.0]}
            zoom={12}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {field.geoJson && (
              <>
                <FitToField geoJson={field.geoJson} />
                <GeoJSON
                  key={field.id}
                  data={JSON.parse(field.geoJson) as GeoJsonObject}
                  style={{ color: '#1677ff', weight: 2, fillOpacity: 0.05 }}
                />
              </>
            )}

            {imageUrl && imageBounds && (
              <ImageOverlay
                url={imageUrl}
                bounds={imageBounds}
                opacity={0.85}
                zIndex={10}
              />
            )}
          </MapContainer>

          {/* NDVI colour legend */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: 12,
              zIndex: 1000,
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 6,
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              fontSize: 12,
              minWidth: 130,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{t.fields.ndviLegendTitle}</div>
            {[
              { color: '#228B22', label: t.fields.ndviHealthy },
              { color: '#FFD700', label: t.fields.ndviModerate },
              { color: '#CC2200', label: t.fields.ndviStress },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#444' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Spin>

      {!imageUrl && !loading && hasGeometry && (
        <Alert
          type="info"
          showIcon
          message={t.fields.ndviHint}
          style={{ marginTop: 12 }}
        />
      )}
    </div>
  );
}
