# Wave 1 Wireframes — The Visual Law

These ASCII wireframes are the target visual for every Wave 1 screen. If your implementation doesn't match, it's wrong.

Legend:
- `│` `─` `┌` `┐` `└` `┘` `├` `┤` `┬` `┴` `┼` — borders
- `●` — active / selected / live dot
- `○` — inactive dot
- `▾` `▸` — dropdown / expand indicators
- `⏎` — enter shortcut
- `⌘K` `⇧D` etc. — keyboard shortcuts

---

## 1. AppShell — expanded sidebar (240px, default)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [🌾] Farm A ▾  │ Home › Warehouses › Grain    [🔍 ⌘K] [⌘/] [🌙] [🔔3] [VL▾] │ 44px
├────────────────┼─────────────────────────────────────────────────────────────┤
│                │                                                              │
│  OVERVIEW      │ Grain Operations              [Export ▾]  [+ Add batch]    │
│   Dashboard    │ 12 batches · 3,450 t total                                  │
│   Reports      │ ──────────────────────────────────────────────────────────  │
│                │                                                              │
│  OPERATIONS    │ [🔍 Search]  [Status ▾] [Warehouse ▾]             42 rows  │
│ ● Warehouses   │                                                              │
│   ● Grain    ● │ ┌─────────────────────────────────────────────────────────┐ │
│     Fuel       │ │ ID      Name           Qty(t)   Warehouse    Status    │ │
│                │ ├─────────────────────────────────────────────────────────┤ │
│  PEOPLE        │ │ B-001   Wheat cl.3    1,240.5   WH-North     Active    │ │
│   Employees    │ │ B-002   Corn          320.0     WH-Silo-2    Active    │ │
│   Payroll      │ │ B-003   Soy           890.25    WH-East      Reserved │ │
│   Contracts    │ │ ...                                                     │ │
│                │ └─────────────────────────────────────────────────────────┘ │
│  FINANCE       │                                                              │
│   Payments     │                       Showing 1–20 of 42  [<] [1] [2] [>]  │
│   Invoices     │                                                              │
│   Receivables  │                                                              │
│                │                                                              │
│  SETTINGS ▸    │                                                              │
│                │                                                              │
├────────────────┤                                                              │
│ ● Synced · 2s  │                                                              │
│ [◀ Collapse]   │                                                              │
└────────────────┴─────────────────────────────────────────────────────────────┘
  240px               rest of viewport
```

### Rules (non-negotiable)

- **Width:** 240px expanded, 48px rail. Toggle → localStorage.
- **Group labels** (OVERVIEW, OPERATIONS, etc.): `text-xs uppercase tracking-wide text-fg-tertiary`. NOT clickable. Pure visual grouping.
- **Group ordering:** OVERVIEW → OPERATIONS → PEOPLE → FINANCE → SETTINGS. Same for every role. Groups hidden if user has zero visible children.
- **Item:** `h-8 px-3 rounded text-sm`. Hover: `bg-bg-muted`. Active: `bg-accent-subtle` + left 2px border in `accent-solid` + font-weight 500.
- **Sub-items (Grain, Fuel under Warehouses):** indent via `ml-4`. Parent expanded only when a child or parent itself is active.
- **Icons:** Lucide 16px, `text-fg-secondary`, active items get `text-accent-solid`.
- **Live status dot** (bottom, above Collapse):
  - `●` green (`bg-success`) — connected + synced
  - `●` amber (`bg-warning`) — syncing / offline queue present
  - `●` red (`bg-danger`) — disconnected > 30s
  - Text: `Connected · Synced 2s ago`, `Syncing…`, or `Offline · 3 pending`
- **Collapse button:** `[◀ Collapse]` (expanded) → `[▶]` (rail). Keyboard shortcut: `[`
- **Logo + tenant name:** top-left, clicking the tenant name opens tenant switcher popover.

---

## 2. AppShell — rail mode (48px)

```
┌────┬────────────────────────────────────────────────────────────────────────┐
│[🌾]│ Home › Warehouses › Grain    [🔍 ⌘K] [⌘/] [🌙] [🔔] [VL▾]            │
├────┼────────────────────────────────────────────────────────────────────────┤
│    │                                                                         │
│ 🏠 │  [page content unchanged]                                               │
│ 📊 │                                                                         │
│    │                                                                         │
│ ─  │                                                                         │
│ 📦●│                                                                         │
│    │                                                                         │
│ ─  │                                                                         │
│ 👥 │                                                                         │
│ 💰 │                                                                         │
│ 📄 │                                                                         │
│    │                                                                         │
│ ─  │                                                                         │
│ 💳 │                                                                         │
│ ⚙️ │                                                                         │
│    │                                                                         │
├────┤                                                                         │
│ ●  │                                                                         │
│ ▶  │                                                                         │
└────┴────────────────────────────────────────────────────────────────────────┘
  48px
```

- Icons only, 20px, vertically centered in 40px row
- Tooltip on hover shows full label + shortcut (if any)
- Group separators `─` instead of labels
- Click on an icon for a group with children → opens popover-submenu to the right (NOT inline expand)
- Active item: left accent bar `2px` full-height + `bg-accent-subtle`
- Collapse button becomes `▶` — clicking expands back to 240px

---

## 3. Tenant switcher popover

Trigger: click on tenant name "Farm A ▾" in topbar.

```
┌─────────────────────────────────────────────────────┐
│ [🔍 Search companies...]                             │
├─────────────────────────────────────────────────────┤
│ RECENT                                                │
│ ✓  🌾 Farm A                                   ⏎    │
│     2,000 ha · Kyiv Oblast · Admin                   │
├─────────────────────────────────────────────────────┤
│ ALL COMPANIES                                         │
│    🌽 Grain Trader LLC                                │
│     Trading · Odesa · Accountant                     │
├─────────────────────────────────────────────────────┤
│    🏢 Holding — AgroComplex                          │
│     12,000 ha · Multi-region · Manager               │
├─────────────────────────────────────────────────────┤
│ + New company                             Admin only │
└─────────────────────────────────────────────────────┘
```

- Built on shadcn `Command` (fuzzy search if > 5 tenants)
- **RECENT section:** last 3 used tenants (localStorage: `tenant-history`)
- Each item: tenant emoji/logo + name + context line (size · region · **user's role in this tenant**)
- Enter or click → navigate to `/t/{slug}/dashboard` with toast "Switched to Grain Trader LLC"
- "+ New company" visible only to SuperAdmin (permission check)

---

## 4. User menu (top-right, click on VL▾)

```
┌─────────────────────────────────┐
│ VL  Vlas K.                     │
│     vlas@agroplatform.com       │
│     Admin · Farm A              │
├─────────────────────────────────┤
│ 👤 Profile                      │
│ ⚙️ Preferences                  │
├─────────────────────────────────┤
│ 🎨 Appearance           Light ▾ │
│ 📏 Density          Compact ▾   │
│ 🌐 Language              EN ▾   │
├─────────────────────────────────┤
│ 💡 What's new           • 3 new │
│ ⌨️ Keyboard shortcuts       ⌘/  │
│ 📚 Help & docs                  │
│ 💬 Contact support              │
├─────────────────────────────────┤
│ 🚪 Sign out                 ⌘Q  │
└─────────────────────────────────┘
```

- Width: 260px
- Header: Avatar + name + email + current role-in-tenant
- **Inline controls** for Appearance / Density / Language — sub-dropdown on hover with Light / Dark / System, Compact / Comfortable, EN / UK
- "What's new" with `Badge variant="outline"` showing unread count — Wave 2 will wire this to real content; for Wave 1, stubbed to 3 with static changelog modal
- Shortcuts modal opens on click (or `⌘/`)
- Sign out triggers logout logic from existing auth store + redirect `/login`

---

## 5. Login — enterprise-ready

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                                                                            │
│                                                                            │
│                        [🌾] AgroPlatform                                   │
│                                                                            │
│                   ┌──────────────────────────┐                             │
│                   │                          │                             │
│                   │  Sign in                 │                             │
│                   │  to continue to your     │                             │
│                   │  workspace               │                             │
│                   │                          │                             │
│                   │  Email                   │                             │
│                   │  ┌────────────────────┐ │                             │
│                   │  │                    │ │                             │
│                   │  └────────────────────┘ │                             │
│                   │                          │                             │
│                   │  Password       Forgot?  │                             │
│                   │  ┌────────────────────┐ │                             │
│                   │  │                 👁 │ │                             │
│                   │  └────────────────────┘ │                             │
│                   │                          │                             │
│                   │  ☐ Remember me on this   │                             │
│                   │    device for 30 days    │                             │
│                   │                          │                             │
│                   │  [    Sign in       → ]  │                             │
│                   │                          │                             │
│                   │  ─────── or ──────────   │                             │
│                   │                          │                             │
│                   │  [📧 Email a magic link]  │                             │
│                   │  [🔑 Sign in with SSO  ]  │                             │
│                   │                          │                             │
│                   └──────────────────────────┘                             │
│                                                                            │
│                  No account? Contact your admin                            │
│                                                                            │
├───────────────────────────────────────────────────────────────────────────┤
│  EN · UK                              v1.0 · Privacy · Terms · Status     │
└───────────────────────────────────────────────────────────────────────────┘
```

- Card: max-w-sm, `shadow-overlay`, `border border-border-subtle`, centered
- Logo emoji (🌾) above card — Wave 2 replaces with real SVG logo
- Form validation: zod schema, inline errors under each field
- "Remember me" → extends refresh token to 30 days via existing auth API (falls back to 24h if API doesn't support)
- **Magic link** button: calls `POST /api/auth/magic-link {email}` → toast "Check your email". If backend endpoint doesn't exist yet → toast "Magic link coming soon — use password for now" (log in `_progress.md` as follow-up)
- **SSO** button: toast "SSO configuration pending — contact your administrator" + `data-sso-placeholder="true"` attribute for future wiring
- Footer: language switcher + Privacy / Terms / Status links (Status → `https://status.agroplatform.com`, 404 is fine for now)

---

## 6. Command palette (⌘K)

```
┌───────────────────────────────────────────────────────────┐
│ [🔍 Type a command or search...]                    ⌘K    │
├───────────────────────────────────────────────────────────┤
│ CONTEXTUAL                      (shown when on a route)   │
│  + New grain batch                              N B       │
│  ↑ Import batches from CSV                                │
├───────────────────────────────────────────────────────────┤
│ RECENT                          (last 5, localStorage)    │
│  → Dashboard                                              │
│  → Employees                                              │
├───────────────────────────────────────────────────────────┤
│ NAVIGATE                                                   │
│  → Dashboard                                    G D       │
│  → Warehouses                                   G W       │
│  → Grain Operations                             G R       │
│  → Employees                                    G E       │
│  → Payments                                     G P       │
├───────────────────────────────────────────────────────────┤
│ ACTIONS                                                    │
│  + New grain batch                              N B       │
│  + Record fuel transaction                      N F       │
│  + Add employee                                 N E       │
├───────────────────────────────────────────────────────────┤
│ SWITCH                                                     │
│  🌽 Switch to Grain Trader LLC                            │
│  🌙 Toggle theme                                ⇧ L       │
│  📏 Toggle density                              ⇧ D       │
├───────────────────────────────────────────────────────────┤
│ HELP                                                       │
│  ⌨️ Keyboard shortcuts                          ⌘/        │
│  📚 Documentation                                         │
├───────────────────────────────────────────────────────────┤
│ ↑↓ navigate · ⏎ select · ESC close                        │
└───────────────────────────────────────────────────────────┘
```

- Built on shadcn `CommandDialog` (cmdk)
- Fuzzy search (default cmdk behavior)
- **Contextual section** at top: items shown only on specific routes (`+ New grain batch` only on `/warehouses/grain*`). Defined in `src/lib/command-registry.ts` with a route matcher.
- **Recent section:** last 5 executed commands, stored in `localStorage` as `command-palette-recent`
- **Keyboard shortcuts hints:** appear right-aligned, `font-mono text-xs`
- Sequence shortcuts (`G D`, `N B`) supported via Mousetrap-style key sequence detector (library: `react-hotkeys-hook` — already common)
- Footer: micro-help with navigation keys

---

## 7. Keyboard shortcuts modal (⌘/)

```
┌──────────────────────────────────────────────────────────────┐
│  Keyboard shortcuts                                    [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  GENERAL                                                      │
│  Open command palette                              ⌘ K       │
│  Show this panel                                   ⌘ /       │
│  Toggle sidebar                                        [     │
│  Toggle theme                                      ⇧ L       │
│  Toggle density                                    ⇧ D       │
│                                                               │
│  NAVIGATE                                                     │
│  Go to dashboard                                   G D       │
│  Go to warehouses                                  G W       │
│  Go to grain                                       G R       │
│  Go to employees                                   G E       │
│  Go to payments                                    G P       │
│                                                               │
│  CREATE                                                       │
│  New grain batch                                   N B       │
│  New fuel transaction                              N F       │
│  New employee                                      N E       │
│                                                               │
│  HELP                                                         │
│  Contact support                                   ⇧ ?       │
│  Sign out                                          ⌘ Q       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

- Dialog, max-w-lg
- 2-column layout: description left, keys right-aligned (`font-mono`)
- Section headers: `text-xs uppercase tracking-wide text-fg-tertiary`
- Each key wrapped in a `Kbd` component (styled like shadcn `Kbd`): small rounded box with border + shadow

---

## 8. Page header pattern (reusable `<PageHeader>`)

Every module page uses this component.

```
┌──────────────────────────────────────────────────────────────────────┐
│ Home › Warehouses                                                    │  breadcrumb
│                                                                       │
│ Warehouses                      [Export ▾]  [+ Add warehouse]        │  h1 + CTA
│ Manage storage facilities and inventory                              │  description
│ ─────────────────────────────────────────────────────────────────── │
└──────────────────────────────────────────────────────────────────────┘
```

Props:
- `breadcrumb: { label, href }[]` — last item is non-clickable
- `title: string` — h1, `text-2xl font-semibold`
- `description?: string` — `text-sm text-fg-secondary`
- `primaryAction?: ReactNode` — solid button
- `secondaryActions?: ReactNode[]` — outline/ghost buttons
- `hoverPreview?: boolean` — enables breadcrumb hover popover with sibling pages

---

## 9. Breadcrumbs with hover preview

```
Home › Warehouses › Grain
          ▲
          │
          │ hovering shows:
          │
          │  ┌───────────────────────┐
          │  │ WAREHOUSES            │
          │  │  → Grain              │
          │  │    Fuel               │
          │  │    All warehouses     │
          │  └───────────────────────┘
```

- Each middle segment is a `HoverCard` trigger
- Content: sibling pages (sourced from route config + permission filter)
- Open delay 300ms, close delay 100ms
- Arrow navigation keyboard-accessible

---

## 10. Empty state (reusable)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                           ┌──────────┐                                │
│                           │  <icon>  │                                │
│                           └──────────┘                                │
│                                                                       │
│                          No warehouses yet                            │
│                                                                       │
│                Warehouses let you organize and track                  │
│                    stored grain, fuel, and inputs.                    │
│                                                                       │
│                      [ + Add warehouse ]                              │
│                                                                       │
│                  Learn more about warehouses →                        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

Props:
- `icon: LucideIcon` — 48px, `text-fg-tertiary`
- `title: string`
- `description?: string`
- `action?: { label, onClick, icon? }` — primary button
- `learnMoreHref?: string` — optional link below action

---

## 11. Error pages (404 / 403 / 500)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                                                                       │
│                              404                                      │
│                                                                       │
│                        Page not found                                 │
│             The page you're looking for doesn't exist                 │
│                         or was moved                                  │
│                                                                       │
│              [ ← Go back ]   [ Go to dashboard → ]                    │
│                                                                       │
│                   Need help? Contact support                          │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

Shared component `<ErrorPage>` with three configs: `not-found`, `forbidden`, `server-error`. Also a `<Maintenance>` variant for planned downtime.

Props:
- `code: '404' | '403' | '500' | 'maintenance'`
- `title`, `description` — overridable
- `primaryAction`, `secondaryAction`

---

## 12. Density toggle behavior

In Preferences (user menu sub-dropdown):

- **Compact (default):** table rows 28px, inputs 30px, sidebar items 28px
- **Comfortable:** table rows 36px, inputs 36px, sidebar items 32px

Applied via `data-density="compact"` attribute on `<html>`, tokens read the attribute via CSS:

```css
[data-density="comfortable"] {
  --density-row-active: var(--density-row-comfortable);
  --density-input-active: var(--density-input-comfortable);
}
[data-density="compact"], :root {
  --density-row-active: var(--density-row-compact);
  --density-input-active: var(--density-input-compact);
}
```

Tables and inputs use `var(--density-row-active)` instead of hardcoded heights.

Persisted in Zustand `preferencesStore` → localStorage.
