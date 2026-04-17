# Task 03 — User Menu with Preferences

**Goal:** Build a proper user menu matching `WIREFRAMES.md §4`: profile, inline Appearance / Density / Language controls, What's new, Keyboard shortcuts link, help, and sign out.

**Depends on:** task-02 (topbar stub replaced)

---

## Files to change

- **Replace:** `frontend/src/components/shell/user-menu.tsx` (currently a stub)
- **New:** `frontend/src/components/shell/density-toggle.tsx` — reusable density toggle
- **New:** `frontend/src/components/shell/language-switcher.tsx` — EN/UK switcher
- **New:** `frontend/src/components/shell/whats-new-dialog.tsx` — changelog modal
- **New:** `frontend/src/data/changelog.json` — static changelog entries
- **Update:** `frontend/src/store/preferencesStore.ts` — already has density from task-01
- **Update:** `frontend/src/styles/tokens.css` — add `[data-density]` rules

---

## Step 1 — Density CSS variable bindings

Edit `frontend/src/styles/tokens.css`. Inside `:root`, add the active density vars:

```css
:root {
  /* ... existing ... */

  /* Active density — switched by [data-density] attribute on <html> */
  --density-row-active: var(--density-row-compact);
  --density-input-active: var(--density-input-compact);
  --density-sidebar-item-active: 28px;
}

[data-density="comfortable"] {
  --density-row-active: var(--density-row-comfortable);
  --density-input-active: var(--density-input-comfortable);
  --density-sidebar-item-active: 32px;
}
```

---

## Step 2 — Density toggle component

Create `frontend/src/components/shell/density-toggle.tsx`:

```tsx
import { usePreferencesStore, type Density } from '@/store/preferencesStore'

export function DensityToggle() {
  const density = usePreferencesStore((s) => s.density)
  const setDensity = usePreferencesStore((s) => s.setDensity)

  return (
    <div className="flex items-center gap-1 rounded border border-border-subtle bg-bg-base p-0.5">
      <button
        onClick={() => setDensity('compact')}
        className={pill(density === 'compact')}
      >
        Compact
      </button>
      <button
        onClick={() => setDensity('comfortable')}
        className={pill(density === 'comfortable')}
      >
        Comfortable
      </button>
    </div>
  )
}

const pill = (active: boolean) =>
  `rounded-sm px-2 py-0.5 text-2xs font-medium transition-colors ${
    active
      ? 'bg-accent-solid text-accent-fg'
      : 'text-fg-secondary hover:text-fg-primary'
  }`
```

---

## Step 3 — Language switcher

Check how i18n is set up. Most likely `react-i18next` with `i18n.changeLanguage()`. Create `frontend/src/components/shell/language-switcher.tsx`:

```tsx
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'uk', label: 'Українська', short: 'UK' },
]

export function LanguageSwitcher({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1 rounded border border-border-subtle bg-bg-base p-0.5">
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`rounded-sm px-2 py-0.5 text-2xs font-medium transition-colors ${
            i18n.resolvedLanguage === lang.code
              ? 'bg-accent-solid text-accent-fg'
              : 'text-fg-secondary hover:text-fg-primary'
          }`}
        >
          {variant === 'full' ? lang.label : lang.short}
        </button>
      ))}
    </div>
  )
}
```

If i18n library differs, adapt. If no i18n at all, create a follow-up note and stub with `useState`.

---

## Step 4 — Theme selector inline (reuse existing)

We already have `theme-toggle.tsx` from Phase 0 which opens a dropdown. For the inline selector inside the user menu, create a smaller variant. Inside `user-menu.tsx` (next step) we'll inline a 3-button group: Light / Dark / System.

---

## Step 5 — Changelog data + dialog

Create `frontend/src/data/changelog.json`:

```json
[
  {
    "id": "2026-04-17-wave-1",
    "date": "2026-04-17",
    "title": "New app shell",
    "body": "Redesigned sidebar, topbar, and command palette. Faster, denser, enterprise-ready.",
    "category": "redesign"
  },
  {
    "id": "2026-04-17-command-palette",
    "date": "2026-04-17",
    "title": "Command palette (⌘K)",
    "body": "Jump anywhere or trigger any action from keyboard. Try pressing ⌘K.",
    "category": "feature"
  },
  {
    "id": "2026-04-17-keyboard-shortcuts",
    "date": "2026-04-17",
    "title": "Keyboard shortcuts",
    "body": "Press ⌘/ to see the full list. Start with G D for dashboard.",
    "category": "feature"
  }
]
```

Create `frontend/src/components/shell/whats-new-dialog.tsx`:

```tsx
import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import changelog from '@/data/changelog.json'

const SEEN_KEY = 'changelog-seen-ids'

export function useUnreadChangelog() {
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    const seen = new Set<string>(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]'))
    setUnread(changelog.filter((e) => !seen.has(e.id)).length)
  }, [])
  return unread
}

export function WhatsNewDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  useEffect(() => {
    if (!open) return
    // Mark all as seen when dialog opens
    const ids = changelog.map((e) => e.id)
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids))
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>What's new</DialogTitle>
          <DialogDescription>
            Recent updates to AgroPlatform
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {changelog.map((entry) => (
            <div key={entry.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-2xs">
                  {entry.category}
                </Badge>
                <span className="text-xs text-fg-tertiary">{entry.date}</span>
              </div>
              <h3 className="font-medium text-sm">{entry.title}</h3>
              <p className="text-sm text-fg-secondary">{entry.body}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Step 6 — Main UserMenu component

Replace `frontend/src/components/shell/user-menu.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  User, Settings, Sparkles, Keyboard, BookOpen, MessageSquare, LogOut, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DensityToggle } from './density-toggle'
import { LanguageSwitcher } from './language-switcher'
import { WhatsNewDialog, useUnreadChangelog } from './whats-new-dialog'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const [whatsNewOpen, setWhatsNewOpen] = useState(false)
  const navigate = useNavigate()
  const unread = useUnreadChangelog()

  const user = useAuthStore((s) => s.user)
  const currentTenant = useAuthStore((s) => s.currentTenant)
  const logout = useAuthStore((s) => s.logout)

  const { theme, setTheme } = useTheme()

  if (!user) return null

  const initials = (user.name ?? user.email ?? '??').slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await logout?.()
    toast.success('Signed out')
    navigate('/login')
  }

  const openShortcuts = () => {
    setOpen(false)
    // Dispatch a global event that task-07 listens to
    window.dispatchEvent(new Event('open-keyboard-shortcuts'))
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 pr-1.5 pl-1"
            aria-label="User menu"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-2xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-xs">{initials}</span>
            {unread > 0 && (
              <span className="h-1.5 w-1.5 rounded-pill bg-accent-solid" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="end">
          <div className="border-b border-border-subtle p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user.name ?? 'User'}</div>
                <div className="truncate text-2xs text-fg-tertiary">{user.email}</div>
                {currentTenant && user.role && (
                  <div className="truncate text-2xs text-fg-tertiary">
                    {user.role} · {currentTenant.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-1">
            <MenuItem icon={User} label="Profile" onClick={() => { setOpen(false); navigate('/profile') }} />
            <MenuItem icon={Settings} label="Preferences" onClick={() => { setOpen(false); navigate('/settings/preferences') }} />
          </div>

          <div className="border-t border-border-subtle p-2 space-y-2">
            <div className="px-2">
              <div className="mb-1 text-2xs font-medium uppercase tracking-wide text-fg-tertiary">Appearance</div>
              <div className="flex items-center gap-1 rounded border border-border-subtle p-0.5">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 rounded-sm px-2 py-0.5 text-2xs capitalize font-medium transition-colors ${
                      theme === t ? 'bg-accent-solid text-accent-fg' : 'text-fg-secondary hover:text-fg-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-2">
              <div className="mb-1 text-2xs font-medium uppercase tracking-wide text-fg-tertiary">Density</div>
              <DensityToggle />
            </div>
            <div className="px-2">
              <div className="mb-1 text-2xs font-medium uppercase tracking-wide text-fg-tertiary">Language</div>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="border-t border-border-subtle p-1">
            <MenuItem
              icon={Sparkles}
              label="What's new"
              trailing={unread > 0 ? <Badge variant="outline" className="text-2xs h-4">{unread}</Badge> : undefined}
              onClick={() => { setOpen(false); setWhatsNewOpen(true) }}
            />
            <MenuItem icon={Keyboard} label="Keyboard shortcuts" shortcut="⌘ /" onClick={openShortcuts} />
            <MenuItem icon={BookOpen} label="Help & docs" onClick={() => { setOpen(false); window.open('https://docs.agroplatform.com', '_blank') }} />
            <MenuItem icon={MessageSquare} label="Contact support" onClick={() => { setOpen(false); window.open('mailto:support@agroplatform.com') }} />
          </div>

          <div className="border-t border-border-subtle p-1">
            <MenuItem icon={LogOut} label="Sign out" shortcut="⌘ Q" onClick={handleSignOut} destructive />
          </div>
        </PopoverContent>
      </Popover>

      <WhatsNewDialog open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />
    </>
  )
}

function MenuItem({
  icon: Icon, label, shortcut, trailing, onClick, destructive,
}: {
  icon: any
  label: string
  shortcut?: string
  trailing?: React.ReactNode
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
        destructive
          ? 'text-danger hover:bg-danger-subtle'
          : 'text-fg-secondary hover:bg-bg-muted hover:text-fg-primary'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {trailing}
      {shortcut && <span className="font-mono text-2xs text-fg-tertiary">{shortcut}</span>}
    </button>
  )
}
```

---

## Step 7 — Apply density data-attribute on load

In `frontend/src/main.tsx` (or wherever the app bootstraps), before rendering:

```tsx
import { usePreferencesStore } from '@/store/preferencesStore'

// After Zustand rehydration, apply initial density
const applyInitialDensity = () => {
  const density = usePreferencesStore.getState().density
  document.documentElement.dataset.density = density
}
applyInitialDensity()
```

The `onRehydrateStorage` hook in `preferencesStore` already handles this; this is a safety net for when that callback doesn't fire (SSR, first visit).

---

## Acceptance criteria

- [ ] User menu opens on click, shows avatar + name + email + role
- [ ] Appearance selector swaps theme instantly (Light / Dark / System)
- [ ] Density selector swaps table row heights without page reload
- [ ] Language switcher changes i18n locale (verify one label in sidebar switches to Ukrainian)
- [ ] What's new dialog opens, lists entries from changelog.json, marks as seen on close
- [ ] Keyboard shortcuts item dispatches window event `open-keyboard-shortcuts`
- [ ] Sign out clears auth state + navigates to /login + toasts "Signed out"
- [ ] Dot indicator on user menu appears only if unread changelog entries exist
- [ ] `npm run build` passes, `npm run lint` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1/task-03-user-menu-light.png` (menu open)
- `docs/screenshots/wave-1/task-03-user-menu-dark.png` (menu open)
- `docs/screenshots/wave-1/task-03-whats-new-dialog.png`
- `docs/screenshots/wave-1/task-03-density-comfortable.png` (table after density swap)

---

## Git

```bash
git add frontend/src/components/shell/user-menu.tsx \
        frontend/src/components/shell/density-toggle.tsx \
        frontend/src/components/shell/language-switcher.tsx \
        frontend/src/components/shell/whats-new-dialog.tsx \
        frontend/src/data/changelog.json \
        frontend/src/styles/tokens.css \
        frontend/src/main.tsx \
        docs/screenshots/wave-1/

git commit -m "feat(shell): user menu with inline preferences + what's new

- appearance (light/dark/system), density (compact/comfortable), language (EN/UK) — all inline
- changelog dialog driven by data/changelog.json, unread badge on user menu
- density toggle drives [data-density] attribute + CSS var swap
- keyboard shortcuts entry opens modal (task-07)
- sign out clears auth + toasts + redirects

Task: wave-1/task-03"
git push
```

Append to `_progress.md`.
