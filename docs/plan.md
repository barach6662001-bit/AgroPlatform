# AgroPlatform — roadmap (active)

Living document. Each PR collapses a slice of ТЗ into a shippable unit.

## Completed

- PR #609 (merged as d30972e): tenant optional feature flags + budget gating (ТЗ #13).
- PR #610 (merged as d208689): super-admin foundation — TOTP MFA, audit log, tenant admin UI (ТЗ #14, first half).
- PR #611 (merged as d358a24): integration tests for super-admin auth + MFA + audit.

## In flight — PR #612: Season model (ТЗ #2, completes dashboard seasonal scope)

Branch: `pr612-season-model`.

### Why now

Dashboard seasonal UI (PR #605/#607) currently uses a year-list derived from operation/cost/sale timestamps. This is semantically wrong for farms with non-calendar crop cycles (Ukraine convention: Aug 1 → Jul 31). Users see "Season 2025" rather than "Сезон 2025/2026: 1 серп. 2025 — 31 лип. 2026", and `‹ ›` navigation steps by integer year, not by real season. This PR promotes Season to a first-class, tenant-configurable entity.

### Backend

1. Domain entity `Season : AuditableEntity` with Code(16), Name(100), StartDate, EndDate, IsCurrent.
2. Migration `AddSeasons`:
   - Table + unique `(TenantId, Code)` + CHECK `EndDate > StartDate` + partial unique for `IsCurrent = true` per tenant.
   - Idempotent data seed: for each existing tenant, create `Сезон 2023/2024`, `Сезон 2024/2025`, `Сезон 2025/2026` (current) if no seasons exist.
3. `/api/seasons` response shape changes from `int[]` → `SeasonDto[]` (breaking; one frontend consumer).
4. Tenant-scoped CRUD at `/api/seasons` (GET list, GET current, POST, PUT, DELETE, POST set-current). Admin-only for mutations.
5. Super-admin CRUD at `/api/admin/tenants/{id}/seasons` — `[SuperAdminRequired]`, audited via `ISuperAdminAuditService`.
6. `SetCurrent` is transactional (flips IsCurrent for the tenant).
7. `Delete` safety net: rejects when cost / sale / operation rows fall inside the season's date window.

### Frontend

1. Types + `useTenantSeasons` hook return `SeasonDto[]`.
2. Dashboard arrow navigation iterates through `SeasonDto[]` by StartDate, labels use real dates (`"Сезон 2025/2026: 1 серп. 2025 — 31 лип. 2026"`).
3. New `/settings/seasons` for tenant admin (table + modals).
4. New `/admin/tenants/:id/seasons` mirror for super-admin.
5. i18n keys added to `uk.ts` + `en.ts`.

### Tests (mandatory)

1. Migration idempotency (run twice, no duplicates).
2. SetCurrent transactional (exactly one IsCurrent after flip).
3. Delete safety — blocked with linked data.
4. `GET /api/seasons` as tenant-admin returns only own tenant's rows.
5. Super-admin `POST /set-current` → 200 + exactly one new `SuperAdminAuditLog`.
6. Same endpoint without super-admin claim → 403.

### Out of scope

- Tying AgroOperation/CostRecord/Sale rows to a `SeasonId` FK (separate PR — backfill strategy).
- Per-crop cycle overrides.
- E2E dashboard scroll test (deferred — no Playwright pipeline in CI today).

### Deployment note

Data migration auto-seeds 3 default seasons (Aug–Jul boundaries) for existing tenants. Review and adjust per tenant before PR #613 (planned: currency + historical FX), which will rely on accurate season boundaries for annual reports.

## Archived — PR #610 scope (super-admin foundation, first half)

Branch: `pr610-super-admin-foundation`. Single PR as agreed (no split).

### Strategy

Coexistence with the existing role-based super-admin:

- Existing `UserRole.SuperAdmin` (enum value 0) remains untouched. Pages at `/superadmin/*` (ControlCenter, CompaniesPage, CompanyUsersPage, IntegrationsPage) are preserved.
- New additive boolean flag `AppUser.IsSuperAdmin` is the new source of truth for platform-level privileges.
- `ICurrentUserService.IsSuperAdmin` returns `true` when either `Role == UserRole.SuperAdmin` **or** the new flag is set (read from the JWT `is_super_admin` claim).
- The DataSeeder’s super-admin seed sets both `Role = SuperAdmin` and `IsSuperAdmin = true` so there is a single canonical user.
- New pages live under `/admin/*` — distinct from the legacy `/superadmin/*`. Sidebar shows two separate entries so existing workflows are not disrupted.

### Backend

1. Domain
   - `AppUser.IsSuperAdmin : bool` (NOT NULL DEFAULT FALSE).
   - `UserMfaSettings { UserId (PK, FK→AspNetUsers), SecretKey varchar(32), IsEnabled bool, BackupCodes jsonb (hashed), EnabledAt timestamptz? }`.
   - `SuperAdminAuditLog { Id, AdminUserId, Action varchar(100), TargetType varchar(50)?, TargetId varchar(100)?, Before jsonb?, After jsonb?, IpAddress varchar(64)?, UserAgent varchar(512)?, OccurredAt timestamptz }`.
2. EF configurations (`UserMfaSettingsConfiguration`, `SuperAdminAuditLogConfiguration`) — neither entity is tenant-filtered.
3. Single migration `AddSuperAdminFoundation`.
4. `IAppDbContext` + `AppDbContext` + unit `TestDbContext` pick up new `DbSet`s.
5. `JwtTokenService.GenerateToken` emits additional claims: `is_super_admin`, `mfa_enabled`. New overload `GenerateMfaPendingToken(userId)` produces short-lived (5 min) token with `scope=mfa_pending`.
6. `CurrentUserService.IsSuperAdmin` ORs in `is_super_admin=true` claim.
7. `[SuperAdminRequired]` attribute backed by `SuperAdminRequiredFilter` returning 403 when the claim is missing.
8. `ISuperAdminAuditService.LogAsync(action, targetType, targetId, before, after, ct)` — writes with current `HttpContext` IP + UA. Registered as scoped.
9. MFA stack (`Otp.NET`):
   - `IMfaService`: `GenerateSecret()`, `GetOtpAuthUri(secret, email)`, `VerifyTotp(secret, code)`, `GenerateBackupCodes()` → (plaintext, hashed), `VerifyBackupCode(storedHashed, input)`.
   - Backup codes hashed with BCrypt (reusing `BCrypt.Net-Next`). Consumed codes are removed from the stored JSON.
10. Auth endpoints (all under `/api/auth`):
    - `POST /mfa/setup` (Authorized) — for a super-admin without MFA: generates secret, returns QR URI + secret.
    - `POST /mfa/enable` (Authorized) — verifies 6-digit code, persists `IsEnabled=true`, returns 10 plaintext backup codes once.
    - `POST /mfa/verify` (AllowAnonymous) — accepts `mfa_pending` token + code/backupCode, returns final JWT.
    - `POST /mfa/regenerate-backup-codes` (Authorized) — invalidates old set, returns 10 new plaintext codes.
    - `LoginHandler` detects super-admin with enabled MFA: returns 200 with `{ mfaRequired: true, mfaPendingToken, expiresAt }` **instead of** the final JWT.
11. `AdminController` under `/api/admin` — every endpoint decorated with `[SuperAdminRequired]`; all queries call `IgnoreQueryFilters()`:
    - `GET /tenants?search=&page=&pageSize=` — paginated list with `userCount`, `fieldCount`, `totalHectares`, `status`, `createdAt`, `lastActiveAt`.
    - `GET /tenants/{id}` — single tenant detail (same fields + enabled features summary).
    - `GET /tenants/{id}/features` — per-flag `{ key, isEnabled }`.
    - `PUT /tenants/{id}/features` — bulk update with audit log entry (before/after). Invalidates the feature-flag cache.
    - `GET /audit-log?page=&pageSize=` — skeleton (UI in PR #613).
12. `DataSeeder.SeedSuperAdminAsync`: on create **and** on existing user, sets `IsSuperAdmin = true`.
13. `MeController`: returns `isSuperAdmin`, `mfaEnabled`, `mfaRequired` so the SPA can branch.

### Frontend

1. `api/me.ts` types — add `isSuperAdmin`, `mfaEnabled`, `mfaRequired`.
2. `authStore` — expose `isSuperAdmin` booleana. Login flow: if response includes `mfaRequired`, persist the intermediate token and redirect to `/mfa-verify`.
3. Sidebar: new top-level item **«Адмін»** visible only when `isSuperAdmin` and MFA is active — route `/admin` (redirects to `/admin/tenants`). Existing `/superadmin/*` item preserved unchanged.
4. Pages:
   - `/admin/tenants` — Ant Design `Table` with columns matching API; search input; pagination; bulk-row-selection + dropdown **«Увімкнути фічу»**.
   - `/admin/tenants/:id` — two tabs: **Огляд** (static metadata) + **Features** (toggle per flag, «Зберегти» → bulk PUT).
   - `/setup-mfa` — shows QR (SVG via new `qrcode` dependency) + secret + code input → on success displays 10 backup codes once.
   - `/mfa-verify` — 6-digit input **or** backup code, POSTs to `/api/auth/mfa/verify`.
5. Route guard: super-admins without MFA are redirected from `/admin/*` to `/setup-mfa`.
6. i18n: all new strings added to both `uk.ts` and `en.ts`; Ukrainian remains primary.

### Tests (mandatory — 5 scenarios)

1. Non-super-admin → `/api/admin/tenants` → **403**.
2. Super-admin without MFA hits `/api/admin/*` → **redirect/response signal** requiring MFA setup (we return 403 with `X-Mfa-Required: true` header; SPA redirects to `/setup-mfa`).
3. Super-admin with MFA + valid JWT → **200** and the returned list contains tenants across multiple tenant ids (verifies `IgnoreQueryFilters`).
4. Super-admin flips a feature flag → `SuperAdminAuditLog` row exists with populated `Before`/`After` JSON.
5. Super-admin enables MFA → can sign in with TOTP → can sign in with a backup code → the **same backup code cannot be reused** (second attempt returns 401).

### Out of scope (moves to PR #613)

- Users / Audit / Billing tabs on the tenant detail page.
- Audit-log UI.
- Impersonation.
- 2FA for non-super-admin users (the data model supports it — UI toggle in Settings → Безпека will land later).

### Safety rails

- Super-admin is seeded **only when `SuperAdmin:Email` + `SuperAdmin:Password` are configured**. Never auto-created in production migrations.
- `.mcp.json` remains gitignored.
- `npm install` run inside `frontend/` whenever `frontend/package.json` changes; lockfile committed in the same commit.

## Upcoming

- PR #613 — currency + historical FX (depends on Season boundaries from #612).
- PR #614 — super-admin phase 2 (users, audit UI, impersonation).
- PR #615 — tie `SeasonId` FK onto AgroOperation / CostRecord / Sale (depends on #612). Backfill by date-range.
- Post-roadmap (no firm need yet) — multi-tenant DNS / org-level routing; billing + plan enforcement. Feature flags already demonstrate plan differentiation; billing deferred until monetization is a concrete goal.
