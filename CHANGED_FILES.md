# Phase 3 — Shell + Dashboard premium redesign

Base commit: `c444d2fe1a0b560287589909884ffd1b84131ac4`
Branch (sandbox only, NOT pushed): `shell-dashboard/premium-redesign`

## New files
- `frontend/src/components/EyebrowChip.tsx`
- `frontend/src/components/EyebrowChip.module.css`
- `frontend/src/components/Layout/Breadcrumbs.tsx`
- `frontend/src/components/Layout/Breadcrumbs.module.css`

## Modified files
- `frontend/src/components/Layout/AppLayout.tsx`
- `frontend/src/components/Layout/AppLayout.module.css`
- `frontend/src/components/Layout/Sidebar.module.css`
- `frontend/src/components/Layout/MobileDrawer.module.css`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Dashboard.module.css`

## Untouched (preserved verbatim)
- `frontend/src/components/Layout/Sidebar.tsx`         — all routes, permissions, AntD Menu logic
- `frontend/src/components/Layout/FarmSwitcher.tsx`    — tenant switcher logic
- `frontend/src/components/Layout/NotificationBell.tsx` — notifications API + popover
- `frontend/src/components/Layout/MobileDrawer.tsx`    — drawer wrapper
- All `frontend/src/pages/Dashboard/components/*`
- `frontend/src/i18n/{uk,en}.ts`                       — no key renames; new optional keys (`day`, `week`, `month`, `season`, `newOperation`, `haUnit`, `fieldsUnit`) read with `??` fallbacks so missing keys don't break.
- All stores, services, api/, hooks, router

## Verification
- `npx tsc --noEmit` -> clean
- `npx vitest run src/pages/__tests__/Dashboard.test.tsx src/pages/__tests__/Login.test.tsx` -> 4 passed / 4

## Note on screenshots
Replit sandbox has no .NET backend and no auth bypass, so `/dashboard` and `/fields` cannot be rendered with real data here. Pull `PHASE_3_DIFF.patch` into a local branch with the backend running to verify visually.
