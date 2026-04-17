# Task 04 — NDVI Field Map

**Goal:** Replace FieldMapPlaceholder with a real interactive map showing fields with NDVI color overlay. This is the single most visually impressive element on the InvestorDashboard — the "wow at first glance" beating SAS Agro.

**Depends on:** task-03

---

## Step 1 — Search magic MCP for map component

Queries to try:
1. `"interactive satellite map with custom overlay polygons"`
2. `"mapbox style map component with markers and legend"`
3. `"fields map with colored regions and hover details"`

If magic doesn't return suitable results (maps are complex), use a combination:
- Base map via Mapbox GL or Leaflet (industry standard)
- Overlays styled with our tokens
- Wrapper component following 21st-dev aesthetic

---

## Step 2 — Install base map library

Mapbox GL is the richest option but requires an API key. Default to Leaflet for Wave 1.5 (free, no token). Agent should:

```bash
cd frontend
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

If Vlas wants Mapbox later (Wave 2+), the switch is isolated to one file.

---

## Step 3 — Field map component

Create `frontend/src/components/dashboard/investor/FieldMap.tsx`:

```tsx
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useFieldsStatus } from '@/hooks/useFieldsStatus'
import { useEffect } from 'react'

// NDVI color scale (standard agri palette)
function ndviToColor(ndvi: number): string {
  if (ndvi < 0.3) return '#7f1d1d'       // red-900 (stressed)
  if (ndvi < 0.5) return '#f59e0b'       // amber-500 (moderate)
  if (ndvi < 0.7) return '#65a30d'       // lime-600 (healthy)
  if (ndvi < 0.8) return '#16a34a'       // green-600 (very healthy)
  return '#15803d'                        // green-700 (excellent)
}

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (bounds.length > 0) map.fitBounds(bounds as any, { padding: [20, 20] })
  }, [bounds, map])
  return null
}

export function FieldMap() {
  const { data: fields = [], isLoading } = useFieldsStatus()

  if (isLoading) {
    return <div className="skeleton-shimmer h-[500px] rounded-xl" />
  }

  if (fields.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface/30 h-[500px] flex flex-col items-center justify-center text-center p-6">
        <div className="text-fg-primary font-medium mb-2">Немає полів</div>
        <p className="text-fg-tertiary text-sm max-w-xs">
          Додайте перше поле щоб побачити супутникову мапу з NDVI-аналітикою
        </p>
      </div>
    )
  }

  const allBounds = fields.flatMap(f => f.polygon)

  return (
    <div className="relative rounded-xl overflow-hidden border border-border-subtle h-[500px] group">
      <MapContainer
        center={[50.45, 30.52]}
        zoom={10}
        style={{ height: '100%', width: '100%', background: 'var(--bg-deep)' }}
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
                <div className="text-xs text-gray-600">{field.culture} · {field.area} ha</div>
                <div className="mt-1">NDVI: <span className="font-medium">{field.ndvi.toFixed(2)}</span></div>
              </div>
            </Popup>
          </Polygon>
        ))}
        <FitBounds bounds={allBounds} />
      </MapContainer>

      {/* Gradient overlay for top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-bg-deep/80 to-transparent" />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-bg-surface/90 backdrop-blur-sm rounded-lg border border-border-subtle p-3 text-xs text-fg-secondary">
        <div className="text-kpi-label mb-2">NDVI</div>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[0.2, 0.4, 0.6, 0.75, 0.85].map((v) => (
              <div key={v} className="w-5 h-2" style={{ background: ndviToColor(v) }} />
            ))}
          </div>
          <div className="flex gap-2 text-[10px] text-fg-tertiary">
            <span>0.0</span>
            <span>1.0</span>
          </div>
        </div>
      </div>

      {/* Field count */}
      <div className="absolute top-3 left-3 bg-bg-surface/90 backdrop-blur-sm rounded-lg border border-border-subtle px-3 py-2 text-xs">
        <span className="text-fg-secondary">{fields.length} полів</span>
        <span className="text-fg-tertiary mx-2">·</span>
        <span className="text-fg-secondary">
          {fields.reduce((sum, f) => sum + f.area, 0).toFixed(0)} ha
        </span>
      </div>
    </div>
  )
}
```

---

## Step 4 — useFieldsStatus hook with mock fallback

Create `frontend/src/hooks/useFieldsStatus.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

export interface FieldStatus {
  id: string
  name: string
  culture: string
  cultureKey: string
  area: number
  ndvi: number
  polygon: [number, number][]  // lat/lng pairs
}

export function useFieldsStatus() {
  return useQuery<FieldStatus[]>({
    queryKey: ['fields-status'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/fields-status', { credentials: 'include' })
        if (!res.ok) throw new Error('not ready')
        return await res.json()
      } catch {
        // Mock — 6 fields near Kyiv
        return [
          {
            id: 'XRI-BOT-001', name: 'ХРИ-БОТ-001', culture: 'Соняшник', cultureKey: 'sunflower',
            area: 96.06, ndvi: 0.74,
            polygon: [[50.42, 30.50], [50.43, 30.50], [50.43, 30.52], [50.42, 30.52]],
          },
          {
            id: 'XRI-PEN-008', name: 'ХРИ-ПЕН-008', culture: 'Пшениця', cultureKey: 'wheat',
            area: 83.23, ndvi: 0.68,
            polygon: [[50.44, 30.52], [50.45, 30.52], [50.45, 30.54], [50.44, 30.54]],
          },
          {
            id: 'HOL-KRU-004', name: 'ГОЛ-КРУ-004', culture: 'Кукурудза', cultureKey: 'corn',
            area: 181.50, ndvi: 0.81,
            polygon: [[50.46, 30.48], [50.48, 30.48], [50.48, 30.51], [50.46, 30.51]],
          },
          {
            id: 'HRY-GRU-001', name: 'ГОЛ-ГРУ-001', culture: 'Ріпак', cultureKey: 'rapeseed',
            area: 112.56, ndvi: 0.62,
            polygon: [[50.44, 30.55], [50.46, 30.55], [50.46, 30.58], [50.44, 30.58]],
          },
          {
            id: 'MON-KUP-002', name: 'МОН-КУП-002', culture: 'Соя', cultureKey: 'soy',
            area: 138.18, ndvi: 0.77,
            polygon: [[50.41, 30.53], [50.43, 30.53], [50.43, 30.56], [50.41, 30.56]],
          },
          {
            id: 'GOL-LUC-007', name: 'ГОЛ-ЛЮЦ-007', culture: 'Люцерна', cultureKey: 'peas',
            area: 277.70, ndvi: 0.71,
            polygon: [[50.47, 30.54], [50.49, 30.54], [50.49, 30.58], [50.47, 30.58]],
          },
        ]
      }
    },
    refetchInterval: 5 * 60_000,
  })
}
```

---

## Step 5 — Replace placeholder in InvestorDashboard

In `frontend/src/pages/dashboards/InvestorDashboard.tsx`:
- Remove `FieldMapPlaceholder` import
- Import `FieldMap` from `components/dashboard/investor/FieldMap`
- Replace `<FieldMapPlaceholder />` with `<FieldMap />`

---

## Acceptance criteria

- [ ] FieldMap renders a real satellite base map
- [ ] 6 mock field polygons appear with NDVI-colored fills
- [ ] Click polygon → popup shows field name, culture, area, NDVI
- [ ] Legend at bottom left shows NDVI color scale
- [ ] Field count + total hectares at top left
- [ ] Empty state when no fields (not an error)
- [ ] Shimmer skeleton during load
- [ ] No console errors from leaflet
- [ ] `npm run build` passes

---

## Known follow-ups (log in _progress.md)
- Upgrade to Mapbox GL for 3D terrain + better UX when Vlas provides API key
- Wire to real `/api/dashboard/fields-status` when backend exposes GeoJSON
- Add animated cloud overlay (CSS animation over map)
- Add pulsing dots for active tractors with GPS positions

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-04-field-map.png`
- `docs/screenshots/wave-1-5/task-04-field-map-popup.png` (with a popup open)

---

## Git

```bash
git add frontend/src/components/dashboard/investor/FieldMap.tsx \
        frontend/src/hooks/useFieldsStatus.ts \
        frontend/src/pages/dashboards/InvestorDashboard.tsx \
        frontend/package.json frontend/package-lock.json \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): NDVI field map with satellite imagery

- Leaflet + react-leaflet
- Esri World Imagery tiles (free, no key)
- Field polygons with NDVI color coding
- Popups with field details
- Legend + field count widgets
- Empty state + shimmer skeleton
- Mock fallback: 6 fields near Kyiv

Follow-ups:
- Mapbox GL for 3D terrain when API key available
- Real backend endpoint /api/dashboard/fields-status
- Animated cloud overlay (Wave 2)
- Pulsing dots for active tractors (Wave 2)

Task: wave-1-5/task-04"
git push
```

Append to `_progress.md`.
