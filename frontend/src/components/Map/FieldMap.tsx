import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Polygon, Tooltip } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import type { GeoJsonObject } from 'geojson';
import { Switch } from 'antd';
import L from 'leaflet';
import type { FieldDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import { fieldBoundaries, MAP_CENTER, MAP_ZOOM } from '../../data/fieldBoundaries';
import CadastreLayer from './CadastreLayer';
import 'leaflet/dist/leaflet.css';
import s from './FieldMap.module.css';

interface FieldWithGeoJson extends FieldDto {
  geoJson?: string;
}

interface FieldMapProps {
  fields: FieldWithGeoJson[];
  height?: number | string;
  onFieldClick?: (fieldName: string) => void;
  selectedField?: string;
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

export default function FieldMap({ fields, height = 500, onFieldClick, selectedField }: FieldMapProps) {
  const { t } = useTranslation();
  const [showCadastre, setShowCadastre] = useState(false);

  const parsedFields: ParsedField[] = fields.flatMap((field) => {
    if (!field.geoJson) return [];
    try {
      const geo = JSON.parse(field.geoJson) as GeoJsonObject;
      return [{ field, geo }];
    } catch {
      return [];
    }
  });

  const hasBoundaries = fieldBoundaries.length > 0;
  const hasGeoJson = parsedFields.length > 0;

  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className={s.flex_center}>
        <Switch
          size="small"
          checked={showCadastre}
          onChange={setShowCadastre}
          id="cadastre-layer-toggle-map"
        />
        <label htmlFor="cadastre-layer-toggle-map" className={s.block2}>
          {t.fields.cadastreLayer}
        </label>
      </div>
      <MapContainer
        center={hasBoundaries ? MAP_CENTER : [48.5, 35.0]}
        zoom={hasBoundaries ? MAP_ZOOM : 10}
        style={{ height: '100%', width: '100%', background: '#060B14' }}
        zoomControl={true}
      >
        {/* Dark satellite-style tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <CadastreLayer enabled={showCadastre} />

        {/* Demo field polygons from static data */}
        {fieldBoundaries.map((field) => (
          <Polygon
            key={field.fieldName}
            positions={field.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])}
            pathOptions={{
              color: field.color,
              fillColor: field.color,
              fillOpacity: selectedField === field.fieldName ? 0.5 : 0.25,
              weight: selectedField === field.fieldName ? 3 : 1.5,
              opacity: 0.8,
            }}
            eventHandlers={{
              click: () => onFieldClick?.(field.fieldName),
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.4, weight: 2.5 });
              },
              mouseout: (e) => {
                if (selectedField !== field.fieldName) {
                  e.target.setStyle({ fillOpacity: 0.25, weight: 1.5 });
                }
              },
            }}
          >
            <Tooltip sticky>
              <div style={{ padding: '4px 0' }}>
                <strong>{field.fieldName}</strong>
              </div>
            </Tooltip>
          </Polygon>
        ))}

        {/* Real DB GeoJSON fields */}
        {hasGeoJson && <FitBoundsToFields features={parsedFields} />}
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
    </div>
  );
}
