import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import { Switch } from 'antd';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import type { FieldDetailDto } from '../../types/field';
import { getCropColor } from '../../utils/cropColors';
import { useTranslation } from '../../i18n';
import CadastreLayer from './CadastreLayer';
import s from './FieldDrawMap.module.css';

interface DrawControlProps {
  field: FieldDetailDto;
  onGeometryChange: (geoJson: string | null) => void;
}

function DrawControl({ field, onGeometryChange }: DrawControlProps) {
  const map = useMap();
  // Keep a stable reference to the callback to avoid re-attaching on every render
  const onGeometryChangeRef = useRef(onGeometryChange);
  onGeometryChangeRef.current = onGeometryChange;

  useEffect(() => {
    const color = getCropColor(field.currentCrop);
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Load existing geometry
    if (field.geoJson) {
      try {
        const geo = JSON.parse(field.geoJson);
        L.geoJSON(geo, {
          style: { color, fillColor: color, fillOpacity: 0.3, weight: 2 },
        }).eachLayer((layer) => drawnItems.addLayer(layer));
      } catch {
        // ignore invalid GeoJSON
      }
    }

    const drawControl = new (L.Control as unknown as {
      Draw: new (options: unknown) => L.Control;
    }).Draw({
      draw: {
        polygon: {
          shapeOptions: { color, fillColor: color, fillOpacity: 0.3, weight: 2 },
          allowIntersection: false,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawControl);

    // Fit map to existing geometry
    if (drawnItems.getLayers().length > 0) {
      try {
        const bounds = drawnItems.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch {
        // ignore bounds errors
      }
    }

    // Notify parent with current GeoJSON after each change
    const notify = () => {
      const layers = drawnItems.getLayers();
      if (layers.length > 0) {
        onGeometryChangeRef.current(JSON.stringify(drawnItems.toGeoJSON()));
      } else {
        onGeometryChangeRef.current(null);
      }
    };

    // Notify with initial state
    if (field.geoJson) {
      onGeometryChangeRef.current(field.geoJson);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DrawEvent = (L as any).Draw.Event as Record<string, string>;
    const evCreated = DrawEvent.CREATED;
    const evEdited = DrawEvent.EDITED;
    const evDeleted = DrawEvent.DELETED;

    map.on(evCreated, (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      e.layer.setStyle({ color, fillColor: color, fillOpacity: 0.3, weight: 2 });
      drawnItems.addLayer(e.layer);
      notify();
    });
    map.on(evEdited, notify);
    map.on(evDeleted, notify);

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      map.off(evCreated);
      map.off(evEdited);
      map.off(evDeleted);
    };
  }, [map, field.id, field.geoJson, field.currentCrop]); // re-init when field or crop changes

  return null;
}

interface FieldDrawMapProps {
  field: FieldDetailDto;
  onGeometryChange: (geoJson: string | null) => void;
  height?: number;
}

export default function FieldDrawMap({ field, onGeometryChange, height = 400 }: FieldDrawMapProps) {
  const { t } = useTranslation();
  const [showCadastre, setShowCadastre] = useState(false);

  return (
    <div>
      <div className={s.flex_center}>
        <Switch
          size="small"
          checked={showCadastre}
          onChange={setShowCadastre}
          id="cadastre-layer-toggle"
        />
        <label htmlFor="cadastre-layer-toggle" className={s.block1}>
          {t.fields.cadastreLayer}
        </label>
      </div>
      <MapContainer
        style={{ height, width: '100%' }}
        center={[48.5, 35.0]}
        zoom={10}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <CadastreLayer enabled={showCadastre} />
        <DrawControl field={field} onGeometryChange={onGeometryChange} />
      </MapContainer>
    </div>
  );
}
