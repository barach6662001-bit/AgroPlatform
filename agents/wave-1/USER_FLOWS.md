# Wave 1 User Flows — Interaction Contracts

What triggers what. What state changes. What toast fires. What URL changes.

This document is the complement to `WIREFRAMES.md`. Wireframes describe "what it looks like", this describes "what happens when you touch it".

---

## Flow 1: Sidebar collapse

- **Trigger:** Click `[◀ Collapse]` button OR `Cmd/Ctrl + [`
- **State change:** `preferencesStore.sidebarCollapsed` toggled
- **Persistence:** localStorage via Zustand middleware (already set up)
- **Animation:** width transition 200ms ease-out; labels fade out at 100ms
- **Layout:** main content max-width recalculates; no reflow of internal content

---

## Flow 2: Sidebar item navigation

- **Trigger:** Click on item, OR `↑↓` arrow + `⏎`, OR keyboard shortcut like `G D`
- **URL change:** navigate via react-router `navigate(href)`
- **State:** active state detected by `useLocation()` + href prefix match
- **New tab:** middle-click OR `Cmd/Ctrl + click` → `window.open(href, '_blank')`
- **Rail mode + group with children:** click opens Popover submenu (right side of item, 8px gap); Enter while on parent → navigate to parent's default child

---

## Flow 3: Tenant switch

- **Trigger:** Click tenant name in topbar OR `⌘K` → type tenant name → Enter
- **Popover opens:** focused on search input
- **Data source:** `GET /api/tenants/mine` (existing endpoint if present; if not, use whatever returns user's tenants; fallback: single hardcoded tenant)
- **Select tenant:**
  1. `PUT /api/auth/switch-tenant` with `{tenantId}` (or equivalent — check existing impl)
  2. On success: update `authStore.currentTenant`
  3. Prepend this tenant to `tenant-history` in localStorage (cap at 10)
  4. Navigate to `/t/{tenant-slug}/dashboard` (or just `/dashboard` if routing not multi-tenant yet)
  5. Toast: `toast.success("Switched to {tenant name}")`
  6. Close popover
- **No permission to switch:** show toast error, don't navigate

---

## Flow 4: User menu — theme change

- **Trigger:** User menu → Appearance → Light / Dark / System
- **State:** `setTheme(value)` from next-themes
- **Also updates:** `themeStore.theme` via bridge (task-00)
- **Visual:** immediate token swap, no fade (per DESIGN_SYSTEM anti-pattern)
- **Persistence:** next-themes localStorage + themeStore localStorage (bridge handles sync)

---

## Flow 5: User menu — density change

- **Trigger:** User menu → Density → Compact / Comfortable
- **State:** `preferencesStore.density = 'compact' | 'comfortable'`
- **Apply:** `<html data-density="{value}">` via subscribe
- **Effect:** CSS vars for `--density-row-active` / `--density-input-active` swap; all components using these vars update immediately
- **Persistence:** localStorage via Zustand
- **Default:** compact

---

## Flow 6: Login — password flow

- **Trigger:** Submit form
- **Validation:** zod schema, inline errors
- **Request:** `POST /api/auth/login {email, password, rememberMe}`
- **Success:**
  - Store JWT + refresh token in httpOnly cookie (via backend) OR in authStore (current impl)
  - If user has one tenant → navigate to `/dashboard`
  - If user has multiple tenants → navigate to `/select-tenant` (new route, see Flow 9)
  - Last-used tenant/route from `last-session` in localStorage? Navigate there instead
- **Error:** toast `toast.error(errorMessage)` + keep form state

---

## Flow 7: Login — magic link

- **Trigger:** Click "Email a magic link"
- **Prerequisite:** Email field has valid value (if empty, focus and show zod validation error)
- **Request:** `POST /api/auth/magic-link {email}`
- **Backend NOT ready yet:**
  - Response 404 or 501 → toast "Magic link sign-in coming soon — please use password"
  - Log this as a backend follow-up in `_progress.md`
- **Backend ready (future):**
  - Response 200 → show success card: "Check your email for the magic link" (inline replacement of card content, with "Back to sign in" link)

---

## Flow 8: Login — SSO placeholder

- **Trigger:** Click "Sign in with SSO"
- **Behavior:** toast "SSO configuration pending — contact your administrator"
- **No request fired**
- **Attribute:** button has `data-sso-placeholder="true"` for future wiring

---

## Flow 9: Tenant selection (new route `/select-tenant`)

- **When shown:** After login, if user has > 1 tenant and no last-used tenant
- **Layout:** centered card with tenant list (same item format as tenant switcher popover)
- **Select:** same as Flow 3, then navigate to `/dashboard`
- **If only 1 tenant:** this route auto-redirects to `/dashboard`

---

## Flow 10: Command palette — open

- **Trigger:** `⌘K` / `Ctrl+K` from ANY page (global listener via `react-hotkeys-hook`)
- **Ignore trigger:** when focus is in an input that's not part of the palette
- **Initial state:** search empty, "CONTEXTUAL" section visible if current route has contextual commands, then "RECENT", then full list
- **Search:** fuzzy filter across all sections (cmdk built-in)

---

## Flow 11: Command palette — execute command

- **Trigger:** `⏎` on highlighted command OR click
- **For navigation commands:** `navigate(href)` + close palette + prepend to recent
- **For action commands:** invoke action callback + close palette + prepend to recent
- **For switch commands (tenant, theme, density):** invoke state change + close palette + toast confirmation

---

## Flow 12: Keyboard shortcuts modal

- **Trigger:** `⌘/` / `Ctrl+/` OR user menu → "Keyboard shortcuts"
- **Open:** as Dialog
- **Close:** `ESC` or click outside or click ✕
- **Search:** NO search (modal is short enough to scan)
- **Content source:** `src/lib/keyboard-shortcuts.ts` — single source of truth shared with command palette shortcut hints

---

## Flow 13: Sequence shortcut execution (`G D`, `N B`, etc.)

- **Listener:** global key sequence detector
- **Window:** 1000ms between keys — after 1s timeout, sequence resets
- **Ignore:** when focus is in any input/textarea
- **Conflict:** single-key shortcuts (like `[`) use `preventDefault` only when not typing
- **Execute:** same as command palette action, silently (no palette opens)
- **Feedback:** subtle bottom-right flash "Go to Dashboard" toast for 1.5s so user knows it worked

---

## Flow 14: Live sync status dot

- **Data source:**
  - Online/offline: `navigator.onLine` + `online` / `offline` events
  - Last sync: from existing query invalidation (react-query `isFetching` state — if you use react-query; otherwise stub with a `useLastSync` hook returning `Date.now()` on successful mutations)
- **States:**
  - `connected` (green): online + last sync < 5s ago
  - `syncing` (amber): online + currently syncing (any mutation/query in flight)
  - `offline` (red): `!navigator.onLine` OR last sync > 30s ago
- **Text beside dot:** `"Synced {relative time}"` / `"Syncing…"` / `"Offline · {N} pending"`
- **Update frequency:** every 1s via `setInterval` OR react-query `isFetching` subscription

---

## Flow 15: "What's new" flag

- **Data source (Wave 1):** static JSON file `src/data/changelog.json` with entries `[{date, title, body, seen: boolean}]`
- **Unread count:** entries where `seen === false`
- **Click "What's new" in user menu:** open Dialog with changelog list, mark all as seen on close
- **Badge on user menu:** visible only if unread > 0, hides after Dialog closes
- **Persistence:** localStorage key `changelog-seen-ids` array

---

## Flow 16: Breadcrumb hover preview

- **Trigger:** hover on middle breadcrumb segment for 300ms
- **Content:** sibling routes from route config, filtered by user permissions
- **Data source:** `src/routes/config.ts` — a single source of truth for nav (use this also for sidebar and command palette, eliminates duplication)
- **Keyboard:** open on `Shift+F10` or Menu key (accessibility)

---

## Flow 17: Logout

- **Trigger:** user menu → Sign out OR `⌘Q` OR command palette → Sign out
- **Action:**
  1. Call `authStore.logout()` (existing)
  2. Clear react-query cache
  3. Navigate to `/login`
  4. Toast: `"Signed out"`
- **Preserve on logout:** theme preference, density preference, language
- **Clear on logout:** tenant history, command palette recent, any draft form data

---

## Flow 18: 404 / 403 / 500 trigger

- **404:** react-router catches via `errorElement` or catchall route `*`
- **403:** `PermissionGuard` component redirects OR renders `<ErrorPage code="403" />`
- **500:** React `ErrorBoundary` at app root renders `<ErrorPage code="500" />`; in dev, show error stack expandable below message

---

## Invariants (apply to all flows)

- Every network action has a toast on failure (sonner `toast.error`)
- Every destructive action has an AlertDialog confirmation
- Every navigation preserves scroll position to `0,0` (use existing ScrollToTop component or add)
- Every form submit disables the button and shows a spinner in its place
- Every optimistic update has a rollback path on error
- Every keyboard shortcut is listed in the shortcuts modal
