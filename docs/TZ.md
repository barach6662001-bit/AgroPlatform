# AgroPlatform TZ — Original audit findings with fix specifications

> Reference document. Captures the original scope of the audit-driven fix cycle.
> This file does NOT define PR order — see `docs/ROADMAP.md` for that.
> Use this file to understand business context and acceptance criteria for each point.
>
> Status markers:
> - `[CLOSED in PR #X]` — fully shipped, no remaining work
> - `[PARTIALLY CLOSED in PR #X; rest in PR #Y]` — partial scope shipped, rest scheduled
> - `[IN PROGRESS in PR #X]` — active work
> - `[PLANNED for PR #X]` — scheduled, not started
> - (no marker) — not yet scheduled

---

## Project context

- Stack: .NET 8 + React 18 + TypeScript + PostgreSQL/PostGIS + Docker
- Architecture: Clean Architecture / CQRS / MediatR, multi-tenancy via `X-Tenant-Id` + EF Core query filters
- Production: `agrotech-usa.com`, DigitalOcean droplet `64.226.83.68`
- Demo mode currently open for all — banner "Демо-режим" must remain
- UI language: Ukrainian

---

## ПУНКТ 1 — Корневий маршрут веде на лендинг, а не на login  `[CLOSED in PR #604]`

**Problem:** Opening `https://agrotech-usa.com/` redirected to `/login`. Should be: unauthenticated → AgroHero landing; authenticated → `/dashboard`.

**Shipped:** Root route renders landing for unauthenticated visitors (including public demo mode). `usePublicDemoAutoLogin` skips auto-login on `/`. In-app CTAs trigger login as before.

---

## ПУНКТ 2 — Перемикач періоду на дашборді показує конкретні дати  `[PARTIALLY CLOSED in PR #605, #607; full Season model in PR #612]`

**Problem:** Dashboard buttons `День / Тиждень / Місяць / Сезон` didn't show which period was active.

**Shipped in #605:** `?period=` URL query param on `/dashboard`; monospace label under segmented control shows resolved date range.
**Shipped in #607:** `‹ ›` anchor-date stepping with keyboard shortcuts (`←`/`→`), boundary-aware disable via `/api/tenant/data-boundaries`.
**Remaining for #612:** Full Season model with real StartDate/EndDate per tenant (currently uses hardcoded year-list for season boundaries — silent bug for non-standard crop cycles).

---

## ПУНКТ 3 — Клік по графіку "Фінансовий огляд" → drill-down  `[CLOSED in PR #605, #606]`

**Problem:** Financial chart points were not clickable; could not see what composed a spike.

**Shipped in #605:** Click on chart point navigates to `/economics/costs?from=…&to=…` with RangePicker pre-filled.
**Shipped in #606:** Same pattern for monthly revenue bar chart on `/sales/analytics` → navigates to `/sales`.

---

## ПУНКТ 4 — Прибрати "Бюджет" з sidebar  `[CLOSED in PR #609]`

**Problem:** Budget module has no real business logic; market too volatile.

**Shipped:** Budget hidden via feature flag (default off for new tenants). Code preserved under feature-flag gate. Direct route access returns 404 when flag disabled.

---

## ПУНКТ 5 — Feature flags per tenant + super-admin UI for management  `[CLOSED in PR #609 backend; super-admin UI in PR #610]`

**Problem:** Not every company needs every module. Need per-tenant module toggles.

**Always on (core):** Головна, Виробництво, Склад і логістика, Техніка, Персонал, Фінанси (Витрати, Продажі, Орендні платежі, Зарплата та паливо), Налаштування.

**Optional (per-tenant toggle):**
- `budget`
- `pnl_by_fields`
- `analytics.marginality`, `analytics.season_comparison`, `analytics.break_even`, `analytics.field_efficiency`, `analytics.resource_usage`, `analytics.expense_analytics`, `analytics.sales_analytics`

**Shipped in #609:** `TenantFeatureFlags` table, `IFeatureFlagService` with `IMemoryCache` TTL 60s, `[RequireFeatureFlag]` middleware (returns 404), `FeatureFlagGate` frontend component, `/api/me` payload includes features map.
**Shipped in #610:** Super-admin UI for per-tenant toggles at `/admin/tenants/:id`.
**Technical debt:** Legacy fallback "no records = all enabled" protects existing tenants. Before production has paying clients, backfill explicit flags and switch fallback to "all disabled".

---

## ПУНКТ 6 — Карточка "ВСЬОГО" на /expenses + аудит всіх totals-карток  `[PARTIALLY CLOSED in PR #607; remaining pages pending]`

**Problem:** `/expenses` ВСЬОГО card was empty; similar issue on other pages.

**Shipped in #607:** New `<TotalCard>` shared component with highlight variant. `MaterialKpiCards` refactored to use it. `SalesList.totalRevenue` migrated.
**Remaining:** Verify and migrate totals on `/rent-payments`, `/salary-fuel`, `/pnl-by-fields`. Playwright sweep across all pages with totals cards. May fold into PR #617 demo prep or separate chore PR.

---

## ПУНКТ 7 — Прибрати блок "Витрати план/факт за категоріями" з /expenses  `[CLOSED in PR #603]`

**Shipped:** Plan/Fact card removed from `/expenses`. Code preserved but not rendered.

---

## ПУНКТ 8 — Прибрати light mode, додати selectable currency  `[8.1 CLOSED in PR #604; 8.2 CLOSED in PR #613]`

### 8.1 Light mode  `[CLOSED in PR #604]`
**Shipped:** Sun/Moon toggle removed from topbar; `themeStore` locked to `'dark'`; `ConfigProvider` always uses dark theme.

### 8.2 Currency selector  `[CLOSED in PR #613]`
**Shipped:**
- `UserPreferences.PreferredCurrency` (UAH/USD/EUR, default UAH) — persisted per-user, FK to AspNetUsers
- `ExchangeRate` table with composite PK `(Code, Date)` — global (non-tenant-scoped)
- `NbuCurrencyService` + `NbuDailySyncJob` BackgroundService running at **06:00 Europe/Kyiv**
- Backfill support via `BackfillAsync` (tools backfill script deferred — can reuse endpoint)
- `useFormatCurrency()` hook, Profile → Валюта selector (UAH/USD/EUR)
- Fallback chain: previous-business-day row → last stored rate on NBU failure
- Base currency in DB always UAH; conversion at presentation layer only
- No `rate_at_transaction` added to operation tables (per locked decision)

**Deferred to PR #617:** currency header with NBU rate on export date (CSV/PDF export helpers touch)

---

## ПУНКТ 9 — Кнопка "Прийняти зерно" на /grain-storages  `[PLANNED for PR #615]`

**Problem:** "Прийняти зерно" button does nothing on click.

**Scope:**
- Open modal with full grain receipt form: date, crop, warehouse, batch number (auto-generated), quantity, moisture/trash %, source (field/counterparty), driver/TTN/vehicle
- Validation: quantity > 0, warehouse capacity check, field must be in current season if source = field
- Creates `GrainReceipt` + `GrainBatch` + `GrainBatchPlacement` + `StockLedgerEntry` of type `GrainReceipt`
- Recalculates `StockBalance`
- Known bug from prior audit: verify `TransferGrainHandler` correctly updates `GrainBatchPlacement`

---

## ПУНКТ 10 — Фікс модуля /inventory (Інвентаризація)  `[PLANNED for PR #615]`

**Problem:** Inventory module doesn't work end-to-end. Counted/Difference columns empty, progress shows garbage, session can't be completed.

**Scope — full lifecycle:**
- Session states: `Draft → InProgress → Completed/Cancelled`
- Inline editing of Counted column, auto-calculated Difference with color coding (red/amber/green)
- Comment dropdown: Недостача / Списання / Помилка обліку / Пересорт / Інше
- Progress indicator: `Підраховано X з Y (Z%)` + bar
- Completion creates `StockLedgerEntry` of type `InventoryAdjustment` per non-zero diff
- `StockBalance` cache invalidated after completion
- Cancel flow without ledger changes
- Read-only view after completion
- History list with filters

---

## ПУНКТ 11 — Демо-seed: заповнити дані по всіх модулях  `[PLANNED for PR #617]`

**Problem:** Demo tenant has empty modules (e.g., `/salary-fuel`). Cannot show full functionality to investors.

**Scope:** Idempotent `Tools/DemoSeeder` fills all core + enabled optional modules with connected Ukrainian-realistic data over 6–12 months. Auto-enables all optional feature flags for demo tenant after seed.

**Data coverage requirements:**
- Organization: ТОВ "Демо-Агро" in Poltava region
- Fields: 83 fields (already seeded), add crop rotation for 2024/25/26
- Seasons: 2024 (closed), 2025 (closed), 2026 (active)
- Warehouses: grain storages with batches of wheat/corn/sunflower/rapeseed/soy; inventory items (КАС-32, NPK, seeds, chemicals, fuel, parts)
- Equipment: 15–20 units (John Deere, Case IH, МТЗ, Claas, КамАЗ)
- Personnel: 30–50 employees with real positions and Ukrainian names
- Operations: 300–500 ops linking fields/equipment/operators/stock
- Expenses: all 6 categories populated
- Sales: 8–12 contracts with real traders (Kernel, Nibulon, Bunge)
- Rent payments: 150–300 landholders with contracts and partial payouts
- Salary & fuel: 3–6 months of timesheets and fuel distributions
- Notifications: 10–15 realistic triggers
- API keys: 1–2 demo keys with different scopes

**Idempotency:** Use `tenant.Code = 'DEMO'` and `entity.SeedKey` to prevent duplication on rerun.

---

## ПУНКТ 12 — Центр сповіщень: фікс UI і логіки  `[PLANNED for PR #616]`

**Problem:** Dropdown title renders vertically per letter, time shows "2227h ago" in English, actions may not work, read/unread visually indistinguishable.

**Scope:**
- Dropdown min-width 400px (mobile: full-width bottom sheet)
- Title "Сповіщення · X нових" in one line
- Color border by severity (info=blue, warning=amber, critical=red, success=green)
- Unread indicator dot, read items dimmed 60%
- dayjs `relativeTime` with `uk` locale: `щойно`, `X хв тому`, `X год тому`, `вчора о HH:mm`, `X дн. тому`, `12 берез.`, `DD MMM YYYY`
- Actions: `Прочитати все` (PATCH mark-all-read), `Очистити прочитані` (DELETE read only)
- Click → navigate to `targetUrl` + mark as read
- Hover → individual "×" for single delete
- Dropdown shows first 10, footer link `Усі сповіщення →` leads to `/notifications`
- `/notifications` page: filters (type/status/period), infinite scroll or pagination by 50
- SignalR `NotificationHub` for real-time push, increments badge counter
- **Backend fix:** `NotificationService` currently uses empty Identity Roles tables. Migrate to enum role on `AppUser`; targeting via `NotificationRecipient` table or `target_role` enum with user selection from tenant.
- Triggers to verify working: overdue operation, tech in repair, low fuel, low/over storage, sale completed, fuel issue, background job failure

---

## ПУНКТ 13 — Повний mobile audit і переробка  `[PLANNED for PR #617]`

**Problem:** Mobile version not designed for field use.

**Scope:**
- Playwright audit at 390×844 (iPhone 14) and 360×640 (Android baseline) across all routes
- Screenshots saved to `/audit/mobile/{route-slug}/`
- **AppShell:** sidebar → drawer with overlay, toggled by hamburger, closable by swipe-left or overlay tap. Top bar sticky 56px. Bottom navigation bar (breakpoint <768px) with 5 items: Головна / Поля / Склад / Техніка / Ще
- **Tables → Cards** on mobile: `/fields`, `/tech`, `/operations`, `/grain-storages`, `/grain-batches`, `/expenses`, `/sales`, `/personnel`, `/rent-payments`. Action menu as kebab → bottom sheet.
- **Forms:** full width, `type="number"` with `inputmode="decimal"`, `type="tel"`, `type="date"`, 16px inputs (no iOS zoom), sticky 48px submit button
- **Dashboard:** KPI cards single-column, charts with tap tooltips, Leaflet with larger zoom controls
- **Modals → bottom sheets** on mobile with drag handle
- **Search/filters:** dedicated "Фільтри" button → full-screen panel
- **PWA:** `manifest.webmanifest` with icons (192, 512), theme color `#0a0a0a`. Service worker (Workbox): stale-while-revalidate for assets, cache read-only API (`/api/fields`, `/api/operations?status=active`, `/api/dashboard`) with TTL 5min. Offline banner when no connection.
- **Acceptance:** Lighthouse mobile ≥ 90 (Performance/Accessibility/Best Practices). Install to home screen works on iOS Safari + Android Chrome.

---

## ПУНКТ 14 — Супер-адмін має бути реально супер-адміном  `[FOUNDATION CLOSED in PR #610; CORE advanced (impersonation, /admin/users, /admin/audit-log) IN PROGRESS in PR #614; /admin/system in #614a; /admin/catalogs in #614b; /admin/broadcast in #614c]`

**Problem:** Previous "super-admin" role was tenant-scoped, couldn't see other tenants.

### Foundation  `[CLOSED in PR #610]`
**Shipped:**
- `IsSuperAdmin` boolean on `AppUser` (global, outside tenant roles)
- JWT claim `is_super_admin`, separate claim `mfa_verified`
- `[SuperAdminRequired]` middleware returning 403 + `X-Mfa-Required` header when MFA not set up
- `AdminController` with 5 endpoints, all using `IgnoreQueryFilters()` for cross-tenant access
- TOTP MFA mandatory for super-admin (Otp.NET, 10 BCrypt-hashed backup codes, ±1 step tolerance)
- `SuperAdminAuditLog` table + `SuperAdminAuditService`, entries on every mutation
- Pages: `/admin/tenants`, `/admin/tenants/:id` with Features tab
- 8 integration tests (PR #611)

### Advanced features  `[PLANNED for PR #614]`
**Scope:**
- **Impersonation:**
  - `POST /api/admin/impersonate` with mandatory `reason` field
  - 60min TTL, not renewable
  - Red persistent banner across UI during impersonation
  - Email notification to target user on start
  - Rate limit: 3/day per (admin, target_user) pair
  - Forbidden actions: password/email change, API keys with write scope, billing, full data export
  - Audit: every mutation tagged `impersonated_by` + `acted_as`
- **`/admin/users`** — global search across tenants, impersonate button
- **`/admin/audit-log`** — global view with filters (tenant, user, action type, period), CSV export
- **`/admin/system`** — queue/jobs health, storage usage, active SignalR connections, error rate
- **`/admin/catalogs`** — manage global reference data (crops, equipment types, units, document types)
- **`/admin/broadcast`** — send notifications to all or selected tenants, with history

---

## Notes on execution rules

- Cannot skip ahead in the roadmap order
- Cannot redo closed work
- Decisions in `docs/ROADMAP.md` "Decisions locked" section are final
- Ask in chat before re-interpreting scope
- Each PR: typecheck + tests green before commit; squash-merge to main
- Update `ROADMAP.md` and this file after every merge
