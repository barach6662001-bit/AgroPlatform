# Task 10 — Polish, Playwright QA, and Pull Request

**Goal:** Full QA sweep. Fix any visual regressions. Measure bundle impact. Open the PR.

**Depends on:** tasks 00–09 all complete

---

## Step 1 — Full Playwright sweep

For each screen in both **light and dark** themes AND both **compact and comfortable** densities, open Playwright (via MCP) and take a screenshot. Save to `docs/screenshots/wave-1/final/`.

Screens to capture:

| Screen | Viewport | Filename |
|---|---|---|
| Dashboard (expanded sidebar, compact) | 1440 | final-dashboard-compact-light.png, ...-dark.png |
| Dashboard (comfortable) | 1440 | final-dashboard-comfortable-light.png, ...-dark.png |
| Dashboard (rail) | 1440 | final-dashboard-rail-light.png, ...-dark.png |
| Warehouses/Grain | 1440 | final-grain-light.png, ...-dark.png |
| Employees | 1440 | final-employees-light.png, ...-dark.png |
| Payments | 1440 | final-payments-light.png, ...-dark.png |
| Login | 1440 | final-login-light.png, ...-dark.png |
| Select tenant | 1440 | final-select-tenant.png |
| Command palette (on /warehouses/grain) | 1440 | final-palette-contextual.png |
| Keyboard shortcuts modal | 1440 | final-shortcuts.png |
| User menu open | 1440 | final-user-menu.png |
| Tenant switcher open | 1440 | final-tenant-switcher.png |
| What's new dialog | 1440 | final-whats-new.png |
| 404 | 1440 | final-404.png |
| 500 (dev mode) | 1440 | final-500.png |
| Mobile — dashboard drawer closed | 375 | final-mobile-closed.png |
| Mobile — dashboard drawer open | 375 | final-mobile-open.png |
| Mobile — login | 375 | final-mobile-login.png |

Target: **~30 screenshots**.

---

## Step 2 — Visual regression check

For each screenshot, verify:

- [ ] No AntD default blue anywhere (unless a page still uses unmigrated AntD components — that's expected, log which ones)
- [ ] All text readable in both themes
- [ ] Focus rings visible on interactive elements (`:focus-visible`)
- [ ] No horizontal scroll at any viewport
- [ ] Sidebar rail doesn't clip tooltips
- [ ] Breadcrumb hovercard positions correctly
- [ ] Command palette is centered, max-h respected
- [ ] Modal dialogs have proper overlay + backdrop blur
- [ ] Form inputs align visually (labels left-aligned, consistent spacing)
- [ ] Empty / loading / error states visible where triggered
- [ ] Mobile drawer slides smoothly

If any fail → write a fix and commit. This is the polish step; expect 3-5 small commits here.

---

## Step 3 — Functional sweep

Run through each flow from `USER_FLOWS.md`:

- [ ] Flow 1: Sidebar collapse (click + `[` shortcut) — persists across reload
- [ ] Flow 2: Navigate by click, arrow keys, sequence shortcut `G D`
- [ ] Flow 3: Tenant switch — popover, recent pinned, toast, navigate
- [ ] Flow 4: Theme change — all 3 modes, persists
- [ ] Flow 5: Density change — table rows resize live
- [ ] Flow 6: Login — wrong creds → toast; right → dashboard
- [ ] Flow 7: Magic link — fires request, toast on 404/501
- [ ] Flow 8: SSO — toast placeholder
- [ ] Flow 9: Multi-tenant user → /select-tenant after login
- [ ] Flow 10: ⌘K opens palette from anywhere
- [ ] Flow 11: Execute command → navigates + prepends to recent
- [ ] Flow 12: ⌘/ opens shortcuts modal
- [ ] Flow 13: Sequence `G W` → navigates to warehouses with feedback toast
- [ ] Flow 14: Sync dot (pull network cable → dot goes red)
- [ ] Flow 15: What's new → opens dialog → badge disappears after close
- [ ] Flow 16: Breadcrumb hover → sibling list appears
- [ ] Flow 17: Sign out → /login + toast
- [ ] Flow 18: /nonexistent → 404; throw error → 500

---

## Step 4 — Bundle size + build health

```bash
cd frontend
npm run build 2>&1 | tee /tmp/build.log
```

Record:
- **Before Phase 0 → After Phase 0 → After Wave 1** bundle sizes (JS + CSS)
- Any warnings from Vite
- tree-shake check: AntD should still appear in bundle (it's used by unmigrated pages) but **should not be imported by any Wave-1 file**

```bash
cd frontend
# Quick sanity check: AntD should NOT appear in new shell code
grep -r "from 'antd'" src/components/shell/ src/components/error/ src/components/state/ \
  src/components/auth/ src/lib/ src/hooks/ src/store/ 2>/dev/null
# expect: empty
```

---

## Step 5 — Type check + lint

```bash
cd frontend
npx tsc --noEmit 2>&1 | tail -20
npm run lint 2>&1 | tail -20
```

Both should exit clean. If there are pre-existing errors from unmigrated AntD pages, those are out of scope — log them as follow-ups.

---

## Step 6 — ESLint allowlist shrinkage

Verify `.eslint-antd-allowlist.txt` has shrunk by at least 8 entries. List the files removed in the PR description.

```bash
cd frontend
# Current allowlist count
wc -l .eslint-antd-allowlist.txt
# Files that should have been removed:
#   components/Layout/Sidebar.tsx (task-01)
#   components/Layout/AppLayout.tsx (task-02)
#   components/Layout/MobileDrawer.tsx (task-04)
#   pages/Login.tsx (task-05)
#   pages/ChangePassword.tsx (task-05, if existed)
#   components/CommandPalette.tsx (task-06)
#   + any other files migrated incidentally
```

---

## Step 7 — Update `_progress.md` with final summary

Append a "Wave 1 complete" section:

```md
## Wave 1 complete

- Tasks: 11 / 11 ✅
- Commits: <N>
- AntD allowlist: <before> → <after> (delta: -<N>)
- Bundle: JS <before>kB → <after>kB (Δ <+/->)
         CSS <before>kB → <after>kB (Δ <+/->)
- New dependencies added: <list>
- Screenshots: <count>
- Follow-ups logged:
  - [backend] Magic link endpoint (task-05)
  - [backend] 30-day refresh token option (task-05)
  - [backend] Tenant list endpoint (task-03 / task-02)
  - [frontend] react-query isFetching integration into SidebarSyncStatus (task-01)
  - <any others surfaced during execution>
```

---

## Step 8 — Open PR

```bash
cd /workspaces/AgroPlatform
git push origin feat/full-redesign-v2

gh pr create \
  --base main \
  --head feat/full-redesign-v2 \
  --title "feat(shell): Wave 1 — Palantir-grade app shell" \
  --body "$(cat <<'EOF'
## Summary

Wave 1 of the full-redesign-v2 initiative. Migrates the app shell from AntD to shadcn/ui + Tailwind, matching the Palantir/Linear density and polish baseline.

## What changed

### Primary shell
- **Sidebar** rebuilt on Tailwind, collapsible to 48px rail mode, grouped nav (Overview/Operations/People/Finance/Settings), live sync status dot, `[` shortcut to collapse, middle-click opens in new tab
- **Topbar** with tenant switcher (with role context + recent), context-aware breadcrumbs (hover preview of siblings), global search trigger, notifications bell, theme toggle, user menu
- **User menu** with inline Appearance / Density / Language controls, What's new dialog, Keyboard shortcuts link
- **Mobile drawer** on shadcn Sheet, auto-closes on route change

### Auth
- **Login** rebuilt with RHF + zod, 30-day remember-me, magic link (graceful fallback if backend not ready), SSO placeholder
- **Select tenant** page for multi-tenant users
- **Change password** rebuilt with match validation

### Interactive
- **Command palette** on cmdk with contextual + recent sections, Linear-style `G D` / `N B` sequence shortcuts
- **Keyboard shortcuts modal** (⌘/) auto-populated from command registry

### Infrastructure
- **Theme bridge** syncs next-themes ↔ legacy themeStore
- **Preferences store** (Zustand + persist) for sidebar collapse + density
- **Command registry** + **nav registry** as single sources of truth
- **State primitives** (EmptyState, LoadingState, ErrorState)
- **Error pages** (404, 403, 500, maintenance) + React ErrorBoundary

## Metrics

| | Before | After | Δ |
|---|---|---|---|
| AntD allowlist | <X> files | <Y> files | -<N> |
| JS bundle (gzipped) | <X> kB | <Y> kB | <Δ> |
| CSS bundle (gzipped) | <X> kB | <Y> kB | <Δ> |

## Screenshots

See `docs/screenshots/wave-1/final/` — 30 screenshots covering all major flows in light + dark at desktop + mobile viewports.

## Follow-ups (for subsequent waves or backend)

- [ ] Backend: Magic link endpoint
- [ ] Backend: 30-day refresh token option on login
- [ ] Backend: Tenant list + switch-tenant endpoints (if not already present)
- [ ] Frontend: Wire `useIsFetching` from react-query into SidebarSyncStatus for true sync indication
- [ ] Wave 2: Migrate Warehouses / Grain module to new design + wire State primitives
- [ ] Wave 2: Migrate Dashboard cards to new tokens

## How to test

1. Check out this branch
2. `cd frontend && npm install && npm run dev`
3. Walk through USER_FLOWS.md — every flow is listed and should work
4. Open `/__design-system` to see every primitive

## Known trade-offs

- The topbar `TenantSwitcher` and `UserMenu` assume shapes on `authStore` (`currentTenant`, `availableTenants`, `permissions`). If any of these don't exist, the component renders a degraded (but not broken) version. Fix in Wave 2 once backend shape is confirmed.
- `useIsFetching` integration in `SidebarSyncStatus` is stubbed — the dot shows online/offline only, not true sync state.
- Pages unmigrated from AntD (Dashboard cards, operational modules) still render AntD styling inside the new shell. Wave 2 handles this.

EOF
)"
```

---

## Step 9 — Final report

At the end of the run, post a concise summary message (for the human operator) listing:
- PR URL
- Bundle delta
- Top 5 follow-ups
- Recommendation for Wave 2 scope

---

## Acceptance criteria

- [ ] All 30 screenshots captured and committed
- [ ] Every flow in USER_FLOWS.md manually verified
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `tsc --noEmit` passes (or pre-existing errors logged as out-of-scope)
- [ ] Bundle size logged
- [ ] AntD allowlist shrunk ≥ 8 entries
- [ ] `_progress.md` has "Wave 1 complete" summary
- [ ] PR opened against main
- [ ] Report posted with summary

---

## Git (final polish commit)

```bash
git add docs/screenshots/wave-1/final/ \
        agents/wave-1/_progress.md \
        frontend/

git commit -m "chore(shell): wave 1 final polish + screenshots

- captured 30 screenshots across viewports + themes + densities
- visual regression fixes: [list anything fixed here]
- final AntD allowlist count: <N>
- bundle delta: [list]

Task: wave-1/task-10"
git push
```
