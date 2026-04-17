# Task 02 — Topbar Migration

**Goal:** Rebuild the topbar from `AppLayout.tsx` (currently uses AntD Button + Dropdown) using shadcn primitives. Add context-aware breadcrumbs, tenant switcher, global search trigger, notifications bell, and connect the existing theme toggle. User menu is split to task-03 because it's complex enough to stand alone.

**Depends on:** task-00, task-01

---

## Files to change

- **Update:** `frontend/src/components/Layout/AppLayout.tsx` — extract topbar to its own component
- **New:** `frontend/src/components/shell/topbar.tsx` — main topbar
- **New:** `frontend/src/components/shell/breadcrumbs.tsx` — context breadcrumbs with hover preview
- **New:** `frontend/src/components/shell/tenant-switcher.tsx` — popover switcher
- **New:** `frontend/src/components/shell/search-trigger.tsx` — opens command palette (wired in task-06)
- **New:** `frontend/src/components/shell/notifications-popover.tsx` — bell + unread count (stub in Wave 1)
- **New:** `frontend/src/lib/breadcrumb-registry.ts` — route → breadcrumb labels mapping

---

## Step 1 — Breadcrumb registry

Create `frontend/src/lib/breadcrumb-registry.ts`:

```ts
import { navigation } from './navigation'

export interface BreadcrumbSegment {
  label: string
  href?: string  // undefined for the last (current) segment
}

// Build a lookup: route pathname → label chain
const labelByPath = new Map<string, string>()
navigation.forEach((group) => {
  group.items.forEach((item) => {
    labelByPath.set(item.href, item.label)
    item.children?.forEach((child) => {
      labelByPath.set(child.href, child.label)
    })
  })
})

export function resolveBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean)
  const chain: BreadcrumbSegment[] = [{ label: 'Home', href: '/dashboard' }]

  let accumulated = ''
  segments.forEach((seg, i) => {
    accumulated += '/' + seg
    const label = labelByPath.get(accumulated) ?? prettify(seg)
    const isLast = i === segments.length - 1
    chain.push({ label, href: isLast ? undefined : accumulated })
  })

  return chain
}

function prettify(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
```

---

## Step 2 — Breadcrumbs component with hover preview

Create `frontend/src/components/shell/breadcrumbs.tsx`:

```tsx
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { resolveBreadcrumbs } from '@/lib/breadcrumb-registry'
import { navigation } from '@/lib/navigation'
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from '@/components/ui/hover-card'

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const chain = resolveBreadcrumbs(pathname)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {chain.map((seg, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-fg-tertiary" />}
          {seg.href ? (
            <BreadcrumbLink href={seg.href} label={seg.label} />
          ) : (
            <span className="text-fg-primary font-medium">{seg.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function BreadcrumbLink({ href, label }: { href: string; label: string }) {
  const siblings = findSiblings(href)
  const linkClass = 'text-fg-secondary hover:text-fg-primary transition-colors'

  if (siblings.length <= 1) {
    return <Link to={href} className={linkClass}>{label}</Link>
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link to={href} className={linkClass}>{label}</Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-56 p-1" align="start">
        <div className="px-2 py-1.5 text-2xs font-medium uppercase tracking-wide text-fg-tertiary">
          {label}
        </div>
        {siblings.map((sib) => (
          <Link
            key={sib.href}
            to={sib.href}
            className="flex items-center rounded px-2 py-1.5 text-sm text-fg-secondary hover:bg-bg-muted hover:text-fg-primary"
          >
            {sib.label}
          </Link>
        ))}
      </HoverCardContent>
    </HoverCard>
  )
}

function findSiblings(href: string) {
  for (const group of navigation) {
    for (const item of group.items) {
      if (item.href === href) {
        return [item, ...group.items.filter((i) => i.href !== href)]
          .map((i) => ({ href: i.href, label: i.label }))
      }
      if (item.children) {
        const match = item.children.find((c) => c.href === href)
        if (match) {
          return item.children.map((c) => ({ href: c.href, label: c.label }))
        }
      }
    }
  }
  return []
}
```

---

## Step 3 — Tenant switcher

Create `frontend/src/components/shell/tenant-switcher.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'  // adjust to actual

export function TenantSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const currentTenant = useAuthStore((s) => s.currentTenant)
  const availableTenants = useAuthStore((s) => s.availableTenants ?? [])
  const switchTenant = useAuthStore((s) => s.switchTenant)
  const canCreateTenant = useAuthStore((s) =>
    (s.permissions ?? []).includes('tenant.create')
  )

  const recentIds = getRecentTenants()
  const recent = recentIds
    .map((id) => availableTenants.find((t: any) => t.id === id))
    .filter(Boolean)
    .slice(0, 3)
  const rest = availableTenants.filter((t: any) => !recentIds.includes(t.id))

  const handleSwitch = async (tenantId: string) => {
    try {
      await switchTenant?.(tenantId)
      pushRecentTenant(tenantId)
      const t = availableTenants.find((x: any) => x.id === tenantId)
      toast.success(`Switched to ${t?.name ?? 'tenant'}`)
      setOpen(false)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Could not switch tenant')
    }
  }

  if (!currentTenant) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 px-2 text-sm font-medium"
        >
          <span className="max-w-[140px] truncate">{currentTenant.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-fg-tertiary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search companies..." />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>
            {recent.length > 0 && (
              <CommandGroup heading="Recent">
                {recent.map((t: any) => (
                  <TenantItem
                    key={t.id}
                    tenant={t}
                    isCurrent={t.id === currentTenant.id}
                    onSelect={() => handleSwitch(t.id)}
                  />
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="All companies">
              {rest.map((t: any) => (
                <TenantItem
                  key={t.id}
                  tenant={t}
                  isCurrent={t.id === currentTenant.id}
                  onSelect={() => handleSwitch(t.id)}
                />
              ))}
            </CommandGroup>
            {canCreateTenant && (
              <CommandGroup>
                <CommandItem onSelect={() => { setOpen(false); navigate('/settings/tenants/new') }}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New company</span>
                  <span className="ml-auto text-2xs text-fg-tertiary">Admin only</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function TenantItem({ tenant, isCurrent, onSelect }: any) {
  return (
    <CommandItem onSelect={onSelect} className="flex-col items-start gap-0 py-2">
      <div className="flex w-full items-center">
        {isCurrent && <Check className="mr-2 h-4 w-4 text-accent-solid" />}
        {!isCurrent && <span className="mr-2 h-4 w-4" />}
        <span className="flex-1 truncate font-medium">{tenant.name}</span>
      </div>
      {(tenant.size || tenant.region || tenant.role) && (
        <div className="ml-6 text-2xs text-fg-tertiary">
          {[tenant.size, tenant.region, tenant.role].filter(Boolean).join(' · ')}
        </div>
      )}
    </CommandItem>
  )
}

function getRecentTenants(): string[] {
  try {
    return JSON.parse(localStorage.getItem('tenant-history') || '[]')
  } catch {
    return []
  }
}

function pushRecentTenant(id: string) {
  const current = getRecentTenants()
  const updated = [id, ...current.filter((x) => x !== id)].slice(0, 10)
  localStorage.setItem('tenant-history', JSON.stringify(updated))
}
```

**IMPORTANT:** The above assumes `authStore` has `currentTenant`, `availableTenants`, `switchTenant`. Read the actual auth store first. If fields are different, adapt. If the concept of "availableTenants" doesn't exist yet, fall back to showing only the current tenant and add a follow-up in `_progress.md` to expose `GET /api/auth/tenants` endpoint.

---

## Step 4 — Search trigger

Create `frontend/src/components/shell/search-trigger.tsx`:

```tsx
import { Search } from 'lucide-react'
import { useCommandPaletteStore } from '@/store/commandPaletteStore'

export function SearchTrigger() {
  const open = useCommandPaletteStore((s) => s.open)
  return (
    <button
      onClick={() => open()}
      className="group flex h-8 items-center gap-2 rounded border border-border-subtle bg-bg-base px-2.5 text-sm text-fg-tertiary hover:border-border-default hover:text-fg-secondary transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="mr-8">Search...</span>
      <kbd className="ml-auto rounded border border-border-subtle bg-bg-muted px-1.5 py-0.5 font-mono text-2xs text-fg-tertiary">
        ⌘K
      </kbd>
    </button>
  )
}
```

`commandPaletteStore` will be created in task-06. For this task, stub it:

```ts
// frontend/src/store/commandPaletteStore.ts
import { create } from 'zustand'
interface S { isOpen: boolean; open: () => void; close: () => void }
export const useCommandPaletteStore = create<S>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
```

---

## Step 5 — Notifications popover (stub)

Create `frontend/src/components/shell/notifications-popover.tsx`:

```tsx
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

export function NotificationsPopover() {
  // Wave 1: stub. Wave 3+ wires to real notifications API.
  const unread = 0  // replace with: useNotifications().unreadCount

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-1 text-2xs"
            >
              {unread > 99 ? '99+' : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          <button className="text-xs text-fg-tertiary hover:text-fg-secondary">
            Mark all read
          </button>
        </div>
        <div className="flex h-48 items-center justify-center text-sm text-fg-tertiary">
          No notifications yet
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

---

## Step 6 — Theme toggle (reuse from Phase 0)

The Phase 0 `theme-toggle.tsx` exists at `@/components/theme-toggle.tsx`. Reuse it directly.

---

## Step 7 — Main Topbar

Create `frontend/src/components/shell/topbar.tsx`:

```tsx
import { Breadcrumbs } from './breadcrumbs'
import { TenantSwitcher } from './tenant-switcher'
import { SearchTrigger } from './search-trigger'
import { NotificationsPopover } from './notifications-popover'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from './user-menu'  // from task-03

export function Topbar() {
  return (
    <header className="flex h-11 items-center gap-3 border-b border-border-subtle bg-bg-base px-4">
      <TenantSwitcher />
      <div className="h-5 w-px bg-border-subtle" />
      <Breadcrumbs />
      <div className="flex-1" />
      <SearchTrigger />
      <NotificationsPopover />
      <ThemeToggle />
      <div className="h-5 w-px bg-border-subtle" />
      <UserMenu />
    </header>
  )
}
```

**Note:** `UserMenu` is built in task-03. For this task, stub it with a simple button so task-02 can complete independently:

```tsx
// frontend/src/components/shell/user-menu.tsx (stub for now)
import { Button } from '@/components/ui/button'
export function UserMenu() {
  return <Button variant="ghost" size="sm">User</Button>
}
```

Task-03 will replace this stub with the full implementation.

---

## Step 8 — Wire Topbar into AppLayout

Edit `frontend/src/components/Layout/AppLayout.tsx`:
- Remove all AntD Button + Dropdown imports from topbar area
- Import new `Topbar` component
- Use it instead of the manual topbar code
- The layout structure becomes:
  ```tsx
  <div className="flex h-screen bg-bg-base">
    <Sidebar />
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
  ```

Preserve any logic that was in the old topbar (logout handler, etc.) — move it to the appropriate new component.

---

## Step 9 — Remove AppLayout.tsx from AntD allowlist

Confirm no `antd` imports remain in `AppLayout.tsx`:

```bash
grep -n "from 'antd'" frontend/src/components/Layout/AppLayout.tsx
# expect: no output
```

Remove the file from `.eslint-antd-allowlist.txt`.

---

## Acceptance criteria

- [ ] Topbar renders all: tenant switcher, breadcrumbs, search trigger, bell, theme toggle, user menu stub
- [ ] Tenant switcher opens popover with fuzzy search
- [ ] Recent tenants section appears if localStorage has history
- [ ] Breadcrumbs reflect current route
- [ ] Middle-level breadcrumbs show HoverCard with siblings on 300ms hover
- [ ] Search trigger opens command palette (stub opens — palette UI comes in task-06)
- [ ] Bell shows badge only if unread > 0; popover empty state visible
- [ ] Theme toggle still works
- [ ] AppLayout no longer imports from `antd`
- [ ] `npm run build` passes, `npm run lint` passes
- [ ] Visual matches `WIREFRAMES.md §1` topbar row

---

## Playwright screenshots

- `docs/screenshots/wave-1/task-02-topbar-light.png`
- `docs/screenshots/wave-1/task-02-topbar-dark.png`
- `docs/screenshots/wave-1/task-02-tenant-switcher.png` (with popover open)
- `docs/screenshots/wave-1/task-02-breadcrumb-hover.png` (with HoverCard open)

---

## Git

```bash
git add frontend/src/components/shell/ \
        frontend/src/lib/breadcrumb-registry.ts \
        frontend/src/store/commandPaletteStore.ts \
        frontend/src/components/Layout/AppLayout.tsx \
        frontend/.eslint-antd-allowlist.txt \
        docs/screenshots/wave-1/

git commit -m "feat(shell): rebuild topbar with shadcn primitives

- new Topbar with tenant switcher, breadcrumbs, search trigger,
  notifications popover, theme toggle
- Breadcrumbs with hover preview of sibling pages
- TenantSwitcher popover with Recent + All groups, role badges
- SearchTrigger with ⌘K kbd hint (palette UI in task-06)
- Removed AppLayout from eslint antd allowlist

Task: wave-1/task-02"
git push
```

Append to `_progress.md`.
