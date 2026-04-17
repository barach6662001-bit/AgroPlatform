# Task 07 — Keyboard Shortcuts Modal

**Goal:** Build the modal from `WIREFRAMES.md §7`. Opens on `⌘/`. Lists every shortcut from the command registry. Replaces any scattered keyboard-hint docs.

**Depends on:** task-06 (command registry is the source of shortcuts)

---

## Files to change

- **New:** `frontend/src/components/shell/keyboard-shortcuts-dialog.tsx`
- **New:** `frontend/src/components/ui/kbd.tsx` — styled keyboard key primitive
- **Update:** `frontend/src/App.tsx` — mount the dialog at app root

---

## Step 1 — Kbd primitive

Create `frontend/src/components/ui/kbd.tsx`:

```tsx
import { cn } from '@/lib/utils'

export function Kbd({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn(
      'inline-flex items-center justify-center rounded border border-border-subtle',
      'bg-bg-base px-1.5 py-0.5 font-mono text-2xs font-medium text-fg-secondary',
      'shadow-sm min-w-[20px] h-5',
      className,
    )}>
      {children}
    </kbd>
  )
}

// Helper: split "G D" into separate kbd boxes
export function KbdSequence({ sequence }: { sequence: string }) {
  const parts = sequence.split(/\s+/).filter(Boolean)
  return (
    <div className="inline-flex items-center gap-0.5">
      {parts.map((p, i) => <Kbd key={i}>{p}</Kbd>)}
    </div>
  )
}
```

---

## Step 2 — Dialog component

Create `frontend/src/components/shell/keyboard-shortcuts-dialog.tsx`:

```tsx
import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { KbdSequence } from '@/components/ui/kbd'
import { commands } from '@/lib/command-registry'
import { useAuthStore } from '@/store/authStore'

const SECTION_LABELS: Record<string, string> = {
  general: 'General',
  navigate: 'Navigate',
  action: 'Create',
  switch: 'Switch',
  help: 'Help',
}

// Static general shortcuts that aren't commands
const GENERAL_SHORTCUTS = [
  { label: 'Open command palette', shortcut: '⌘ K' },
  { label: 'Show this panel',     shortcut: '⌘ /' },
  { label: 'Toggle sidebar',      shortcut: '[' },
]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)
  const permissions = useAuthStore((s) => s.permissions ?? [])

  // Listen for ⌘/ and custom event from user menu + command palette
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey
      if (isMeta && e.key === '/') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    const handleEvent = () => setOpen(true)
    window.addEventListener('keydown', handleKey)
    window.addEventListener('open-keyboard-shortcuts', handleEvent)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('open-keyboard-shortcuts', handleEvent)
    }
  }, [])

  const shortcuts = commands.filter(
    (c) => c.shortcut && (!c.permission || permissions.includes(c.permission))
  )

  const grouped: Record<string, { label: string; shortcut: string }[]> = {
    general: GENERAL_SHORTCUTS,
    navigate: [],
    action: [],
    switch: [],
    help: [],
  }
  shortcuts.forEach((c) => {
    if (!c.shortcut) return
    const key = c.category === 'contextual' || c.category === 'recent' ? 'general' : c.category
    grouped[key]?.push({ label: c.label, shortcut: c.shortcut })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Navigate and act without touching the mouse.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-5 overflow-y-auto">
          {Object.entries(grouped).map(([key, items]) => {
            if (items.length === 0) return null
            return (
              <section key={key}>
                <h3 className="mb-2 text-2xs font-medium uppercase tracking-wide text-fg-tertiary">
                  {SECTION_LABELS[key] ?? key}
                </h3>
                <div className="space-y-1">
                  {items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 rounded px-2 py-1 hover:bg-bg-muted">
                      <span className="text-sm text-fg-secondary">{it.label}</span>
                      <KbdSequence sequence={it.shortcut} />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Step 3 — Mount at app root

In `frontend/src/App.tsx`:

```tsx
import { KeyboardShortcutsDialog } from '@/components/shell/keyboard-shortcuts-dialog'
// ...
<ThemeProvider>
  <ThemeBridge />
  <CommandPalette />
  <KeyboardShortcutsDialog />
  <RouterProvider router={router} />
</ThemeProvider>
```

---

## Acceptance criteria

- [ ] `⌘/` / `Ctrl+/` from anywhere opens the modal
- [ ] User menu → "Keyboard shortcuts" also opens it (event-driven)
- [ ] Command palette → "Keyboard shortcuts" also opens it
- [ ] ESC closes
- [ ] Lists General / Navigate / Create / Switch / Help sections
- [ ] Only sections with visible shortcuts are rendered
- [ ] Shortcuts right-aligned with styled `Kbd` components
- [ ] Permission-gated shortcuts hidden if user lacks permission
- [ ] Empty sections not rendered

---

## Playwright screenshots

- `docs/screenshots/wave-1/task-07-shortcuts-light.png`
- `docs/screenshots/wave-1/task-07-shortcuts-dark.png`

---

## Git

```bash
git add frontend/src/components/shell/keyboard-shortcuts-dialog.tsx \
        frontend/src/components/ui/kbd.tsx \
        frontend/src/App.tsx \
        docs/screenshots/wave-1/

git commit -m "feat(shell): keyboard shortcuts modal (⌘/) driven by command registry

- Kbd + KbdSequence primitives
- dialog auto-populated from lib/command-registry
- permission-gated entries hidden
- opens via hotkey OR event (user menu, command palette)

Task: wave-1/task-07"
git push
```

Append to `_progress.md`.
