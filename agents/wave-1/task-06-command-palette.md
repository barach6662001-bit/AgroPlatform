# Task 06 — Command Palette Migration

**Goal:** Replace the AntD-based `CommandPalette.tsx` with shadcn `CommandDialog` (cmdk) matching `WIREFRAMES.md §6`. Add contextual commands, recent history, Linear-style `G D` / `N B` sequence shortcuts.

**Depends on:** task-02 (search trigger wires to `commandPaletteStore`)

---

## Files to change

- **Replace:** `frontend/src/components/CommandPalette.tsx`
- **New:** `frontend/src/lib/command-registry.ts` — action registry with route matchers
- **Update:** `frontend/src/store/commandPaletteStore.ts` — from stub to full
- **Update:** `frontend/src/App.tsx` — mount `<CommandPalette />` at app root

---

## Step 1 — Full command registry

Create `frontend/src/lib/command-registry.ts`:

```ts
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Package, Wheat, Fuel, Users, Wallet,
  FileText, Receipt, CreditCard, Plus, Upload, Moon, Sun,
  Maximize2, Minimize2, Keyboard, BookOpen, LogOut, Building2,
} from 'lucide-react'

export type CommandCategory =
  | 'contextual' | 'recent' | 'navigate' | 'action'
  | 'switch' | 'help'

export interface Command {
  id: string
  label: string
  labelKey?: string
  category: CommandCategory
  icon?: LucideIcon
  shortcut?: string
  routeMatch?: (pathname: string) => boolean
  permission?: string
  run: (ctx: CommandContext) => void | Promise<void>
}

export interface CommandContext {
  navigate: (to: string) => void
  setTheme: (t: 'light' | 'dark' | 'system') => void
  setDensity: (d: 'compact' | 'comfortable') => void
  currentTheme?: string
  currentDensity?: string
  logout: () => Promise<void>
  openShortcutsModal: () => void
  openTenantSwitcher: () => void
  toast: (msg: string) => void
}

// Single source of truth for every command in the app.
export const commands: Command[] = [
  // NAVIGATE
  { id: 'nav.dashboard', label: 'Go to Dashboard', category: 'navigate',
    icon: LayoutDashboard, shortcut: 'G D',
    run: (c) => c.navigate('/dashboard') },
  { id: 'nav.warehouses', label: 'Go to Warehouses', category: 'navigate',
    icon: Package, shortcut: 'G W', permission: 'warehouse.view',
    run: (c) => c.navigate('/warehouses') },
  { id: 'nav.grain', label: 'Go to Grain', category: 'navigate',
    icon: Wheat, shortcut: 'G R', permission: 'grain.view',
    run: (c) => c.navigate('/warehouses/grain') },
  { id: 'nav.fuel', label: 'Go to Fuel', category: 'navigate',
    icon: Fuel, permission: 'fuel.view',
    run: (c) => c.navigate('/warehouses/fuel') },
  { id: 'nav.employees', label: 'Go to Employees', category: 'navigate',
    icon: Users, shortcut: 'G E', permission: 'hr.view',
    run: (c) => c.navigate('/employees') },
  { id: 'nav.payments', label: 'Go to Payments', category: 'navigate',
    icon: CreditCard, shortcut: 'G P', permission: 'finance.view',
    run: (c) => c.navigate('/payments') },

  // ACTIONS
  { id: 'action.new-grain-batch', label: 'New grain batch',
    category: 'action', icon: Plus, shortcut: 'N B',
    permission: 'grain.create',
    routeMatch: (p) => p.startsWith('/warehouses/grain'),
    run: (c) => c.navigate('/warehouses/grain/new') },
  { id: 'action.new-fuel-tx', label: 'Record fuel transaction',
    category: 'action', icon: Plus, shortcut: 'N F',
    permission: 'fuel.create',
    routeMatch: (p) => p.startsWith('/warehouses/fuel'),
    run: (c) => c.navigate('/warehouses/fuel/new') },
  { id: 'action.new-employee', label: 'Add employee',
    category: 'action', icon: Plus, shortcut: 'N E',
    permission: 'hr.create',
    run: (c) => c.navigate('/employees/new') },
  { id: 'action.import-csv', label: 'Import CSV',
    category: 'action', icon: Upload,
    routeMatch: (p) => p.startsWith('/warehouses'),
    permission: 'warehouse.import',
    run: (c) => c.toast('CSV import coming in Wave 3') },

  // SWITCH
  { id: 'switch.tenant', label: 'Switch company', category: 'switch',
    icon: Building2,
    run: (c) => c.openTenantSwitcher() },
  { id: 'switch.theme-dark', label: 'Toggle theme (dark)',
    category: 'switch', icon: Moon, shortcut: '⇧ L',
    run: (c) => c.setTheme(c.currentTheme === 'dark' ? 'light' : 'dark') },
  { id: 'switch.density', label: 'Toggle density',
    category: 'switch', icon: Maximize2, shortcut: '⇧ D',
    run: (c) => c.setDensity(c.currentDensity === 'compact' ? 'comfortable' : 'compact') },

  // HELP
  { id: 'help.shortcuts', label: 'Keyboard shortcuts',
    category: 'help', icon: Keyboard, shortcut: '⌘ /',
    run: (c) => c.openShortcutsModal() },
  { id: 'help.docs', label: 'Documentation',
    category: 'help', icon: BookOpen,
    run: () => window.open('https://docs.agroplatform.com', '_blank') },
  { id: 'help.logout', label: 'Sign out',
    category: 'help', icon: LogOut, shortcut: '⌘ Q',
    run: (c) => c.logout() },
]

// Helpers
export function getContextualCommands(pathname: string): Command[] {
  return commands.filter(
    (c) => c.category === 'action' && c.routeMatch?.(pathname)
  )
}

export function getRecentCommands(ids: string[]): Command[] {
  return ids
    .map((id) => commands.find((c) => c.id === id))
    .filter((c): c is Command => !!c)
    .slice(0, 5)
}

export function getRecentIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem('command-palette-recent') ?? '[]')
  } catch {
    return []
  }
}

export function pushRecent(id: string): void {
  const current = getRecentIds()
  const next = [id, ...current.filter((x) => x !== id)].slice(0, 10)
  localStorage.setItem('command-palette-recent', JSON.stringify(next))
}
```

---

## Step 2 — Full command palette store

Replace `frontend/src/store/commandPaletteStore.ts`:

```ts
import { create } from 'zustand'

interface State {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useCommandPaletteStore = create<State>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))
```

---

## Step 3 — Command palette component

Replace `frontend/src/components/CommandPalette.tsx`:

```tsx
import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  CommandDialog, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command'
import { useCommandPaletteStore } from '@/store/commandPaletteStore'
import {
  commands, getContextualCommands, getRecentCommands, getRecentIds, pushRecent,
  type Command,
} from '@/lib/command-registry'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export function CommandPalette() {
  const { isOpen, open, close } = useCommandPaletteStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme, setTheme } = useTheme()
  const density = usePreferencesStore((s) => s.density)
  const setDensity = usePreferencesStore((s) => s.setDensity)
  const permissions = useAuthStore((s) => s.permissions ?? [])
  const logout = useAuthStore((s) => s.logout)

  // Global ⌘K
  useHotkeys('meta+k,ctrl+k', (e) => {
    e.preventDefault()
    useCommandPaletteStore.getState().toggle()
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] })

  const ctx = useMemo(() => ({
    navigate,
    setTheme: (t: any) => setTheme(t),
    setDensity,
    currentTheme: theme,
    currentDensity: density,
    logout: async () => { await logout?.(); navigate('/login') },
    openShortcutsModal: () => window.dispatchEvent(new Event('open-keyboard-shortcuts')),
    openTenantSwitcher: () => {
      // Tenant switcher is a popover in topbar; trigger via event
      window.dispatchEvent(new Event('open-tenant-switcher'))
    },
    toast: (msg: string) => toast.message(msg),
  }), [navigate, setTheme, setDensity, theme, density, logout])

  const visible = useMemo(() => {
    return commands.filter((c) => !c.permission || permissions.includes(c.permission))
  }, [permissions])

  const contextualIds = useMemo(
    () => new Set(getContextualCommands(pathname).map((c) => c.id)),
    [pathname]
  )
  const recentIds = getRecentIds()
  const recent = getRecentCommands(recentIds).filter(
    (c) => visible.some((v) => v.id === c.id) && !contextualIds.has(c.id)
  )

  const execute = async (cmd: Command) => {
    close()
    pushRecent(cmd.id)
    try {
      await cmd.run(ctx)
    } catch (err) {
      console.error(err)
      toast.error('Command failed')
    }
  }

  const byCategory = (cat: Command['category']) =>
    visible.filter((c) => c.category === cat && !contextualIds.has(c.id))

  const contextual = visible.filter((c) => contextualIds.has(c.id))

  return (
    <CommandDialog open={isOpen} onOpenChange={(v) => v ? open() : close()}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        {contextual.length > 0 && (
          <>
            <CommandGroup heading="Contextual">
              {contextual.map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {recent.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recent.map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigate">
          {byCategory('navigate').map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
        </CommandGroup>

        <CommandGroup heading="Actions">
          {byCategory('action').map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
        </CommandGroup>

        <CommandGroup heading="Switch">
          {byCategory('switch').map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
        </CommandGroup>

        <CommandGroup heading="Help">
          {byCategory('help').map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
        </CommandGroup>
      </CommandList>
      <div className="flex items-center gap-3 border-t border-border-subtle px-3 py-2 text-2xs text-fg-tertiary">
        <span><kbd className="font-mono">↑↓</kbd> navigate</span>
        <span><kbd className="font-mono">⏎</kbd> select</span>
        <span><kbd className="font-mono">ESC</kbd> close</span>
      </div>
    </CommandDialog>
  )
}

function Item({
  command, onSelect,
}: { command: Command; onSelect: (c: Command) => void }) {
  const Icon = command.icon
  return (
    <CommandItem onSelect={() => onSelect(command)}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span>{command.label}</span>
      {command.shortcut && (
        <span className="ml-auto font-mono text-2xs text-fg-tertiary">
          {command.shortcut}
        </span>
      )}
    </CommandItem>
  )
}
```

---

## Step 4 — Sequence shortcuts (G D, N B, etc.)

Create `frontend/src/lib/key-sequences.ts`:

```ts
import { commands } from './command-registry'

type Listener = () => void

class KeySequenceMatcher {
  private buffer = ''
  private timer: ReturnType<typeof setTimeout> | null = null
  private listeners = new Map<string, Listener>()

  register(sequence: string, listener: Listener) {
    this.listeners.set(sequence.toLowerCase(), listener)
  }

  handle(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    const tag = target.tagName
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
    if (target.isContentEditable) return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    const key = e.key.toLowerCase()
    if (key.length !== 1) return

    this.buffer += key
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => { this.buffer = '' }, 1000)

    // Check listeners against current buffer
    for (const [seq, listener] of this.listeners) {
      const compact = seq.replace(/\s+/g, '').toLowerCase()
      if (this.buffer.endsWith(compact)) {
        listener()
        this.buffer = ''
        return
      }
    }
  }
}

export const keySequenceMatcher = new KeySequenceMatcher()

export function installKeySequences() {
  const handler = (e: KeyboardEvent) => keySequenceMatcher.handle(e)
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}
```

Create a hook `frontend/src/hooks/useCommandShortcuts.ts`:

```ts
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { keySequenceMatcher, installKeySequences } from '@/lib/key-sequences'
import { commands, pushRecent } from '@/lib/command-registry'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export function useCommandShortcuts() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const density = usePreferencesStore((s) => s.density)
  const setDensity = usePreferencesStore((s) => s.setDensity)
  const logout = useAuthStore((s) => s.logout)
  const permissions = useAuthStore((s) => s.permissions ?? [])

  useEffect(() => {
    const ctx = {
      navigate,
      setTheme: (t: any) => setTheme(t),
      setDensity,
      currentTheme: theme,
      currentDensity: density,
      logout: async () => { await logout?.(); navigate('/login') },
      openShortcutsModal: () => window.dispatchEvent(new Event('open-keyboard-shortcuts')),
      openTenantSwitcher: () => window.dispatchEvent(new Event('open-tenant-switcher')),
      toast: (msg: string) => toast.message(msg),
    }

    commands.forEach((c) => {
      if (!c.shortcut) return
      if (c.shortcut.length < 2) return   // single-key shortcuts handled elsewhere
      if (c.permission && !permissions.includes(c.permission)) return
      keySequenceMatcher.register(c.shortcut, () => {
        pushRecent(c.id)
        c.run(ctx)
        // Subtle feedback
        toast.message(c.label, { duration: 1200 })
      })
    })

    return installKeySequences()
  }, [navigate, setTheme, setDensity, theme, density, logout, permissions])
}
```

Call `useCommandShortcuts()` in `AppLayout`.

---

## Step 5 — Mount CommandPalette at app root

In `frontend/src/App.tsx` (or wherever provides the router):

```tsx
import { CommandPalette } from '@/components/CommandPalette'
// ...
<ThemeProvider>
  <ThemeBridge />
  <CommandPalette />
  <RouterProvider router={router} />
</ThemeProvider>
```

---

## Step 6 — Remove from AntD allowlist

```bash
grep -n "from 'antd'" frontend/src/components/CommandPalette.tsx
# expect: empty
```

Remove from `.eslint-antd-allowlist.txt`.

---

## Acceptance criteria

- [ ] `⌘K` / `Ctrl+K` opens palette from anywhere
- [ ] Fuzzy search filters commands
- [ ] Contextual section appears at top on `/warehouses/grain*` (shows "New grain batch")
- [ ] Recent section shows last 5 executed commands
- [ ] Execute command: closes palette, navigates or runs action, prepends to recent
- [ ] Sequence shortcuts work: type `G D` → navigate to dashboard + subtle toast
- [ ] Sequence shortcuts ignored when focus is in input
- [ ] Permission-gated commands hidden for users without the permission
- [ ] Shortcut hints right-aligned, monospaced
- [ ] Footer with nav hints visible
- [ ] No AntD imports in CommandPalette
- [ ] `npm run build` passes, `npm run lint` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1/task-06-palette-light.png` (open, no search)
- `docs/screenshots/wave-1/task-06-palette-dark.png`
- `docs/screenshots/wave-1/task-06-palette-contextual.png` (on /warehouses/grain)
- `docs/screenshots/wave-1/task-06-palette-search.png` (after typing "grain")

---

## Git

```bash
git add frontend/src/components/CommandPalette.tsx \
        frontend/src/lib/command-registry.ts \
        frontend/src/lib/key-sequences.ts \
        frontend/src/hooks/useCommandShortcuts.ts \
        frontend/src/store/commandPaletteStore.ts \
        frontend/src/App.tsx \
        frontend/src/components/Layout/AppLayout.tsx \
        frontend/.eslint-antd-allowlist.txt \
        docs/screenshots/wave-1/

git commit -m "feat(shell): command palette on cmdk + sequence shortcuts

- AntD Modal -> shadcn CommandDialog
- single command registry (lib/command-registry.ts) drives palette,
  sequence shortcuts, and shortcuts modal
- contextual section (route-aware), recent section (localStorage)
- Linear-style sequence shortcuts (G D, N B, ⇧ L, etc.)
- permission-gated via authStore.permissions

Task: wave-1/task-06"
git push
```

Append to `_progress.md`.
