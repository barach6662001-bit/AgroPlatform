import { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useFieldsStatus } from '@/hooks/useFieldsStatus';

function ndviToColor(ndvi: number): string {
  if (ndvi < 0.3) return '#7f1d1d';
  if (ndvi < 0.5) return '#f59e0b';
  if (ndvi < 0.7) return '#65a30d';
  if (ndvi < 0.8) return '#16a34a';
  return '#15803d';
}

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.fitBounds(bounds as any, { padding: [20, 20] });
    }
  }, [bounds, map]);
  return null;
}

export function FieldMap() {
  const { data: fields = [], isLoading } = useFieldsStatus();

  if (isLoading) {
    return <div className="skeleton-shimmer h-[500px] rounded-xl" />;
  }

  if (fields.length === 0) {
    return (
      <div className="rounded-xl border h-[500px] flex flex-col items-center justify-center text-center p-6"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div className="font-medium mb-2" style={{ color: 'var(--fg-primary)' }}>Немає полів</div>
        <p className="text-sm max-w-xs" style={{ color: 'var(--fg-tertiary)' }}>
          Додайте перше поле щоб побачити супутникову мапу з NDVI-аналітикою
        </p>
      </div>
    );
  }

  const allBounds = fields.flatMap((f) => f.polygon);
  const totalArea = fields.reduce((sum, f) => sum + f.area, 0);

  return (
    <div className="relative rounded-xl overflow-hidden border h-[500px] group"
      style={{ borderColor: 'var(--border-subtle)' }}>
      <MapContainer
        center={[50.45, 30.52]}
        zoom={10}
        style={{ height: '100%', width: '100%', background: '#0A0A0B' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Esri"
        />
        {fields.map((field) => (
          <Polygon
            key={field.id}
            positions={field.polygon}
            pathOptions={{
              color: ndviToColor(field.ndvi),
              fillColor: ndviToColor(field.ndvi),
              fillOpacity: 0.55,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{field.name}</div>
                <div className="text-xs text-gray-600">{field.culture} · {field.area} га</div>
                <div className="mt-1">NDVI: <span className="font-medium">{field.ndvi.toFixed(2)}</span></div>
              </div>
            </Popup>
          </Polygon>
        ))}
        <FitBounds bounds={allBounds} />
      </MapContainer>

      {/* top gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0A0A0B]/80 to-transparent" />

      {/* NDVI legend */}
      <div className="absolute bottom-3 left-3 backdrop-blur-sm rounded-lg border px-3 py-2 text-xs"
        style={{ background: 'rgba(17,17,19,0.9)', borderColor: 'var(--border-subtle)', color: 'var(--fg-secondary)' }}>
        <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--fg-tertiary)' }}>NDVI</div>
        <div className="flex items-center gap-2">
          <div className="flex rounded overflow-hidden">
            {[0.2, 0.4, 0.6, 0.75, 0.85].map((v) => (
              <div key={v} className="w-5 h-2" style={{ background: ndviToColor(v) }} />
            ))}
          </div>
          <div className="flex gap-3 text-[10px]" style={{ color: 'var(--fg-tertiary)' }}>
            <span>0.0</span><span>1.0</span>
          </div>
        </div>
      </div>

      {/* field count */}
      <div className="absolute top-3 left-3 backdrop-blur-sm rounded-lg border px-3 py-2 text-xs"
        style={{ background: 'rgba(17,17,19,0.9)', borderColor: 'var(--border-subtle)' }}>
        <span style={{ color: 'var(--fg-secondary)' }}>{fields.length} полів</span>
        <span className="mx-2" style={{ color: 'var(--fg-tertiary)' }}>·</span>
        <span style={{ color: 'var(--fg-secondary)' }}>{totalArea.toFixed(0)} га</span>
      </div>
    </div>
  );
}
