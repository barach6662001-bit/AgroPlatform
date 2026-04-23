# AgroPlatform — roadmap (active)

Living document. Each PR collapses a slice of ТЗ into a shippable unit.

## Completed

- PR #609 (merged as d30972e): tenant optional feature flags + budget gating (ТЗ #13).

## In flight — PR #610: super-admin foundation (ТЗ #14, first half)

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

- PR #611 — multi-tenant DNS / org-level routing.
- PR #612 — billing + plan enforcement.
- PR #613 — super-admin phase 2 (users, audit UI, billing, impersonation).
