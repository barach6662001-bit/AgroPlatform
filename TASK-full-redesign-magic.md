# TASK: Full Project Redesign with 21st.dev Magic MCP

> Goal: Transform AgroPlatform from "functional MVP" to "premium agritech SaaS" using 21st.dev magic MCP components.
> Philosophy: AgroHero landing page quality, applied to EVERY screen.
> DO NOT break existing functionality — only replace visual layer. Keep ALL business logic, API calls, stores, i18n, permissions intact.

---

## Execution Rules

1. **Incremental commits** — commit after each phase, don't do it all in one giant PR
2. **Preserve logic** — when replacing a component, copy existing props/state/hooks verbatim, only change JSX and styles
3. **Magic first** — always start with `magic` MCP to generate base component, then adapt to existing data
4. **Ukrainian everywhere** — translate any English magic-generated strings to Ukrainian via existing i18n system
5. **Navy theme consistency** — generated components MUST use existing CSS tokens (`--color-page-bg: #0B1220`, `--color-card-bg: #0F1629`, etc.). Override magic's default colors if needed.
6. **Dark mode only** — don't add light mode assumptions from magic outputs

---

## Phase 1: Design Tokens Alignment

Ensure all MCP-generated components use the same design system.

Update `frontend/src/styles/tokens.css` to define these tokens clearly (if not already):

```css
:root {
  /* Brand */
  --brand: #22C55E;
  --brand-hover: #16A34A;
  --brand-glow: rgba(34, 197, 94, 0.15);
  
  /* Backgrounds — navy */
  --bg-page: #060B14;
  --bg-surface: #0C1222;
  --bg-elevated: #111A2E;
  --bg-hover: #1A2540;
  
  /* Text */
  --text-primary: rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-tertiary: rgba(255, 255, 255, 0.35);
  
  /* Borders */
  --border: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);
  --border-strong: rgba(255, 255, 255, 0.2);
  
  /* Crop colors — vibrant */
  --crop-wheat: #FBBF24;
  --crop-sunflower: #F97316;
  --crop-corn: #22C55E;
  --crop-rapeseed: #A855F7;
  --crop-barley: #0EA5E9;
  --crop-soy: #14B8A6;
  --crop-fallow: #94A3B8;
  
  /* Semantic */
  --accent-revenue: #22C55E;
  --accent-cost: #EF4444;
  --accent-info: #3B82F6;
  --accent-warning: #F59E0B;
  --accent-premium: #A855F7;
}
```

Commit: `feat(design): consolidate design tokens for MCP redesign`

---

## Phase 2: Dashboard Redesign

**Current state:** 4 KPI cards (flat), alert banner, empty "Фінансовий огляд" chart, simple table "Стан полів", timeline "Останні операції".

**Goal:** Premium operational command center.

In Claude Code, run:

```
Use magic MCP to generate a premium dashboard layout for an agritech farm management platform with these elements:

1. HERO KPI row: 4 stat cards with animated count-up numbers, mini sparkline charts inside each card, gradient accent borders on top (green for revenue, red for costs, blue for area, amber/purple for profit)
2. ALERT strip: single-line compact alert banner with amber warning icon
3. PRIMARY CHART: full-width area chart showing revenue vs costs by month with gradient fills and glowing data points
4. TWO-COLUMN LOWER:
   - Left: "Field Status" card with crop tag pills (colored) and area bars
   - Right: "Recent Operations" timeline with status badges and relative timestamps
5. QUICK ACTIONS: compact icon+label row at bottom

Style: dark navy theme (#060B14 bg, #0C1222 cards), green primary (#22C55E), tabular number font for metrics, subtle animations on hover. NO light mode. Use existing CSS tokens from frontend/src/styles/tokens.css.

Generate as separate component files so I can integrate piece by piece:
- frontend/src/pages/Dashboard/components/KpiHeroRow.tsx
- frontend/src/pages/Dashboard/components/RevenueCostChart.tsx
- frontend/src/pages/Dashboard/components/FieldStatusCard.tsx
- frontend/src/pages/Dashboard/components/OperationsTimeline.tsx
- frontend/src/pages/Dashboard/components/QuickActionsStrip.tsx

After generation, integrate them into frontend/src/pages/Dashboard.tsx, preserving all existing data fetching hooks (useQuery for analytics, existing API calls). Translate all strings to Ukrainian.
```

Verify build passes, then commit: `feat(dashboard): redesign with magic MCP components`

---

## Phase 3: Fields Page — Map + Field Cards

**Current state:** FieldMap with polygons works. Side panel is basic. "Список" view shows plain Ant Table.

**Goal:** Cropwise-level map experience with premium side panel and field cards.

```
Use magic MCP to enhance the fields management page:

1. MAP SIDE PANEL (when field selected): premium glass-morphism panel with:
   - Field name as hero title with crop badge
   - 4 metrics in 2x2 grid (area, current crop, ownership type, cadastral number)
   - NDVI gauge with color ramp (red→yellow→green)
   - Recent operations list (last 3)
   - Primary CTA "Відкрити деталі →" with gradient bg
   - Secondary actions: "Редагувати", "Експорт"

2. LIST VIEW alternative: replace current table with card grid — each field as a card with:
   - Thumbnail polygon preview (small SVG)
   - Name + cadastral
   - Area badge
   - Crop tag colored pill  
   - Mini NDVI indicator
   - Hover: lift shadow, show "Переглянути" button

3. TOOLBAR: polished segmented control for List/Map toggle, premium search input with glow on focus, filter chips

Preserve: existing Leaflet map component (FieldMap.tsx), field data structure, all API calls.
Style: navy theme, crop color coding, Ukrainian labels.

Integrate into:
- frontend/src/pages/Fields/FieldsList.tsx (main page)
- frontend/src/pages/Fields/components/FieldSidePanel.tsx (replaces inline panel)
- frontend/src/pages/Fields/components/FieldCard.tsx (new, for grid view)
- frontend/src/pages/Fields/components/FieldsToolbar.tsx
```

Commit: `feat(fields): premium map side panel + card grid view`

---

## Phase 4: Sidebar + Header Premium Polish

**Current state:** Functional sidebar with icons, functional header with search.

**Goal:** Feel like Linear/Vercel sidebar — crisp, premium, with subtle details.

```
Use magic MCP to generate a premium sidebar and header for an agritech SaaS dashboard:

1. SIDEBAR (240px):
   - Logo area at top with subtle gradient underline
   - Menu sections with uppercase labels and mini dividers
   - Active item: left accent bar (4px) with green glow + icon color change
   - Hover: subtle background fade
   - Submenu: indented with dot indicators  
   - User area at bottom: avatar circle with initials, name, role badge, menu trigger on click
   - Collapse/expand animation

2. HEADER (52px):
   - Breadcrumbs with chevron separators
   - Premium search input: expands on focus from 240→400px, shows ⌘K shortcut chip, autocomplete dropdown
   - Notification bell with red dot for unread, dropdown panel on click
   - Theme toggle (disabled for now, dark only)
   - Language switcher: flag + code (UA/EN)
   - User menu: avatar + caret

Style: navy theme, glass backdrop-filter blur (for header), 1px borders with low opacity, smooth transitions.

Output components:
- frontend/src/components/Layout/Sidebar.tsx (replace)
- frontend/src/components/Layout/Header.tsx (new or replace)
- frontend/src/components/Layout/UserMenu.tsx (new)
- frontend/src/components/Layout/NotificationPanel.tsx (new)

Preserve: all existing route links, auth store usage, i18n, theme store hooks.
```

Commit: `feat(layout): premium sidebar and header redesign`

---

## Phase 5: Tables Everywhere

**Current state:** Ant Design tables with basic styling.

**Goal:** One premium `<PremiumTable>` component used across all list pages.

```
Use magic MCP to generate a premium data table component:

- Header row: uppercase 11px muted labels with sort chevrons
- Body rows: 48px height, hover state with background fade, subtle bottom border  
- Cell types: text, number (right-aligned tabular), badge, avatar, progress bar, action buttons (appear on row hover)
- Empty state: custom SVG illustration + title + description + CTA
- Loading state: skeleton shimmer rows
- Pagination: compact "X-Y of Z" + page arrows + size selector
- Bulk selection: checkbox column with select-all in header
- Filters: inline filter chips above table

Output: frontend/src/components/PremiumTable/PremiumTable.tsx + types

Then replace Ant Table usage in:
- frontend/src/pages/Sales/SalesList.tsx
- frontend/src/pages/Machinery/MachineryList.tsx
- frontend/src/pages/Operations/OperationsList.tsx
- frontend/src/pages/HR/EmployeeList.tsx
- frontend/src/pages/Warehouses/WarehousesList.tsx
- frontend/src/pages/Warehouses/WarehouseItems.tsx
- frontend/src/pages/Economics/CostRecords.tsx
- frontend/src/pages/Admin/AuditLogPage.tsx

Keep all columns definitions and data fetching logic intact.
```

Commit: `feat(tables): premium unified table component across all list pages`

---

## Phase 6: Forms & Modals

**Current state:** Ant Design default forms.

**Goal:** Modern forms with floating labels, smooth transitions, better validation feedback.

```
Use magic MCP to generate premium form components:

1. INPUT: floating label, focus ring with green glow, validation error slot below
2. SELECT: custom dropdown with search, premium styled options
3. DATE RANGE PICKER: side-by-side calendars, navy theme  
4. NUMBER INPUT: with +/- increment buttons, formatted display
5. TEXTAREA: auto-resize with char counter
6. FORM LAYOUT: field groups with section headers, grid layout, sticky submit bar
7. MODAL: backdrop blur, card with gradient border top, smooth slide-in animation
8. DRAWER: side panel alternative to modal, right-slide-in

Output:
- frontend/src/components/Form/Input.tsx
- frontend/src/components/Form/Select.tsx  
- frontend/src/components/Form/DateRangePicker.tsx
- frontend/src/components/Form/NumberInput.tsx
- frontend/src/components/Form/Textarea.tsx
- frontend/src/components/Modal/PremiumModal.tsx
- frontend/src/components/Modal/PremiumDrawer.tsx

Wrap Ant Design primitives if easier than replacing — the wrapper component just needs to present new visual layer.
```

Commit: `feat(forms): premium form and modal components`

---

## Phase 7: Charts — Recharts Customization

**Current state:** Recharts with basic config, some charts empty.

**Goal:** Every chart looks like Stripe dashboard.

```
Create a premium Recharts theme wrapper that ALL charts in the app will use:

1. Create frontend/src/components/charts/PremiumChartTheme.tsx with:
   - Gradient fill defs (green, red, blue, amber, purple)
   - Custom grid (horizontal dashed only, 0.04 opacity)
   - Custom tooltip (navy bg, border, padding, rounded)
   - Custom axis (muted 11px, no line, no ticks)
   - Custom legend (horizontal pills with dots)
   - Animated load (bar grow, line draw)

2. Create wrapper components:
   - PremiumAreaChart
   - PremiumBarChart  
   - PremiumLineChart
   - PremiumDonutChart
   - PremiumSparkline

3. Replace all existing Recharts usage with these wrappers in:
   - Dashboard financial overview
   - Economics/CostAnalytics pie + bar
   - Economics/FieldPnl bar
   - Economics/BudgetPage plan vs fact
   - Economics/MarginalityDashboard
   - Analytics/* all pages
   - Sales/RevenueAnalytics

Keep data structures and props identical — just the visual wrapper changes.
```

Commit: `feat(charts): premium recharts theme across all analytics`

---

## Phase 8: Polish Pass — Hover states, Empty states, Loading

```
Polish pass across the entire application:

1. EMPTY STATES: every page that can be empty gets a custom empty state:
   - Fields: "Ще немає полів. Додайте перше поле →"
   - Machinery: "Парк техніки порожній..."
   - Sales: "Ще немає продажів..."
   - etc (find all Ant Empty usages)

2. LOADING STATES: skeleton screens for:
   - KpiCard loading
   - Table loading  
   - Chart loading
   - Map loading
   Show for 300ms minimum to avoid flash.

3. HOVER STATES on every interactive element:
   - Cards: subtle lift + border brighten
   - Buttons: subtle glow
   - Tags: slight opacity increase
   - Rows: background fade

4. PAGE TRANSITIONS: fade-in + slight upward translate on route change (200ms)

5. MICRO-INTERACTIONS:
   - Form submit success: checkmark animation
   - Delete confirmations: shake animation on danger button
   - Number updates: countUp animation
   - Badge counts: scale-in animation

Use Framer Motion (already a dependency from AgroHero). Keep animations subtle — 200-300ms max, 60fps.
```

Commit: `feat(polish): empty states, skeletons, micro-interactions across app`

---

## Phase 9: Verification

After all phases:

```bash
# Type check
cd frontend && npx tsc --noEmit

# Build
npm run build

# Lint  
npm run lint

# Visual smoke test via playwright MCP
```

Then in Claude Code:
```
Use playwright MCP to open the deployed site after merge:
1. Screenshot /landing
2. Login, screenshot /
3. Navigate to /fields — screenshot map view + select a field
4. /economics, /economics/analytics, /economics/budget — screenshots
5. /machinery, /sales, /hr/employees — screenshots

Save all screenshots to /tmp/redesign-final/ for review.
```

---

## Final — PR & Merge

```bash
gh pr create --base main \
  --title "feat(ui): full premium redesign with 21st.dev magic MCP" \
  --body "8-phase redesign applying AgroHero-quality design across entire application. All business logic preserved. Screenshots in comments."

# After CI:
gh pr merge --squash --delete-branch
```

---

## Guardrails — DO NOT

- ❌ Don't delete any existing logic files (stores, api/*, hooks)
- ❌ Don't change API endpoints or request shapes  
- ❌ Don't remove permissions / tenant filtering
- ❌ Don't add light mode — dark navy only
- ❌ Don't add English strings — everything Ukrainian via i18n
- ❌ Don't bloat bundle with multiple UI libraries — stick to Ant Design + Framer Motion + tokens CSS
- ❌ Don't do all phases in one commit — incremental
