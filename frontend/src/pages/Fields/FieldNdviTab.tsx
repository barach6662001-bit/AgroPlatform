import { useEffect, useState } from 'react';
import { Card, Alert, Spin, Typography } from 'antd';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { useTranslation } from '../../i18n';
import { getFieldNdvi } from '../../api/satellite';
import type { NdviData } from '../../api/satellite';

interface Props {
  fieldId: string;
}

// Fit map to bounds whenever bounds change
function FitBounds({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds]);
  return null;
}

export default function FieldNdviTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const [ndvi, setNdvi] = useState<NdviData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getFieldNdvi(fieldId)
      .then((data) => setNdvi(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [fieldId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !ndvi || !ndvi.bounds) {
    return (
      <Alert
        type="info"
        showIcon
        message={t.fields.ndviNoData}
        style={{ margin: 16 }}
      />
    );
  }

  // Leaflet expects [[minLat, minLon], [maxLat, maxLon]]
  const leafletBounds: LatLngBoundsExpression = [
    [ndvi.bounds[1], ndvi.bounds[0]],
    [ndvi.bounds[3], ndvi.bounds[2]],
  ];

  return (
    <div>
      {!ndvi.configured && (
        <Alert
          type="warning"
          showIcon
          message={t.fields.ndviPlaceholderNote}
          style={{ margin: '0 0 12px 0' }}
          closable
        />
      )}

      <div style={{ position: 'relative' }}>
        <MapContainer
          style={{ height: 480, width: '100%' }}
          center={[48.5, 35.0]}
          zoom={10}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FitBounds bounds={leafletBounds} />
          <ImageOverlay
            url={ndvi.imageUrl}
            bounds={leafletBounds}
            opacity={0.75}
          />
        </MapContainer>

        {/* NDVI Legend overlay */}
        <Card
          size="small"
          style={{
            position: 'absolute',
            bottom: 24,
            right: 12,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 8,
            minWidth: 130,
            pointerEvents: 'none',
          }}
          bodyStyle={{ padding: '8px 12px' }}
        >
          <Typography.Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
            {t.fields.tabNdvi}
          </Typography.Text>
          {[
            { color: '#4caf50', label: t.fields.ndviLegendHealthy },
            { color: '#ffeb3b', label: t.fields.ndviLegendModerate },
            { color: '#f44336', label: t.fields.ndviLegendStress },
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
              <Typography.Text style={{ fontSize: 12 }}>{label}</Typography.Text>
            </div>
          ))}
        </Card>
      </div>

      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
        {ndvi.date}
      </Typography.Text>
    </div>
  );
}
