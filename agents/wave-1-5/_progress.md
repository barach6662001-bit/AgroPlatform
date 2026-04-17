# Wave 1.5 Progress

Append entries here as each task completes. Do NOT pre-fill.

Format:
```
## task-NN — [title]
- Completed: YYYY-MM-DD HH:MM UTC
- Commit: <sha>
- Magic components used:
  - 21st/<component-name> (adapted for: <use-case>)
  - 21st/<component-name> (adapted for: <use-case>)
- Custom written: <name and 1-line reason, or "none">
- Screenshots: docs/screenshots/wave-1-5/task-NN-{light,dark}.png
- Notes: <anything unusual>
```

---

## task-04 — NDVI field map
- Completed: 2026-04-17 UTC
- Commit: TBD
- Magic components used: none (Leaflet map, not a 21st.dev component)
- Custom written: FieldMap.tsx (Leaflet + react-leaflet + NDVI polygon overlay + legend), useFieldsStatus hook with 6 mock fields
- Screenshots: agents/wave-1-5/task-04-{field-map,map-view}.png
- Notes: Esri satellite tiles via arcgisonline.com. NDVI color scale: red→amber→lime→green. 6 mock fields near Kyiv. fitBounds auto-centers on all fields.

---

## task-03 — complete InvestorDashboard layout
- Completed: 2026-04-17 UTC
- Commit: TBD
- Magic components used:
  - 21st/DonutChart (adapted for: MarginalityBreakdown with culture colors + center animated total)
- Custom written:
  - SecondaryStats (3 queries failed; custom SVG semi-circle gauges + fuel/team cards)
  - MarginalityBreakdown (uses DonutChart from 21st.dev + custom horizontal bars)
  - placeholders.tsx (FieldMap/ActivityFeed/FinanceSection slots for later tasks)
- Screenshots: agents/wave-1-5/task-03-{investor-full,secondary-stats,marginality-final}.png
- Notes: Semi-circle gauge uses framer-motion animated strokeDashoffset on SVG arc path. MarginalityBreakdown donut center shows animated total on hover. All culture colors via CSS vars.

---

## task-02 — role-based dashboard router
- Completed: 2026-04-17 UTC
- Commit: TBD
- Magic components used: none
- Custom written: none (routing logic only)
- Screenshots: agents/wave-1-5/task-02-{investor,manager,worker,finance}.png
- Notes: Root cause of blank page — browser had cached old production build (assets/index-D_3TRFxw.js from dist/) via service worker. After clearing SW cache, React.lazy() still caused infinite suspend (retryLane stayed 0 after retry). Fix: InvestorDashboard (primary role) imported directly; Manager/Worker/Finance still use lazy(). TypeScript check + prod build pass.

---

## task-01 — hero components
- Completed: 2026-04-17 UTC
- Commit: 51e8f9f
- Magic components used:
  - 21st/Status + StatusIndicator (pulse dot DNA in SeasonBanner)
- Custom written:
  - SeasonBanner (3 queries failed: "hero banner gradient glow dark", "status banner pulse live indicator", "gradient banner status progress card")
  - KPICard with recharts sparkline (3 queries failed: "metric card sparkline trend", "kpi card sparkline chart dark", "dashboard stats sparkline recharts")
  - HeroSection composition
  - useDashboardSummary hook
- Screenshots: docs/screenshots/wave-1-5/task-01-hero-dark.png
- Notes: Backend API returns 500 (not running) so error toasts appear; HeroSection renders mock data correctly. Moved HeroSection before loading guards in Dashboard.tsx.

## task-00 — aesthetic foundation
- Completed: 2026-04-17 UTC
- Commit: ba582ee
- Magic components used: none (tokens/hooks, not visual components)
- Custom written: useCountUp hook (utility, not visual component)
- Screenshots: n/a (no UI changes)
- Notes: defaultTheme changed from "light" → "dark" in main.tsx ThemeProvider. Wave 2 will add light-mode dashboard polish.
