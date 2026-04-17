# Information Architecture Proposal — AgroPlatform Redesign

> Author: Senior Product Designer (AI-assisted)
> Date: 2026-04-16
> Status: Active — living document for Phase 0-3 execution

---

## Executive Summary

The current sidebar has **8 top-level sections → ~25+ pages**. A farm manager navigating this on mobile at 6am loses immediately. This proposal collapses the structure to **6 sections → ~12 pages** through ruthless consolidation by *user intent*, not database table.

The guiding principle: **group by what the user is trying to accomplish, not by what entity they're touching.**

---

## Current State Problems

| Problem | Root Cause | Impact |
|---------|-----------|--------|
| 9 analytics pages showing overlapping data | Built feature-by-feature, not persona-by-persona | User confusion, duplicate data |
| "Рух запасів" as separate page | Copied from admin panel model | Should be tab in Warehouse |
| "Поради по сівозміні" as separate nav item | Separate feature, not integrated | Should be tab in Field detail |
| "Карта парку" separate from Machinery | Map vs list as two pages | Should be tab in Operations |
| "Орендні платежі" in Finance sidebar | Financial aspect of a field feature | Should be tab in Fields |
| "P&L по полях" separate from Analytics | One of many analytics views | Consolidate into Finance/Analytics |
| Analytics section: 8 sub-items | Each analytic = one page | Replace with one flexible analytics view |

---

## Persona × Navigation Audit

### Persona A: Farm Operator (mobile, in field)
**Needs:** What operations are scheduled? Which field am I on? Log fuel usage quickly.
**Current friction:** 3+ taps to reach Operations. Machinery buried under sub-menu.
**New path:** Operations → top-level, one tap.

### Persona B: Accountant (desktop, office)
**Needs:** Costs by category, budget vs actual, sales records, payroll.
**Current friction:** Finance + Economics + Analytics — 3 sections for same data domain.
**New path:** Finance page with tabs. One section. All financial data.

### Persona C: CEO/Owner (tablet, 6am coffee)
**Needs:** Season health, big numbers, what needs attention.
**Current friction:** Dashboard shows static KPIs with no context. Must dig to understand why.
**New path:** Dashboard redesigned with Season Health Score, action items, contextual drill-downs.

---

## New Navigation Structure

```
🏠  /dashboard          — Огляд (Dashboard)
🌾  /fields             — Поля
⚙️   /operations         — Операції
📦  /warehouse          — Склад
💰  /finance            — Фінанси
👥  /team               — Команда
⚙️   /settings           — Налаштування  [admin-only, collapsed by default]
```

**Maximum depth: 2 levels** (page + tab). Never 3.

---

## Section-by-Section Decisions

### 1. Огляд `/dashboard`
**What it replaces:** Current Dashboard
**What changes:**
- Remove: "Стан полів" table (→ Fields page)
- Remove: Static "Quick actions" strip (contextual on each page)
- Add: Season Health Score hero card
- Add: Smart action items (3-5 personalized alerts with context)
- Add: Field map preview (interactive, 250px mobile / 400px desktop)
- Add: Recent activity feed (last 5 cross-entity actions)
- Fix: Revenue/Cost chart data bug (green line missing)

**Reasoning:** Dashboard is a *status monitor*, not a feature portal. It answers "how are we doing?" not "where can I go?".

---

### 2. Поля `/fields`
**What it replaces:** Fields + CropRotationAdvisor + LeasePage (from Finance)
**Structure:**
```
/fields                  — List + Map toggle view
/fields/:id              — Field detail with tabs:
  └── Огляд              — Summary + KPIs
  └── Операції           — Operations on this field
  └── Аналіз ґрунту      — Soil analysis
  └── Посів/Збір         — Seeding + Harvest records
  └── NDVI               — Satellite imagery
  └── Сівозміна          — Crop rotation + advisor (MOVED IN from separate page)
  └── Оренда             — Lease payments for this field (MOVED IN from Finance)
  └── Фінанси            — P&L for this field (MOVED IN from Finance)
```

**Killed:** `/fields/rotation-advisor` as standalone page → becomes tab in Field detail
**Killed:** `/fields/leases` as standalone page → becomes tab in Field detail

**Reasoning:** Crop rotation advice is about *a field*, not a global workflow. Lease payments belong to the field they're for. Navigating to "Finance → Leases" to manage a field payment is counterintuitive.

---

### 3. Операції `/operations`
**What it replaces:** Operations + Machinery + FleetMap + FuelStation
**Structure:**
```
/operations              — Operations list (default tab)
  Tabs:
  └── Операції           — Agro operations log
  └── Техніка            — Machinery list (was /machinery)
  └── Карта              — Fleet map (was /fleet) — tab, not separate page
  └── Паливо             — Fuel station log (was /fuel)

/operations/:id          — Operation detail (unchanged)
/machinery/:id           — Machine detail (keep dedicated route, sidebar-less context)
```

**Killed:** `/fleet` standalone page → tab in Operations
**Killed:** `/fuel` standalone page → tab in Operations

**Reasoning:** "Where is my equipment and what is it doing?" is one mental model. Operations, machinery location, and fuel consumption are all facets of the same question: *what's happening on the farm today?*

---

### 4. Склад `/warehouse`
**What it replaces:** WarehousesList + WarehouseItems + StockMovements + InventorySessions + GrainStorage + ImportItemsPage
**Structure:**
```
/warehouse               — Warehouse hub with tabs:
  └── Запаси             — Stock overview (was /warehouses/items)
  └── Склади             — Warehouse list (was /warehouses)
  └── Рух                — Stock movements (was /warehouses/movements)
  └── Зерносховище       — Grain storage (was /storage)
  └── Інвентаризація     — Inventory sessions (was /warehouses/inventory)

Import is an **action button** on the Запаси tab (not a separate page)
```

**Killed:** `/warehouses/import` standalone page → "Імпорт" button in Запаси tab
**Killed:** `/warehouses/movements` standalone page → tab in Warehouse hub

**Reasoning:** All warehouse operations are about *what do we have, where, and what moved?* One destination with tabs is dramatically simpler than 5 separate nav items.

---

### 5. Фінанси `/finance`
**What it replaces:** CostRecords + BudgetPage + FieldPnl + SalesList + all 8 analytics pages (CostAnalytics, MarginalityDashboard×2, SeasonComparison, BreakEvenCalculator, ResourceConsumption, FieldEfficiency, SalaryFuelAnalytics, RevenueAnalytics)
**Structure:**
```
/finance                 — Finance hub with tabs:
  └── Огляд              — Summary: revenue, costs, margin, budget status
  └── Витрати            — Cost records (was /economics)
  └── Продажі            — Sales list (was /sales)
  └── Бюджет             — Budget plan vs fact (was /economics/budget)
  └── Аналітика          — Unified analytics (replaces ALL 8 analytics pages)
                           Dimensions: by crop / by field / by month / by category / by season
                           Deep-link: /finance?tab=analytics&dim=field&season=2026
```

**Killed:** `/economics/analytics`, `/economics/pnl`, `/economics/marginality`, `/economics/season-comparison`, `/economics/break-even`, `/analytics/resources`, `/analytics/efficiency`, `/analytics/marginality`, `/analytics/salary-fuel`, `/sales/analytics`
**Kept as redirects:** All old URLs redirect to `/finance?tab=<appropriate>`

**Reasoning:** These 8 pages all answer the same question: *how is money flowing on this farm?* The difference is the grouping dimension (by month, by field, by crop, etc.). A flexible analytics view with a dimension selector is more powerful AND simpler than 8 fixed views. This is the single biggest UX win in this redesign.

---

### 6. Команда `/team`
**What it replaces:** EmployeeList + WorkLogPage + SalaryPage
**Structure:**
```
/team                    — Team hub with tabs:
  └── Співробітники      — Employee list + profiles
  └── Табель             — Work log / timesheet
  └── Зарплата           — Salary records
```

**Reasoning:** All three pages serve one persona: the HR manager. They always need all three. Tabs vs separate nav items reduces friction and shows the natural workflow (employee → hours → pay).

---

### 7. Налаштування `/settings`
**What it replaces:** Settings/Admin pages (Users, AuditLog, ApiKeys, RolePermissions, Approvals)
**Structure:** Unchanged content, but:
- Sidebar item hidden for non-admin roles
- Collapsed by default (doesn't distract farm workers)
- Sub-items: Users, Roles, Approvals, API Keys, Audit Log

---

## Route Mapping: Old → New

| Old Route | New Route | Type |
|-----------|-----------|------|
| `/fields/rotation-advisor` | `/fields/:id?tab=rotation` | Redirect + tab |
| `/fields/leases` | `/fields/:id?tab=lease` | Redirect to /fields with note |
| `/fleet` | `/operations?tab=fleet` | Redirect |
| `/fuel` | `/operations?tab=fuel` | Redirect |
| `/warehouses` | `/warehouse?tab=warehouses` | Redirect |
| `/warehouses/items` | `/warehouse?tab=stock` | Redirect |
| `/warehouses/movements` | `/warehouse?tab=movements` | Redirect |
| `/warehouses/inventory` | `/warehouse?tab=inventory` | Redirect |
| `/warehouses/import` | `/warehouse?tab=stock` | Redirect (import is action) |
| `/storage` | `/warehouse?tab=grain` | Redirect |
| `/economics` | `/finance?tab=costs` | Redirect |
| `/economics/analytics` | `/finance?tab=analytics` | Redirect |
| `/economics/pnl` | `/finance?tab=analytics&dim=field` | Redirect |
| `/economics/budget` | `/finance?tab=budget` | Redirect |
| `/economics/marginality` | `/finance?tab=analytics&dim=category` | Redirect |
| `/economics/season-comparison` | `/finance?tab=analytics&dim=season` | Redirect |
| `/economics/break-even` | `/finance?tab=analytics&dim=breakeven` | Redirect |
| `/sales` | `/finance?tab=sales` | Redirect |
| `/sales/analytics` | `/finance?tab=analytics&dim=revenue` | Redirect |
| `/analytics/resources` | `/finance?tab=analytics&dim=resources` | Redirect |
| `/analytics/efficiency` | `/finance?tab=analytics&dim=field` | Redirect |
| `/analytics/marginality` | `/finance?tab=analytics&dim=category` | Redirect |
| `/analytics/salary-fuel` | `/finance?tab=analytics&dim=payroll` | Redirect |
| `/hr/employees` | `/team?tab=employees` | Redirect |
| `/hr/worklogs` | `/team?tab=worklogs` | Redirect |
| `/hr/salary` | `/team?tab=salary` | Redirect |

---

## Pages Killed (with reasoning)

| Page | Reason |
|------|--------|
| `CropRotationAdvisor.tsx` | < 5 items, belongs in Field detail tab |
| `LeasePage.tsx` | Financial aspect of a field, not a standalone section |
| `FleetMap.tsx` (as page) | Map is a view mode, not a destination |
| `FuelStation.tsx` (as page) | Operations concern, not a top-level section |
| `StockMovements.tsx` (as page) | Always viewed in context of warehouse |
| `ImportItemsPage.tsx` (as page) | Action, not a page |
| `FieldPnl.tsx` | Analytics concern, lives in Finance |
| `CostAnalytics.tsx` | Merged into Finance unified analytics |
| `MarginalityDashboard.tsx` (×2) | Merged into Finance unified analytics |
| `SeasonComparison.tsx` | Dimension in unified analytics |
| `BreakEvenCalculator.tsx` | Widget in unified analytics |
| `ResourceConsumption.tsx` | Dimension in unified analytics |
| `FieldEfficiency.tsx` | Dimension in unified analytics |
| `SalaryFuelAnalytics.tsx` | Dimension in unified analytics |
| `RevenueAnalytics.tsx` | Merged into Finance/Sales tab |

---

## Navigation Sidebar: Before vs After

### Before (26 items, 2 levels deep):
```
Dashboard
├── Поля
│   ├── Поля
│   └── Поради по сівозміні
├── Виробництво
│   ├── Операції
│   ├── Техніка
│   └── Карта парку
├── Склад і логістика
│   ├── Склади
│   ├── Матеріали
│   ├── Зерносховище
│   ├── Паливна станція
│   ├── Рух запасів     [orphan page]
│   ├── Інвентаризація
│   └── Імпорт          [action disguised as page]
├── Персонал
│   ├── Співробітники
│   ├── Табель
│   └── Зарплата
├── Фінанси
│   ├── Витрати
│   ├── P&L по полях
│   ├── Бюджет
│   ├── Орендні платежі
│   └── Продажі
├── Аналітика
│   ├── Аналітика витрат     [duplicate of Витрати]
│   ├── Маржинальність       [overlaps P&L]
│   ├── Порівняння сезонів
│   ├── Точка беззбитковості
│   ├── Ефективність полів
│   ├── Зарплати і пальне
│   └── Споживання ресурсів
└── Налаштування (6 sub-items)
```

### After (12 items, tabs not nav):
```
Dashboard
├── Поля          (+ tabs in detail: overview/ops/soil/seeding/ndvi/rotation/lease/finance)
├── Операції      (tabs: ops / machinery / fleet-map / fuel)
├── Склад         (tabs: stock / warehouses / movements / grain / inventory)
├── Фінанси       (tabs: overview / costs / sales / budget / analytics)
├── Команда       (tabs: employees / worklogs / salary)
└── Налаштування  [admin only]
```

**Reduction: 26 → 6 sidebar items. 25+ pages → 12 destinations.**

---

## Mobile Navigation Pattern

On mobile (<640px):
- Sidebar hidden off-canvas
- Bottom navigation bar with 5 icons: Dashboard, Fields, Operations, Finance, Team
- Settings accessible via profile menu (top-right avatar)
- Hamburger in header opens full sidebar drawer as fallback

This follows the thumb-zone principle — bottom nav is reachable with one thumb while holding a phone in the field.

---

## Implementation Order

1. **Phase 1:** Fix data bugs (parallel, doesn't block IA work)
2. **Phase 2:** Create responsive infrastructure (breakpoints, AppShell, PremiumTable)
3. **Phase 3a:** Warehouse consolidation (simplest, isolated)
4. **Phase 3b:** Team consolidation (isolated)
5. **Phase 3c:** Operations consolidation (tabs, moderate complexity)
6. **Phase 3d:** Finance/Analytics consolidation (biggest win, most complex)
7. **Phase 3e:** Fields consolidation (field detail tabs)
8. **Phase 4:** Dashboard reimagined
9. **Phase 5:** Visual language consistency
10. **Phase 6:** Mobile first polish
11. **Phase 7:** Verification

---

*This document is the source of truth for IA decisions during the redesign. Update when decisions change.*
