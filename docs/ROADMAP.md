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

---

## In progress

- [ ] **PR #612 — Full Season model** *(TZ 2 remainder)*
  - Replace hardcoded year-list with `Seasons` table (Id, TenantId, Code, Name, StartDate, EndDate, IsCurrent)
  - Data migration: seed 3 default seasons per existing tenant (2023/24, 2024/25, 2025/26)
  - CRUD for super-admin (`/api/admin/tenants/{id}/seasons/*`) and tenant-admin (`/api/seasons/*`)
  - Dashboard: season arrows iterate real Season list, label uses `StartDate/EndDate`
  - Unique constraint: only one `IsCurrent=true` per tenant (partial index)
  - Breaking change to `/api/seasons` response shape — update all frontend consumers in same PR

---

## Upcoming (in order — do not reorder without approval)

- [ ] **PR #613 — Currency system** *(TZ 8.2)*
  - `UserPreferences.PreferredCurrency` (UAH/USD/EUR, default UAH)
  - `ExchangeRate` table (Code, Date, RateToUah), PK (Code, Date)
  - `NbuCurrencyService` + cron 06:00 Kyiv, backfill from 2024-01-01
  - `useFormatCurrency()` hook, settings UI in Профіль → Валюта
  - Fallback: last stored rate on NBU failure; weekend/holiday → previous business day
  - Exports: currency header with NBU rate on export date

- [ ] **PR #614 — Super-admin advanced + impersonation** *(TZ 14 remainder)*
  - Impersonation: 60min TTL, mandatory reason, red banner in UI, email to target user, rate limit 3/day per (admin, target) pair
  - Forbidden actions in impersonation: password/email change, API keys write scope, billing ops, tenant export
  - `/admin/users` global search, impersonate action
  - `/admin/audit-log` global view with filters (tenant, user, action type, period)
  - `/admin/system` (queue/jobs health, storage, connections)
  - `/admin/catalogs` (global reference data: crops, equipment types, units)
  - `/admin/broadcast` (notification to all/selected tenants)

- [ ] **PR #615 — Warehouse: grain receipt + inventory** *(TZ 9, TZ 10)*
  - `/grain-storages` "Прийняти зерно" button: full form, creates GrainReceipt + GrainBatch + GrainBatchPlacement + StockLedgerEntry, recalculates StockBalance
  - Verify `TransferGrainHandler` updates `GrainBatchPlacement` (known bug)
  - `/inventory` full cycle: Draft → InProgress → Completed/Cancelled
  - Inline editing of Counted column, auto-calculated Difference with color coding
  - Progress indicator: "Підраховано X з Y (Z%)"
  - Completion creates `InventoryAdjustment` ledger entries per diff, invalidates `StockBalance` cache
  - Session history with read-only view after completion

- [ ] **PR #616 — Notifications center** *(TZ 12)*
  - Dropdown layout fix (min-width 400px, title inline)
  - dayjs relativeTime with `uk` locale, proper thresholds (`X хв тому`, `X дн. тому`, `12 берез.`, etc.)
  - Mark-all-read, clear-read working
  - Deep-link click → navigates to target + marks read
  - `/notifications` full page with filters (type, status, period), infinite scroll
  - SignalR `NotificationHub` for real-time push
  - Backend fix: `NotificationService` uses empty Identity Roles tables — migrate to enum role on `AppUser`
  - Triggers verified: overdue op, tech repair, low fuel, low/over storage, sale completed, job failure

- [ ] **PR #617 — Demo seeder + Mobile + PWA** *(TZ 11, TZ 13)*
  - `Tools/DemoSeeder` idempotent: fills all core modules with connected Ukrainian-realistic data (6–12 months history)
  - Auto-enables all optional feature flags for demo tenant after seed
  - Mobile audit via Playwright at 390×844 and 360×640 across all routes
  - Drawer sidebar, bottom nav (Головна / Поля / Склад / Техніка / Ще)
  - Tables → Cards on fields, tech, operations, grain-storages, grain-batches, expenses, sales, personnel, rent-payments
  - Forms: proper input types, sticky submit, 48px buttons
  - Modals → bottom sheets on mobile
  - PWA: manifest, service worker (Workbox), stale-while-revalidate assets, offline read-only for cached API data

---

## Decisions locked (do not re-discuss, do not override without explicit approval in chat)

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
- Per-tenant only, no per-user overrides
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
- Dark mode only, light mode removed in PR #604

**Season**
- Real `Seasons` table with `StartDate`/`EndDate`, NOT hardcoded year-list (PR #612)
- Each tenant can have custom seasonal boundaries (crops differ)

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
- **P.6 totals audit incomplete** — PR #607 migrated `/expenses` ВСЬОГО and `/sales` totalRevenue. Other pages not verified: `/rent-payments`, `/salary-fuel`, `/pnl-by-fields`. Schedule as chore PR or fold into PR #617 demo prep.

---

## Agent protocol

When starting a new PR:

1. Read this file and `docs/TZ.md`.
2. Verify `git log --oneline -20` on main matches the "Completed" section here.
3. Start the PR listed under "In progress". Do not skip ahead. Do not redo closed work.
4. If roadmap and codebase disagree, STOP and ask in chat — do not guess.
5. Decisions in "Decisions locked" are final; do not re-discuss.
6. Squash-merge to main with a clean commit message.
7. After merge: update this file — move completed item to "Completed", promote next item from "Upcoming" into "In progress". Update status markers in `docs/TZ.md` for affected points.
8. Commit the roadmap update in the same PR or as first chore commit of the next PR.
