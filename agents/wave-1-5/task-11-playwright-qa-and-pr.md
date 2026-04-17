# Task 11 — Playwright QA and Pull Request

**Goal:** Comprehensive screenshot sweep of all 4 dashboards, fix visual regressions, open PR.

**Depends on:** tasks 00-10

---

## Step 1 — Full Playwright sweep

For each dashboard (4 total) at viewport **1440×900** and **390×844 (mobile)**, capture:

| Dashboard | State | Filename |
|---|---|---|
| Investor | full page, populated | `final-investor-full.png` |
| Investor | hero only | `final-investor-hero.png` |
| Investor | field map popup open | `final-investor-map-popup.png` |
| Investor | activity feed scrolled | `final-investor-feed.png` |
| Investor | empty state (no fields) | `final-investor-empty.png` |
| Investor | loading state (shimmer) | `final-investor-loading.png` |
| Investor | mobile 390px | `final-investor-mobile.png` |
| Manager | full page | `final-manager-full.png` |
| Manager | operations row | `final-manager-operations.png` |
| Manager | field grid | `final-manager-grid.png` |
| Manager | mobile 390px | `final-manager-mobile.png` |
| Worker | full page | `final-worker-full.png` |
| Worker | warehouse table | `final-worker-table.png` |
| Worker | mobile 390px | `final-worker-mobile.png` |
| Finance | full page | `final-finance-full.png` |
| Finance | marginality table | `final-finance-marginality.png` |
| Finance | mobile 390px | `final-finance-mobile.png` |

Target: ~17 screenshots.

Save all under `docs/screenshots/wave-1-5/final/`.

---

## Step 2 — Visual regression checklist

For each screenshot, verify:

### Content
- [ ] No flat black backgrounds — gradient mesh visible everywhere
- [ ] No static "0" numbers — everything animated via useCountUp
- [ ] No plain borders — gradient accents on important cards
- [ ] No generic shimmer — skeletons match actual layout
- [ ] Tabular numerics (no digit jitter)
- [ ] Icons in 36x36 tinted containers

### Aesthetic
- [ ] Noise texture visible on hero sections (subtle)
- [ ] At least one glow on every major card
- [ ] Hover states work (manually verify 5 interactions)
- [ ] Culture colors consistent (sunflower always amber, wheat always yellow, etc.)
- [ ] Typography hierarchy clean (kpi-hero 32px, section-title 18px, label 11px uppercase)

### Functional
- [ ] Role-based routing works (tested across all 4 roles)
- [ ] No console errors in any dashboard
- [ ] Data hooks fall back to mock gracefully
- [ ] Navigation from dashboard cards works (field click → /fields/...)

---

## Step 3 — Fix regressions

Expected issues to fix:
- Mobile field map might be cramped → ensure leaflet is responsive
- Activity feed on mobile may need different layout
- Some 21st components might have hardcoded `bg-white` needing replacement

Commit any fixes as:
```
git commit -m "fix(dashboard): <what-was-fixed>

Task: wave-1-5/task-11"
```

---

## Step 4 — Build + perf check

```bash
cd frontend
npm run build 2>&1 | tee /tmp/build.log
```

Record:
- Bundle size (JS + CSS) vs Wave 1 baseline
- Any build warnings
- `tsc --noEmit` passes

Target: bundle grows ≤ 200KB gzipped. If more, investigate which 21st component is heavy.

---

## Step 5 — Update _progress.md with summary

Append:

```md
## Wave 1.5 complete

- Tasks: 12 / 12 ✅
- Commits: <N>
- Magic MCP components used: <count unique>
- Custom-written fallbacks: <list if any>
- Bundle: JS <before>kB → <after>kB (Δ <+/->)
         CSS <before>kB → <after>kB (Δ <+/->)
- New dependencies: framer-motion, leaflet, react-leaflet, @tanstack/react-query (if added)
- Screenshots: 17 final shots
- Dashboards working for all 4 roles:
  - CompanyAdmin → Investor ✓
  - Manager → Manager ✓
  - WarehouseOperator → Worker ✓
  - Accountant → Finance ✓
- Follow-ups:
  - Real backend endpoints for 4 dashboards (list them)
  - Mapbox GL upgrade with API key (task-04)
  - Real tenant context from authStore
  - Wire SignalR for live activity feed
  - Animated cloud overlay on field map
  - Light mode polish (currently Wave 1.5 is dark-first)
```

---

## Step 6 — Open PR

```bash
cd /workspaces/AgroPlatform
git push origin feat/full-redesign-v2

gh pr create \
  --base main \
  --head feat/full-redesign-v2 \
  --title "feat(dashboard): Wave 1.5 — 21st.dev-grade dashboards" \
  --body "$(cat <<'EOF'
## Summary

Wave 1.5 of the redesign. Replaces the sterile Wave 1 dashboard content with 4 role-aware dashboards built from 21st.dev components via magic MCP. Rich gradients, animated counters, glow effects, shimmer skeletons, satellite field map with NDVI, live activity feed, marginality breakdowns.

## What changed

### Foundation
- New aesthetic tokens (gradient meshes, glow colors, culture palette)
- Default theme switched to dark (Wave 2 revives light mode polish)
- `useCountUp` hook + `fmt` helpers for number formatting
- framer-motion, leaflet, react-leaflet, @tanstack/react-query added

### Role-based routing
- `/dashboard` auto-selects view by `user.role`:
  - SuperAdmin, CompanyAdmin, Viewer → **InvestorDashboard**
  - Manager → **ManagerDashboard**
  - WarehouseOperator → **WorkerDashboard**
  - Accountant → **FinanceDashboard**
- Suspense + layout-aware shimmer skeletons during load

### InvestorDashboard (money-shot)
- Season banner with pulse dot + day counter
- 4 KPI hero cards with animated counters + sparklines
- NDVI satellite field map (Leaflet + Esri imagery)
- Live activity feed with staggered fade-in + 30s polling
- Secondary stats (semi-circle gauges)
- Marginality donut breakdown by culture
- EBITDA area chart with gradient fill
- Cost monitoring progress bars
- Upcoming payments list

### ManagerDashboard
- Morning briefing header
- 4 ops-focused KPIs
- Active operations list with progress bars
- Alerts panel (severity-sorted)
- Field status grid (18 compact cards with NDVI mini-gauges)
- Team performance + pending approvals

### WorkerDashboard
- Dense, functional (no glow on content, quick tasks)
- 4 task shortcuts
- Warehouse state table (28px rows)
- My recent activity
- Quick action buttons panel

### FinanceDashboard
- Quarter selector header
- 4 financial KPIs (cash in/out, margin, receivables)
- Cashflow trend (area chart)
- Accounts payable table
- Marginality by field (sortable, progress bars)
- Cost categories donut
- Upcoming payments calendar

### Empty & loading states
- 4 rich contextual empty states (via 21st.dev components)
- Layout-aware shimmer skeletons per dashboard

## Metrics

| | Before (Wave 1) | After (Wave 1.5) | Δ |
|---|---|---|---|
| JS bundle (gz) | <X> kB | <Y> kB | <Δ> |
| CSS bundle (gz) | <X> kB | <Y> kB | <Δ> |
| Visual quality | 2001 | 2026 YC | ∞ |

## Screenshots

See `docs/screenshots/wave-1-5/final/` — 17 shots covering all 4 roles + empty + loading + mobile.

## How to test

1. Check out this branch
2. `cd frontend && npm install && npm run dev`
3. Log in as different roles to see different dashboards
4. Force different roles via DevTools console if needed:
   `useAuthStore.setState({ user: {...useAuthStore.getState().user, role: 'Manager' } })`

## Follow-ups

- [ ] Backend: 4 dashboard endpoints (see individual task files for shapes)
- [ ] Backend: real NDVI data via Sentinel-2 integration (Wave 3)
- [ ] Backend: real GPS data via SignalR (Wave 3)
- [ ] Light mode polish (Wave 2)
- [ ] Mapbox GL upgrade with API key (Wave 2)
- [ ] Wire Dashboard data to real `authStore.currentTenant` context
- [ ] Animated cloud overlays on field map

## Known trade-offs

- Dashboards render mock data when backend endpoints don't exist — the 4 data hooks each have a mock fallback
- Field map uses free Esri tiles — good for development, may want paid tier for production
- Some 21st.dev components required significant adaptation to match our tokens
- Light mode works but feels thin compared to dark (Wave 1.5 optimized for dark)

EOF
)"
```

---

## Step 7 — Final report

Post a summary message for Vlas:
- PR URL
- Top 5 most impressive visual changes
- Bundle delta
- Recommendation: after merge, demo to one person (investor OR farmer) and get feedback before Wave 2

---

## Acceptance criteria

- [ ] All 17 screenshots captured and committed
- [ ] All 4 role dashboards verified working
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `tsc --noEmit` passes
- [ ] Bundle size logged
- [ ] _progress.md has Wave 1.5 complete summary
- [ ] PR opened against main
- [ ] Magic MCP usage logged across all tasks (which components used)

---

## Git (final polish)

```bash
git add docs/screenshots/wave-1-5/final/ \
        agents/wave-1-5/_progress.md \
        frontend/

git commit -m "chore(dashboard): Wave 1.5 final polish + screenshots

- 17 final screenshots across 4 roles + states + viewports
- visual regression fixes: [list]
- bundle delta: [list]

Task: wave-1-5/task-11"
git push
```
