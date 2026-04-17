# Task 01 — Sidebar Migration

**Goal:** Rebuild `Sidebar.tsx` as a pure Tailwind + shadcn component matching `WIREFRAMES.md §1-2`. Preserve all existing permission gates, routing, and active-state logic. Add collapse-to-rail, group-based navigation, and live sync status dot.

**Depends on:** task-00

---

## Files to change

- **Replace:** `frontend/src/components/Layout/Sidebar.tsx` (the AntD `Menu` version)
- **New:** `frontend/src/components/shell/` directory for all shell primitives
  - `sidebar.tsx` — main component
  - `sidebar-item.tsx` — single nav item
  - `sidebar-group.tsx` — collapsible group
  - `sidebar-sync-status.tsx` — live dot
- **New:** `frontend/src/lib/navigation.ts` — nav config (single source of truth)
- **Update:** `frontend/src/components/Layout/AppLayout.tsx` — import new Sidebar

---

## Step 1 — Extract navigation config

Read the current `Sidebar.tsx` to find:
- Menu item structure (icon, label, href, permission key)
- Permission gate logic (likely `<PermissionGuard permission="...">` or a filter function)

Create `frontend/src/lib/navigation.ts`:

```ts
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, BarChart3, Package, Wheat, Fuel,
  Users, Wallet, FileText, Receipt, CreditCard, Settings,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  labelKey?: string  // i18n key, e.g. "nav.dashboard"
  icon: LucideIcon
  href: string
  permission?: string  // e.g. "warehouse.view" — uses existing PermissionGuard logic
  shortcut?: string    // e.g. "G D"
  children?: NavItem[]
  badge?: () => number | undefined  // dynamic badge (e.g. unread count)
}

export interface NavGroup {
  id: string
  label: string
  labelKey?: string    // i18n key
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    labelKey: 'nav.group.overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelKey: 'nav.dashboard',
        icon: LayoutDashboard, href: '/dashboard', shortcut: 'G D' },
      { id: 'reports', label: 'Reports', labelKey: 'nav.reports',
        icon: BarChart3, href: '/reports', shortcut: 'G Y',
        permission: 'reports.view' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    labelKey: 'nav.group.operations',
    items: [
      { id: 'warehouses', label: 'Warehouses', labelKey: 'nav.warehouses',
        icon: Package, href: '/warehouses', shortcut: 'G W',
        permission: 'warehouse.view',
        children: [
          { id: 'grain', label: 'Grain', labelKey: 'nav.grain',
            icon: Wheat, href: '/warehouses/grain', shortcut: 'G R',
            permission: 'grain.view' },
          { id: 'fuel', label: 'Fuel', labelKey: 'nav.fuel',
            icon: Fuel, href: '/warehouses/fuel',
            permission: 'fuel.view' },
        ],
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    labelKey: 'nav.group.people',
    items: [
      { id: 'employees', label: 'Employees', labelKey: 'nav.employees',
        icon: Users, href: '/employees', shortcut: 'G E',
        permission: 'hr.view' },
      { id: 'payroll', label: 'Payroll', labelKey: 'nav.payroll',
        icon: Wallet, href: '/payroll',
        permission: 'payroll.view' },
      { id: 'contracts', label: 'Contracts', labelKey: 'nav.contracts',
        icon: FileText, href: '/contracts',
        permission: 'contracts.view' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    labelKey: 'nav.group.finance',
    items: [
      { id: 'payments', label: 'Payments', labelKey: 'nav.payments',
        icon: CreditCard, href: '/payments', shortcut: 'G P',
        permission: 'finance.view' },
      { id: 'invoices', label: 'Invoices', labelKey: 'nav.invoices',
        icon: Receipt, href: '/invoices',
        permission: 'finance.view' },
      { id: 'receivables', label: 'Receivables', labelKey: 'nav.receivables',
        icon: FileText, href: '/receivables',
        permission: 'finance.view' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    labelKey: 'nav.group.settings',
    items: [
      { id: 'settings', label: 'Settings', labelKey: 'nav.settings',
        icon: Settings, href: '/settings',
        permission: 'settings.view' },
    ],
  },
]
```

**IMPORTANT:** read the existing Sidebar first to get the correct:
- Route paths (they might be `/admin/warehouses` not `/warehouses`)
- Permission keys (exact strings, case-sensitive)
- i18n keys (existing format)

Adapt the config above to match. Do NOT rename routes or permissions — that breaks existing auth.

---

## Step 2 — Sidebar sync status component

Create `frontend/src/components/shell/sidebar-sync-status.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function SidebarSyncStatus({ collapsed }: { collapsed: boolean }) {
  const [online, setOnline] = useState(navigator.onLine)
  const [lastSync, setLastSync] = useState<Date | null>(new Date())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      clearInterval(id)
    }
  }, [])

  // Subscribe to react-query's isFetching if you use it:
  // const isFetching = useIsFetching()
  // For now we assume a simple "synced X seconds ago" display.

  const relative = lastSync ? formatRelative(lastSync, tick) : '—'
  const status = !online ? 'offline' : 'connected'
  const dotColor = status === 'offline' ? 'bg-danger' : 'bg-success'
  const label = status === 'offline' ? 'Offline' : `Synced ${relative}`

  if (collapsed) {
    return (
      <div
        className="flex items-center justify-center py-2"
        title={label}
      >
        <span className={cn('h-2 w-2 rounded-pill', dotColor)} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-fg-tertiary">
      <span className={cn('h-2 w-2 rounded-pill shrink-0', dotColor)} />
      <span className="truncate">{label}</span>
    </div>
  )
}

function formatRelative(date: Date, _tick: number): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
```

**Note:** If the project uses `@tanstack/react-query`, subscribe to `useIsFetching()` and `useIsMutating()` and toggle `status: 'syncing'` when either > 0. Leave this as a follow-up if you find react-query is installed; stub for now with the online/offline detection above.

---

## Step 3 — Sidebar item + group components

Create `frontend/src/components/shell/sidebar-item.tsx`:

```tsx
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/navigation'
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip'

export function SidebarItem({
  item, collapsed, nested = false,
}: { item: NavItem; collapsed: boolean; nested?: boolean }) {
  const { pathname } = useLocation()
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  const content = (
    <NavLink
      to={item.href}
      onAuxClick={(e) => {
        if (e.button === 1) {
          e.preventDefault()
          window.open(item.href, '_blank')
        }
      }}
      className={cn(
        'flex items-center gap-2 rounded text-sm transition-colors',
        'h-8 px-3',
        nested && !collapsed && 'ml-4',
        collapsed && 'justify-center',
        active
          ? 'bg-accent-subtle text-fg-primary font-medium'
          : 'text-fg-secondary hover:bg-bg-muted hover:text-fg-primary',
      )}
    >
      {active && !collapsed && (
        <span className="absolute left-0 h-6 w-0.5 -translate-x-3 rounded-r bg-accent-solid" aria-hidden />
      )}
      <Icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4',
        active && 'text-accent-solid')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.shortcut && (
        <span className="ml-auto font-mono text-2xs text-fg-tertiary">{item.shortcut}</span>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.shortcut && (
            <span className="font-mono text-2xs text-fg-tertiary">{item.shortcut}</span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
```

Create `frontend/src/components/shell/sidebar-group.tsx`:

```tsx
import { SidebarItem } from './sidebar-item'
import type { NavGroup } from '@/lib/navigation'
import { useLocation } from 'react-router-dom'

export function SidebarGroup({
  group, collapsed, canSee,
}: {
  group: NavGroup
  collapsed: boolean
  canSee: (permission?: string) => boolean
}) {
  const { pathname } = useLocation()
  const visible = group.items.filter((it) => canSee(it.permission))
  if (visible.length === 0) return null

  return (
    <div className="mt-4 first:mt-0">
      {!collapsed && (
        <div className="px-3 pb-1 text-2xs font-medium uppercase tracking-wide text-fg-tertiary">
          {group.label}
        </div>
      )}
      {collapsed && <div className="mx-auto my-2 h-px w-6 bg-border-subtle" />}
      <nav aria-label={group.label} className="flex flex-col gap-0.5">
        {visible.map((item) => {
          const parentActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <div key={item.id} className="relative">
              <SidebarItem item={item} collapsed={collapsed} />
              {!collapsed && item.children && parentActive && (
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {item.children
                    .filter((c) => canSee(c.permission))
                    .map((child) => (
                      <SidebarItem
                        key={child.id}
                        item={child}
                        collapsed={false}
                        nested
                      />
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
```

---

## Step 4 — Main Sidebar component

Create `frontend/src/components/shell/sidebar.tsx`:

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { navigation } from '@/lib/navigation'
import { SidebarGroup } from './sidebar-group'
import { SidebarSyncStatus } from './sidebar-sync-status'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useAuthStore } from '@/store/authStore'  // adjust

export function Sidebar() {
  const collapsed = usePreferencesStore((s) => s.sidebarCollapsed)
  const toggle = usePreferencesStore((s) => s.toggleSidebar)
  const permissions = useAuthStore((s) => s.permissions ?? [])

  const canSee = (perm?: string) => !perm || permissions.includes(perm)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border-subtle bg-bg-subtle',
        'transition-[width] duration-slow ease-out',
        collapsed ? 'w-12' : 'w-60',
      )}
    >
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {navigation.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            canSee={canSee}
          />
        ))}
      </div>

      <div className="border-t border-border-subtle">
        <SidebarSyncStatus collapsed={collapsed} />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn(
            'w-full justify-center rounded-none h-8 text-fg-tertiary',
            !collapsed && 'justify-start px-3 gap-2',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? '[ — expand' : '[ — collapse'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
```

---

## Step 5 — Preferences store

If `preferencesStore` doesn't exist yet, create `frontend/src/store/preferencesStore.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Density = 'compact' | 'comfortable'

interface PreferencesState {
  sidebarCollapsed: boolean
  density: Density
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  setDensity: (d: Density) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      density: 'compact',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setDensity: (d) => {
        set({ density: d })
        document.documentElement.dataset.density = d
      },
    }),
    {
      name: 'agroplatform-preferences',
      onRehydrateStorage: () => (state) => {
        if (state?.density) document.documentElement.dataset.density = state.density
      },
    }
  )
)
```

---

## Step 6 — Keyboard shortcut for collapse

Install `react-hotkeys-hook` if not already present:

```bash
cd frontend
npm ls react-hotkeys-hook || npm install react-hotkeys-hook
```

Add to Sidebar component body:

```tsx
import { useHotkeys } from 'react-hotkeys-hook'
// ...
useHotkeys('[', () => toggle(), { preventDefault: true })
```

---

## Step 7 — Wire into AppLayout

Edit `frontend/src/components/Layout/AppLayout.tsx`:
- Remove old `Sidebar` import (the AntD one)
- Import new one: `import { Sidebar } from '@/components/shell/sidebar'`
- Replace usage — the new Sidebar manages its own collapse state, so remove the `collapsed` / `setCollapsed` props if the old one had them

Keep the AppLayout's existing structure for now — topbar migration is task-02.

---

## Step 8 — Delete legacy Sidebar

```bash
git rm frontend/src/components/Layout/Sidebar.tsx
```

If anything else imports `Sidebar` from the old path, redirect the imports to the new location.

---

## Step 9 — Remove from AntD allowlist

Edit `frontend/.eslint-antd-allowlist.txt` (or wherever the Phase 0 allowlist lives):
- Remove the line for `components/Layout/Sidebar.tsx`
- Run `npm run lint` to confirm no regressions

---

## Acceptance criteria

- [ ] New Sidebar renders all nav items preserved from the old one
- [ ] Permission filtering works identically (user without `warehouse.view` does NOT see Warehouses)
- [ ] Clicking an item navigates (react-router)
- [ ] Active state highlights the right item
- [ ] Middle-click opens in new tab
- [ ] Collapse button toggles 240px ↔ 48px
- [ ] `[` keyboard shortcut toggles collapse
- [ ] Tooltips appear on collapsed icons after 300ms
- [ ] Live sync status shows green dot + relative time
- [ ] Going offline (DevTools → Network → Offline) flips dot to red + "Offline"
- [ ] No AntD imports remain in new sidebar files
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Visual: matches `WIREFRAMES.md §1` (expanded) and `§2` (rail)

---

## Playwright screenshot

```ts
// Save as docs/screenshots/wave-1/task-01-expanded-light.png
// docs/screenshots/wave-1/task-01-expanded-dark.png
// docs/screenshots/wave-1/task-01-rail-light.png
// docs/screenshots/wave-1/task-01-rail-dark.png
```

Use Playwright MCP to navigate to `/dashboard`, screenshot sidebar area (clip the left 300px). Toggle theme, screenshot again. Collapse sidebar, screenshot. Toggle theme, screenshot.

---

## Git

```bash
git add frontend/src/components/shell/ \
        frontend/src/lib/navigation.ts \
        frontend/src/store/preferencesStore.ts \
        frontend/src/components/Layout/AppLayout.tsx \
        frontend/.eslint-antd-allowlist.txt \
        frontend/package.json frontend/package-lock.json
git rm frontend/src/components/Layout/Sidebar.tsx 2>/dev/null
git add docs/screenshots/wave-1/

git commit -m "feat(shell): rebuild sidebar on tailwind + shadcn

- pure Tailwind, no AntD Menu
- collapse to 48px rail, persisted in preferencesStore
- permission-gated groups (hidden if no visible items)
- live sync status dot (online/offline detection)
- keyboard shortcut [ to toggle collapse
- middle-click opens in new tab
- nav config centralized in lib/navigation.ts
- removed legacy Sidebar.tsx

Task: wave-1/task-01"
git push
```

Append entry to `_progress.md`.
