import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import type { GeoJsonObject } from 'geojson';
import { Empty } from 'antd';
import L from 'leaflet';
import type { FieldDto } from '../../types/field';
import { useTranslation } from '../../i18n';

interface FieldWithGeoJson extends FieldDto {
  geoJson?: string;
}

interface FieldMapProps {
  fields: FieldWithGeoJson[];
  height?: number;
}

interface ParsedField {
  field: FieldWithGeoJson;
  geo: GeoJsonObject;
}

function FitBoundsToFields({ features }: { features: ParsedField[] }) {
  const map = useMap();
  const prevIdsRef = useRef('');

  useEffect(() => {
    if (features.length === 0) return;
    const ids = features.map((f) => f.field.id).join(',');
    if (ids === prevIdsRef.current) return;
    prevIdsRef.current = ids;
    try {
      const bounds = L.latLngBounds([]);
      features.forEach(({ geo }) => {
        const layer = L.geoJSON(geo);
        bounds.extend(layer.getBounds());
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch {
      // ignore bounds errors
    }
  }, [map, features]);

  return null;
}

export default function FieldMap({ fields, height = 500 }: FieldMapProps) {
  const { t } = useTranslation();

  const parsedFields: ParsedField[] = fields.flatMap((field) => {
    if (!field.geoJson) return [];
    try {
      const geo = JSON.parse(field.geoJson) as GeoJsonObject;
      return [{ field, geo }];
    } catch {
      return [];
    }
  });

  if (parsedFields.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: 4 }}>
        <Empty description={t.fields.noCoordinates} />
      </div>
    );
  }

  return (
    <MapContainer
      style={{ height, width: '100%' }}
      center={[48.5, 35.0]}
      zoom={10}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FitBoundsToFields features={parsedFields} />
      {parsedFields.map(({ field, geo }) => (
        <GeoJSON
          key={field.id}
          data={geo}
        >
          <Popup>
            <strong>{field.name}</strong>
            <br />
            {t.fields.area}: {field.areaHectares.toFixed(2)}
            {field.currentCrop && (
              <>
                <br />
                {t.crops[field.currentCrop as keyof typeof t.crops] || field.currentCrop}
              </>
            )}
          </Popup>
        </GeoJSON>
      ))}
    </MapContainer>
  );
}
