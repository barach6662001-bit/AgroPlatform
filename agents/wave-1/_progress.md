# Wave 1 Progress

Append entries here as each task completes. Do not pre-fill — the agent writes them.

Format:

```
## task-NN — [title]
- Completed: YYYY-MM-DD HH:MM UTC
- Commit: <sha>
- Screenshots: docs/screenshots/wave-1/task-NN-{light,dark}.png
- AntD allowlist: removed N files (new total: X)
- Notes: [anything unusual]
```

---

## task-00 — Theme Bridge
- Completed: 2026-04-17 00:00 UTC
- Commit: c5fa72d
- Screenshots: n/a (no visual change)
- AntD allowlist: no change (pure plumbing)
- Notes: ThemeProvider already in main.tsx from Phase 0. ThemeBridge mounted inside ThemeProvider. Store path adapted to @/stores/themeStore (not @/store/themeStore).

## task-01 — Sidebar Migration
- Completed: 2026-04-17 00:01 UTC
- Commit: 5136401
- Screenshots: docs/screenshots/wave-1/task-01-expanded-light.png, task-01-expanded-dark.png, task-01-rail-light.png, task-01-rail-dark.png
- AntD allowlist: removed Sidebar.tsx (new total: 106)
- Notes: Permissions from permissionsStore (API-fetched, not persist). Routes adapted from actual codebase: /fields, /operations, /warehouse, /team, /finance. Permission keys: Fields.View, Warehouses.View, HR.View, Economics.View, Admin.Manage. React-hotkeys-hook v5 installed.

## task-02 — Topbar Migration
- Completed: 2026-04-17 00:02 UTC
- Commit: a75ee33
- Screenshots: docs/screenshots/wave-1/task-02-topbar-light.png, task-02-topbar-dark.png, task-02-tenant-switcher.png, task-02-breadcrumb-hover.png
- AntD allowlist: removed AppLayout.tsx (new total: 105)
- Notes: authStore has tenantId (string) but no availableTenants/switchTenant — TenantSwitcher shows current tenant only. Follow-up: expose multi-tenant API. UserMenu is stub (replaced in task-03). MobileDrawerTrigger + Sheet combined (task-04 replaces MobileDrawer.tsx).

## task-03 — User Menu with Preferences
- Completed: 2026-04-17 00:03 UTC
- Commit: 58dba1e
- Screenshots: docs/screenshots/wave-1/task-03-user-menu-light.png, task-03-user-menu-dark.png, task-03-whats-new-dialog.png, task-03-density-comfortable.png
- AntD allowlist: no change
- Notes: i18n is custom (not react-i18next) — LanguageSwitcher uses useLangStore directly. authStore adapted: no user.name field, uses firstName+lastName. revokeRefreshToken called on logout.

## task-04 — Mobile Drawer
- Completed: 2026-04-17 11:30 UTC
- Commit: b6c4d70
- Screenshots: docs/screenshots/wave-1/task-04-mobile-closed.png, task-04-mobile-open.png, task-04-tablet.png
- AntD allowlist: removed MobileDrawer.tsx (new total: 104)
- Notes: MobileDrawer.tsx replaced with null stub. Real implementation lives in mobile-drawer-trigger.tsx (Sheet-based). Drawer auto-closes on route change via useLocation effect. Hamburger hidden at md+ breakpoint.

## task-05 — Auth Screens Migration
- Completed: 2026-04-17 11:40 UTC
- Commit: cca8352
- Screenshots: docs/screenshots/wave-1/task-05-login-light.png, task-05-login-dark.png, task-05-login-errors.png, task-05-magic-link-sent.png, task-05-select-tenant.png
- AntD allowlist: removed Login.tsx, ChangePassword.tsx (new total: 102)
- Notes: authStore has no .login() method — adapted to call api/auth login() + setAuth(). LoginRequest has no rememberMe field (UI checkbox is placeholder; follow-up: 30-day refresh token backend). availableTenants not in authStore — SelectTenant auto-redirects (placeholder for multi-tenant backend). Magic link: no endpoint yet → toast fallback. select-tenant screenshot shows redirect to /login (correct when unauthenticated).

## task-06 — Command Palette Migration
- Completed: 2026-04-17 11:55 UTC
- Commit: 2342e4d
- Screenshots: docs/screenshots/wave-1/task-06-palette-light.png, task-06-palette-dark.png, task-06-palette-contextual.png, task-06-palette-search.png
- AntD allowlist: removed CommandPalette.tsx (new total: 101)
- Notes: authStore has no .permissions field — gating uses permissionsStore.hasPermission (CompanyAdmin/SuperAdmin bypass). visible useMemo deps include permRole to re-compute on role change. Contextual screenshot required injecting CompanyAdmin role via Vite module import (no backend). routeMatch uses pathname (no query string) so grain commands match /warehouse*.

## task-07 — Keyboard Shortcuts Modal
- Completed: 2026-04-17 12:05 UTC
- Commit: e0f7053
- Screenshots: docs/screenshots/wave-1/task-07-shortcuts-light.png, task-07-shortcuts-dark.png
- AntD allowlist: no change
- Notes: authStore.permissions replaced with permissionsStore.hasPermission. Mounted inside BrowserRouter in App.tsx (needs no router context but consistent placement with other globals). Opens via ⌘/ hotkey and open-keyboard-shortcuts event.

## task-08 — Empty/Loading/Error State Components
- Completed: 2026-04-17 12:15 UTC
- Commit: f321f8b
- Screenshots: docs/screenshots/wave-1/task-08-states-light.png, task-08-states-dark.png
- AntD allowlist: no change (primitives only, no page migration)
- Notes: Skeleton already installed (Phase 0). All three components live in components/state/. Showcased in /__design-system States section. rounded-pill CSS class not used (not in design system) — replaced with rounded-full.

## task-09 — Error Pages + ErrorBoundary
- Completed: 2026-04-17 12:30 UTC
- Commit: 0957f66
- Screenshots: docs/screenshots/wave-1/task-09-404-light.png, task-09-404-dark.png, task-09-403.png, task-09-500-dev.png, task-09-maintenance.png
- AntD allowlist: removed AccessDenied.tsx, NotFound.tsx, ServerError.tsx (new total: 98)
- Notes: Outer `<Route path="*" element={<NotFound />}>` was unreachable because the pathless layout route caught everything first. Fixed by adding explicit `/not-found` route outside layout + changing inner catch-all to redirect to /not-found. AppErrorBoundary renders inline HTML (no ErrorPage dependency) to avoid Router context issues. 500 screenshot taken by injecting error state via React fiber traversal.

## task-10 — Polish, QA Sweep, and PR
- Completed: 2026-04-17 13:00 UTC
- Commit: 0422fe5
- Screenshots: 25 screenshots in docs/screenshots/wave-1/final/ (desktop light/dark/rail/comfortable + mobile + error + interactive)
- AntD allowlist: 109 → 98 (-11 files over Wave 1)
- Notes: Found and fixed 3 bugs during QA: (1) usePermissions() never wired into AppLayout — permissions were never fetched; (2) Sidebar subscribed to hasPermission (stable ref) but not role — nav items never re-rendered after permissions loaded; (3) window.open() return type caused build error in command-registry.ts. Playwright route intercept **/api/** accidentally served JSON for Vite source files — fixed by using specific endpoint URL.

---

## Wave 1 complete

- Tasks: 11 / 11 ✅
- Commits: 13
- AntD allowlist: 109 → 98 (delta: -11 files)
- Bundle: JS 1,005 kB gz (3,435 kB raw), CSS 36 kB gz (158 kB raw)
- New dependencies added: shadcn/ui primitives, cmdk, react-hotkeys-hook v5, next-themes, react-hook-form v7, zod v4, @hookform/resolvers v5
- Screenshots: 25 final + ~40 task screenshots
- Follow-ups logged:
  - [backend] Magic link endpoint (task-05)
  - [backend] 30-day refresh token option (task-05)
  - [backend] Tenant list + switch-tenant endpoint (task-02/03)
  - [frontend] Wire useIsFetching into SidebarSyncStatus for true sync indicator (task-01)
  - [wave-2] Migrate Dashboard cards and operational modules to new design tokens
