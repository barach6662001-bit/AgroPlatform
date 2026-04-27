# AgroPlatform Roadmap

> Living document. Agent updates this after each PR merges.
> For context on individual TZ points, see `docs/TZ.md`.
> For locked architectural decisions, see "Decisions locked" section below.

---

## Completed

- [x] **PR #602** — honest dashboard, removed demo margin fake, Season = all-time
- [x] **PR #603** — removed non-functional Plan/Fact card from /expenses *(TZ 7)*
- [x] **PR #604** — root route `/` → landing page, forced dark-only theme *(TZ 1, 8.1)*
- [x] **PR #605** — dashboard period URL state (`?period=`), resolved date range label, drill-down to Costs *(TZ 2 partial, TZ 3 for costs)*
- [x] **PR #606** — monthly revenue chart drill-down, SalesList URL-state *(TZ 3 for revenue)*
- [x] **PR #607** — `/api/tenant/data-boundaries`, `‹ ›` arrow stepping with keyboard, `<TotalCard>` shared component *(TZ 2 partial, TZ 6 partial)*
- [x] **PR #609** — tenant feature flags, `[RequireFeatureFlag]` middleware, `FeatureFlagGate`, Budget hidden by flag *(TZ 4, TZ 5)*
- [x] **PR #610** — super-admin foundation: `IsSuperAdmin`, JWT claims (`is_super_admin`, `mfa_verified`), TOTP MFA, `AdminController` with `IgnoreQueryFilters()`, `/admin/tenants` + `/admin/tenants/:id` pages, audit log table *(TZ 14 foundation)*
- [x] **PR #611** — super-admin integration tests (8 scenarios), `TestAuthHandler` extended with opt-in headers *(test debt from #610 closed)*
- [x] **PR #612** — full Season model with real StartDate/EndDate, idempotent data seed for existing tenants, tenant-admin + super-admin CRUD, dashboard arrows use real seasons *(TZ 2 remainder)*
- [x] **PR #613** — currency system: `ExchangeRate` table (composite PK), `UserPreferences.PreferredCurrency`, `NbuCurrencyService` with daily 06:00 Kyiv sync + previous-business-day fallback + last-stored-rate on NBU failure, `/api/currency/rates*` + `/api/currency/preferences` endpoints, frontend `useFormatCurrency` hook + Profile selector *(TZ 8.2)*
- [x] **PR #628** — currency refactor completion: migrate 20+ pages from hardcoded ₴/UAH/грн to `useFormatCurrency`/`useCurrencySymbol`/`useConvertFromUah`, dynamic formatUAH, reactive `<Money/>` component. Displayed values now reflect the user's preferred currency everywhere (Dashboard, Economics, Analytics, Sales, Fields, HR, Machinery, Warehouses, GrainStorage) *(TZ 8.2 completion)*
- [x] **PR #631** — **hotfix**: temporarily disable the Profile currency switcher with a tooltip and force-reset any stored non-UAH user preference to UAH on next login. Prevents the mixed-label regression where `/expenses` showed `1000.00 USD` rows alongside `1 000,00 грн` totals *(safety net; blocks #632 until it is solved)*
- [x] **PR #634** — currency conversion v2: rewrite `useFormatCurrency` with the signature `(uahValue, date?)` and proper math (`uah / rateToUah`), null-safe rendering (`—`), warn-once fallback when the rate table is empty; introduce the single-source `<Money/>` component; lock all monetary input addons to hardcoded `₴` (Variant B) and show a "Сума зберігається в гривнях" helper text; unit tests (7 cases) + Playwright regression test for the mixed-label bug. Switcher re-enabled as the last commit. *(TZ 8.2, conversion layer)*
- [x] **PR #616** *(parallel design-system track)* — design-system foundation: TypeScript token source-of-truth, `scripts/build-tokens.ts`, `frontend/src/design-system/tokens/*`, `lightTheme.ts` as deadcode ThemeConfig. Zero breaking changes to existing CSS variable names.
- [x] **PR #614** — Super-admin core: impersonation + global users + audit log *(TZ 14 remainder, core)* — Impersonation engine (`POST /api/admin/impersonate` with 60min TTL, rate-limited 3/24h per admin-target pair, index-backed query on SuperAdminAuditLog), forbidden-action filter (403 + `impersonate.forbidden_attempt` audit), in-app notification to target (severity warning, title "Сесія імперсонації", Ukrainian body with timestamp), `/admin/users` global search + impersonate modal, `/admin/audit-log` filtered view, red persistent non-closable z-index-9999 banner during session. 6 integration tests required / all pass. Merged as PR #640 (commit b029b0c).

---

## In progress

- [ ] **PR #615 — Warehouse: grain receipt + inventory** *(TZ 9, TZ 10)*
  - `/grain-storages` "Прийняти зерно" button: full form (date, crop, warehouse, batch, qty, moisture/trash %, source, driver/TTN), validation (qty>0, warehouse capacity, field in season if source=Field), atomically creates GrainReceipt + GrainBatch + GrainBatchPlacement + StockLedgerEntry, recalculates StockBalance
  - Verify `TransferGrainHandler` updates `GrainBatchPlacement` (known bug)
  - `/inventory` full cycle: Draft → InProgress → Completed/Cancelled, inline Counted editing with auto Difference, color-coded (red/amber/neutral), comment dropdown (Недостача/Списання/etc), progress bar "Підраховано X з Y", completion creates InventoryAdjustment ledger entries, invalidates StockBalance cache, cancellation without ledger changes
  - Integration tests (receipt creates 4 entities, capacity validation, inventory completion ledger, inventory cancellation no-ledger)
  - Playwright e2e (grain receipt form fill+submit)

---

## Upcoming (in order — do not reorder without approval)

- [ ] **PR #616 — Notifications center** *(TZ 12)*
  - Dropdown layout fix (min-width 400px, title inline)
  - dayjs relativeTime with `uk` locale, proper thresholds (`X хв тому`, `X дн. тому`, `12 берез.`, etc.)
  - Mark-all-read, clear-read working
  - Deep-link click → navigates to target + marks read
  - `/notifications` full page with filters (type, status, period), infinite scroll
  - SignalR `NotificationHub` for real-time push
  - Backend fix: `NotificationService` uses empty Identity Roles tables — migrate to enum role on `AppUser`
  - Triggers verified: overdue op, tech repair, low fuel, low/over storage, sale completed, job failure

- [ ] **PR #617 — Export currency header** *(TZ 8.2 follow-up)*
  - Add NBU rate on export date to CSV/PDF export headers where currency amounts appear (costs, revenue, grain)
  - Tied to existing export helpers; deferred from PR #613 to keep that PR reviewable

- [ ] **PR #618 — Demo seeder + Mobile + PWA** *(TZ 11, TZ 13)*
  - `Tools/DemoSeeder` idempotent: fills all core modules with connected Ukrainian-realistic data (6–12 months history)
  - Auto-enables all optional feature flags for demo tenant after seed
  - Mobile audit via Playwright at 390×844 and 360×640 across all routes
  - Drawer sidebar, bottom nav (Головна / Поля / Склад / Техніка / Ще)
  - Tables → Cards on fields, tech, operations, grain-storages, grain-batches, expenses, sales, personnel, rent-payments
  - Forms: proper input types, sticky submit, 48px buttons
  - Modals → bottom sheets on mobile
  - PWA: manifest, service worker (Workbox), stale-while-revalidate assets, offline read-only for cached API data

> PR numbers after #613 may shift if parallel design-system or infra PRs take intermediate numbers from GitHub. That's expected; the feature order (Currency → Super-admin advanced → Warehouse → Notifications → Demo + Mobile) is what matters.

---

## Deferred (post-core, before Phase B)

These are super-admin follow-ups that depend on PR #614 core being stable. They will ship after warehouse/notifications/demo work.

- [ ] **PR #614a — Super-admin: system health page** *(TZ 14 follow-up)*
  - `/admin/system` page (read-only dashboard)
  - Backend: `GET /api/admin/system/health` aggregates Hangfire queue depth + failed-jobs count, DB connection pool usage, storage volume usage, active SignalR connections (when notification hub lands), background-job last-run-at per recurring job
  - Auto-refresh every 30s, severity colours (green/amber/red) per metric
  - CSV export added to `/admin/audit-log` here as well

- [ ] **PR #614b — Super-admin: global catalogs CRUD** *(TZ 14 follow-up)*
  - `/admin/catalogs` page with tabs: Crops, Equipment types, Units, Document types
  - Global reference data is shared across all tenants — soft-delete only (existing tenant data must keep referencing the row)
  - Backend: `/api/admin/catalogs/{type}` CRUD with audit on every mutation (`catalog.crop.create`, etc.), validation that a row in use cannot be hard-deleted
  - Bulk import CSV (deferred until concrete request)

- [ ] **PR #614c — Super-admin: broadcast notifications** *(TZ 14 follow-up)*
  - `/admin/broadcast` page: composer (title, body, severity) + audience picker (all tenants / selected tenants / by feature flag)
  - Backend: `POST /api/admin/broadcast` fans out to `Notification` rows per target tenant; rate-limited to 1 broadcast per minute per super-admin
  - History view of past broadcasts with reach count per broadcast
  - Depends on Notifications fixes in PR #617 (per-user routing) — order: ship #614a, then #617, then #614b/c

---

## Decisions locked (do not re-discuss, do not override silently — even in deadcode or scaffolding)

**Currency**
- NBU JSON API: `https://bank.gov.ua/NBU_Exchange/exchange_site?start=YYYYMMDD&end=YYYYMMDD&valcode=USD&json` (and EUR)
- Base currency in DB is always UAH
- Conversion happens at presentation layer only
- `ExchangeRate (Code, Date, RateToUah)` with PK (Code, Date)
- Do NOT add `rate_at_transaction` to operation tables in this phase
- Weekend/holiday: fallback to previous business day's rate
- NBU unavailable: use last stored rate + log Warning

**2FA**
- TOTP only (Otp.NET backend, otplib+qrcode frontend)
- No SMS, no email codes
- Mandatory for `IsSuperAdmin=true` accounts
- Optional for regular users, toggle in Налаштування → Безпека
- 10 single-use BCrypt-hashed backup codes
- Recovery on exhausted backup codes: manual reset by another super-admin with audit entry

**Impersonation**
- Full login-as, NOT view-only
- Red persistent banner across entire UI, not dismissable, z-index 9999
- 60min TTL, not renewable — must start new session
- Mandatory `reason` field (min 10 chars, free text)
- Email notification sent to target user on start
- Audit log: every mutation tagged with `impersonated_by` + `acted_as`
- Forbidden actions in impersonation: password change, email change, account deletion, API keys write scope, billing, full data export
- Rate limit: 3 sessions per (admin, target_user) per 24h
- ToS clause required for tenants

**Feature flags**
- Per-tenant only, no per-user overrides, no beta testers list
- Hardcoded enum of flag keys in code (not user-defined)
- `TenantFeatureFlags (TenantId, FeatureKey, IsEnabled, UpdatedAt, UpdatedBy)`
- IMemoryCache TTL 60s, invalidate on write
- Disabled flag on sidebar → menu item NOT rendered (not grayed out)
- Disabled flag on route → 404 (not 403, don't reveal feature existence)

**Optional flag keys (these are the ones gated per tenant):**
```
budget
pnl_by_fields
analytics.marginality
analytics.season_comparison
analytics.break_even
analytics.field_efficiency
analytics.resource_usage
analytics.expense_analytics
analytics.sales_analytics
```

**Core modules — always on, never gated:**
- Головна, Виробництво, Склад і логістика, Техніка, Персонал
- Фінанси: Витрати, Продажі, Орендні платежі, Зарплата та паливо
- Налаштування

**Theme**
- **Dark mode only in product UI.** Light mode was removed from the user-facing UI in PR #604 (no topbar toggle, no settings toggle, `themeStore` locked to `'dark'`, `ConfigProvider` always uses `darkTheme`).
- `frontend/src/theme/lightTheme.ts` exists as **deadcode** after PR #616 design-system refactor. It is NOT imported anywhere in product UI and MUST NOT be wired into `ConfigProvider`, a topbar toggle, or a settings toggle.
- Reviving light mode in product UI requires explicit discussion in chat and amending this section. Do not silently wire `lightTheme` into any user-facing code path from any PR (design-system, infra, or feature).

**Season**
- Real `Seasons` table with `StartDate`/`EndDate` per tenant (PR #612), not year-list
- Each tenant can have custom seasonal boundaries (crops differ)
- Partial unique index enforces one `IsCurrent=true` per tenant at DB level
- CHECK constraint `EndDate > StartDate` at DB level

---

## Deferred / cut from roadmap

- **Billing module** — no monetization yet, no payment integration planned. Feature flags already demonstrate tenant-level plan differentiation. Revisit post-roadmap.
- **Per-user feature flags / beta testers list** — not this phase. Current stage is product stability, not A/B infrastructure.
- **`rate_at_transaction` on operations** — only Sales/PurchaseContracts will need frozen rates eventually, not all operations. Defer until concrete business case.

---

## Technical debt (to schedule)

- **Feature flags legacy fallback**: current behavior is "no records = all enabled" (protects existing tenants from PR #609 migration). Before prod has paying clients: run backfill to write explicit `IsEnabled=true` for all tenants, then switch fallback to "no records = all disabled".
- **MailKit 4.15.1** — moderate severity CVE (`GHSA-9j88-vvj5-vhgr`). Upgrade to latest in a chore PR.
- **`.gitignore` has `.mcp.json` listed 3 times** — cosmetic, clean up when touching the file next.
- **P.6 totals audit incomplete** — PR #607 migrated `/expenses` ВСЬОГО and `/sales` totalRevenue. Other pages not verified: `/rent-payments`, `/salary-fuel`, `/pnl-by-fields`. Schedule as chore PR or fold into PR #618 demo prep.
- **Season force-delete dual code path** — `SeasonsController.Delete` accepts super-admin `?force=true` and soft-deletes without audit emission; `AdminController` already has a proper audited season CRUD. Remove the `force && IsSuperAdmin` branch from `SeasonsController.Delete` so super-admin force-delete is only reachable via `AdminController` (which audits via `ISuperAdminAuditService`). Small chore PR, schedule after PR #613.
- **`lightTheme.ts` deadcode** — exists after PR #616 but not imported anywhere. Either document intent clearly in the file's top comment ("intentional placeholder, not wired into product UI") or delete. Revisit when design-system PRs stabilise.

---

## Agent protocol

When starting a new PR:

1. Read this file and `docs/TZ.md`.
2. Verify `git log --oneline -20` on main matches the "Completed" section here.
3. Start the PR listed under "In progress". Do not skip ahead. Do not redo closed work.
4. If roadmap and codebase disagree, STOP and ask in chat — do not guess.
5. Decisions in "Decisions locked" are final; do not re-discuss, do not override silently (even in deadcode or scaffolding).
6. Squash-merge to main with a clean commit message.
7. After merge: update this file — move completed item to "Completed", promote next item from "Upcoming" into "In progress". Update status markers in `docs/TZ.md` for affected points.
8. Commit the roadmap update in the same PR or as first chore commit of the next PR.

### Parallel tracks (design-system, infra chores)

Design-system and infra PRs can run in parallel with feature PRs from the "Upcoming" list. Rules:

- Parallel-track PRs are numbered by GitHub independently; after merge, add them to the "Completed" section with a `(parallel … track)` tag but do NOT promote the next item from "Upcoming" — that's only for feature PRs.
- Parallel-track PRs MUST NOT violate "Decisions locked" even in deadcode or scaffolding. If a parallel PR needs to touch a locked area (add back a theme toggle, add SMS 2FA, add per-user feature flags, etc.), the author MUST ask in chat first.
- If a parallel-track PR and a feature PR touch the same file, the feature PR rebases on main after the parallel PR merges.
- Do not reorder the "Upcoming" feature list because of parallel work.
