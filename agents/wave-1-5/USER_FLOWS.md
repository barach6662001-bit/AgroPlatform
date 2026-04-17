# Wave 1.5 User Flows

## Flow 1: Role detection and dashboard routing

When user navigates to `/dashboard`:

1. `Dashboard.tsx` reads `useAuthStore((s) => s.user.role)`
2. Maps role → view:
   - `SuperAdmin`, `CompanyAdmin` → `<InvestorDashboard />`
   - `Manager` → `<ManagerDashboard />`
   - `WarehouseOperator` → `<WorkerDashboard />`
   - `Accountant` → `<FinanceDashboard />`
   - Unknown/missing → `<InvestorDashboard />` as safe default
3. If `user` is null → redirect to `/login` (handled by auth guard)
4. No toggle, no override. Role change requires logout + re-login.

---

## Flow 2: Investor dashboard on mount

1. Page shows **shimmer skeleton** matching layout immediately (no blank flash)
2. In parallel, fire queries:
   - `GET /api/dashboard/summary` → returns KPIs (revenue, margin, fields, NDVI)
   - `GET /api/dashboard/activity?limit=10` → returns feed
   - `GET /api/dashboard/fields-status` → returns field map data
   - `GET /api/dashboard/marginality-by-culture` → returns donut data
3. As each query resolves, the corresponding card swaps from shimmer to real content
4. When a KPI resolves, it animates its number from 0 → value via `useCountUp` (1.4s duration)
5. Activity feed renders oldest-first with staggered fade-in (100ms delay between items)
6. All charts animate from 0 values to final values with 800ms ease-out

### If backend endpoints don't exist yet
- Stub with realistic mock data in `frontend/src/mocks/dashboard.ts`
- Log in `_progress.md` as backend follow-ups
- Same mock shape as expected real API

---

## Flow 3: Live activity feed updates

1. On mount, hit `/api/dashboard/activity?limit=10`
2. Set up polling: every 30s, refetch
3. When new items arrive, prepend with slide-in animation from top
4. Relative timestamps update client-side every 15s ("2m ago" → "3m ago")
5. Click on activity item → navigate to the relevant detail page (e.g., field page, invoice page)

### Fallback if backend not ready
- Generate fake activity every 30s from mock data array
- Use real user names from the tenant if possible, else fake

---

## Flow 4: NDVI field map interaction

1. Map renders with satellite imagery as base layer
2. Field polygons overlaid with NDVI color (green-yellow-red gradient based on 0.0-1.0 values)
3. Cloud shadows animate slowly across map (CSS animation or canvas)
4. Each active tractor shows as a pulsing dot at its GPS coords
5. Click field → opens detail drawer with:
   - Field name, area, culture
   - NDVI trend (last 30 days, line chart)
   - Last operations list
   - "Navigate to field" button → `/fields/{id}`
6. Scroll wheel on map → zoom (up to 3 levels)
7. Drag → pan

### Fallback if no map library
- Show placeholder SVG with rectangles representing fields
- Still color-coded by NDVI
- Click still works (opens drawer with stub data)
- Log as "Wave 2 follow-up: integrate Mapbox GL or Leaflet"

---

## Flow 5: Role switch (via re-login)

Current user logs out → logs in as different role → sees different dashboard.

1. Sign out (clears auth)
2. Log back in as e.g. WarehouseOperator
3. Navigate to /dashboard
4. Renders WorkerDashboard instead of InvestorDashboard

This is tested in Playwright during task-11.

---

## Flow 6: Empty state rendering

For each dashboard section, if no data:
- Investor: "Season not yet started — Add your first field to see analytics"
- Manager: "No operations today — Good time to plan next week"
- Worker: "All tasks complete — Great work! 🎉" (with shimmer background)
- Finance: "No financial data yet — Import bank statement to begin"

All empty states use 21st.dev rich empty state components (not plain text).

---

## Flow 7: Mobile responsive

< 768px:
- All grids collapse to 1 column
- Sparklines resize to container
- Charts stack vertically
- Field map becomes full-width
- Activity feed moves to bottom

Between 768px-1024px:
- 2-column grids
- Map + feed side by side with feed narrower

≥ 1024px:
- Full layout as in wireframes
