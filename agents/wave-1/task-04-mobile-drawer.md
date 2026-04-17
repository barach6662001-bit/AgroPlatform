# Task 04 — Mobile Drawer Migration

**Goal:** Replace AntD `Drawer` in `MobileDrawer.tsx` with shadcn `Sheet`. Preserve UX (slide-in from left, full sidebar inside, closes on outside click and ESC).

**Depends on:** task-01 (new Sidebar must exist)

---

## Files to change

- **Replace:** `frontend/src/components/Layout/MobileDrawer.tsx` (AntD → shadcn)
- **Update:** `frontend/src/components/Layout/AppLayout.tsx` — wire the mobile trigger

---

## Step 1 — Rebuild MobileDrawer

Replace the contents of `frontend/src/components/Layout/MobileDrawer.tsx`:

```tsx
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Sidebar } from '@/components/shell/sidebar'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export function MobileDrawer() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Primary navigation menu
        </SheetDescription>
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
```

**Notes:**
- `SheetTitle` / `SheetDescription` marked `sr-only` for screen reader semantics without visible header (Radix Dialog requires a title, or it warns)
- The Sidebar inside is the same component from task-01; it will show expanded (collapsed mode is irrelevant in mobile drawer — drawer is already 260px wide)
- Auto-close on route change — standard mobile drawer pattern

---

## Step 2 — Hide the persistent Sidebar on mobile

Edit `frontend/src/components/Layout/AppLayout.tsx` (or the shell root):

```tsx
// The persistent sidebar — hidden on mobile, visible md+
<aside className="hidden md:block">
  <Sidebar />
</aside>

// The mobile drawer trigger — visible on mobile, hidden md+
<MobileDrawer />
```

In the topbar, place `<MobileDrawer />` at the very start (before TenantSwitcher), so the mobile hamburger appears top-left.

```tsx
// frontend/src/components/shell/topbar.tsx — update
export function Topbar() {
  return (
    <header className="flex h-11 items-center gap-3 border-b border-border-subtle bg-bg-base px-4">
      <MobileDrawer />
      <TenantSwitcher />
      <div className="hidden md:block h-5 w-px bg-border-subtle" />
      <div className="hidden md:block"><Breadcrumbs /></div>
      <div className="flex-1" />
      <SearchTrigger />
      <NotificationsPopover />
      <ThemeToggle />
      <div className="hidden md:block h-5 w-px bg-border-subtle" />
      <UserMenu />
    </header>
  )
}
```

(Breadcrumbs hidden on mobile — path is already in the page header.)

---

## Step 3 — Responsive spot-check

Use Playwright MCP to navigate to `/dashboard` at viewport widths:
- 375px (iPhone SE) → sidebar hidden, hamburger visible, breadcrumbs hidden
- 768px (iPad) → sidebar visible, breadcrumbs visible
- 1440px (desktop) → full shell visible

---

## Step 4 — Remove from AntD allowlist

Confirm:
```bash
grep -n "from 'antd'" frontend/src/components/Layout/MobileDrawer.tsx
# expect: no output
```

Remove the file from `.eslint-antd-allowlist.txt`.

---

## Acceptance criteria

- [ ] MobileDrawer opens on hamburger click
- [ ] Slides in from left
- [ ] Contains the full Sidebar
- [ ] Closes on outside click, ESC, or route change
- [ ] Hamburger hidden on viewports ≥ 768px
- [ ] Persistent Sidebar hidden on viewports < 768px
- [ ] Breadcrumbs hidden on viewports < 768px
- [ ] No AntD imports in MobileDrawer
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1/task-04-mobile-closed.png` (375px, drawer closed)
- `docs/screenshots/wave-1/task-04-mobile-open.png` (375px, drawer open)
- `docs/screenshots/wave-1/task-04-tablet.png` (768px, both visible)

---

## Git

```bash
git add frontend/src/components/Layout/MobileDrawer.tsx \
        frontend/src/components/shell/topbar.tsx \
        frontend/src/components/Layout/AppLayout.tsx \
        frontend/.eslint-antd-allowlist.txt \
        docs/screenshots/wave-1/

git commit -m "feat(shell): migrate mobile drawer to shadcn Sheet

- AntD Drawer -> shadcn Sheet (uses Radix Dialog under the hood)
- auto-close on route change
- breadcrumbs hidden on mobile (path shown in page header anyway)
- hamburger visible only < md breakpoint

Task: wave-1/task-04"
git push
```

Append to `_progress.md`.
