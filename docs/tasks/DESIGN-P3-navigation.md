# DESIGN-P3: Sidebar & Header Redesign

> Reference: `docs/design-system.md` section 2 (Sidebar, Header)
> Depends on: DESIGN-P1 completed
> Scope: Restyle sidebar and header. Do NOT change navigation structure or routes.

---

## Steps

### Step 12: Restyle Sidebar

Edit `frontend/src/components/Layout/Sidebar.tsx` and its CSS/styles.

**Structure changes (keep existing menu items, only restyle):**

- Width: 240px (update in Sidebar and AppLayout where sidebar width is defined)
- Background: #0A0E14 (solid dark)
- Right edge: box-shadow: 1px 0 0 0 rgba(255,255,255,0.04)
- Padding: 12px 8px

**Logo area (top):**
- Logo + "АгроTex" text: keep, but reduce to 24px logo, 16px text
- Subtitle "ПЛАТФОРМА УПРАВЛІННЯ": 9px uppercase, letter-spacing 0.08em, color var(--text-tertiary)
- Padding-bottom: 16px, border-bottom: 1px solid var(--border-default), margin-bottom: 8px

**Menu items:**
- Height: 36px
- Padding: 8px 12px
- Border-radius: 8px (for background on hover/active)
- Text: 13px, font-weight 400, color rgba(255,255,255,0.55)
- Icons: add Lucide icons 16px (stroke-width 1.5) to ALL top-level items:
  - Головна → `LayoutDashboard`
  - Поля → `Map`
  - Виробництво → `Factory`
  - Склад і логістика → `Warehouse`
  - Персонал → `Users`
  - Фінанси → `DollarSign` or `Banknote`
  - Аналітика → `BarChart3`
  - Налаштування → `Settings`
- Icon color: inherit from text color
- Gap between icon and text: 10px

**Hover state:**
- Background: rgba(255,255,255,0.04)
- Text color: rgba(255,255,255,0.85)
- Transition: 100ms ease

**Active state:**
- Background: rgba(34,197,94,0.08)
- Text color: #22C55E
- Font-weight: 500
- Left border: 2px solid #22C55E (on the item itself, not sidebar edge)
- Icon color: #22C55E

**Sub-items (Склади, Матеріали, Зерносховище, etc.):**
- Indent: padding-left 40px (icon width + gap + 12px)
- No icon, but add a small dot (4px circle) in the icon position, color var(--text-tertiary), active: #22C55E
- Text: 13px, color rgba(255,255,255,0.45)
- Active: color #22C55E, dot color #22C55E

**Group expand/collapse:**
- Chevron icon: 14px, right side, color var(--text-tertiary)
- Rotate 90deg when expanded, transition 200ms

**Section dividers:**
- Between major groups: 1px solid rgba(255,255,255,0.04), margin 8px 0

### Step 13: Restyle Sidebar Footer

Bottom of sidebar — user info area:

- Border-top: 1px solid var(--border-default)
- Padding: 12px
- Layout: horizontal flex
- Avatar: 28px circle, background var(--color-primary), color white, font-weight 600, font-size 11px, display user initials (e.g. "ДА" for demo@agro.local or "ОП" if name is set)
- Name/email: 13px, color var(--text-primary), truncate with ellipsis, max-width calc(100% - 44px)
- Role: 11px, color var(--text-tertiary)
- Name and role stacked vertically, gap 2px
- On hover: show tooltip with full email if truncated

### Step 14: Restyle Header

Edit `frontend/src/components/Layout/AppLayout.tsx` or wherever the header is defined.

**Dimensions:**
- Height: 48px
- Background: var(--color-page-bg) or transparent
- Border-bottom: 1px solid var(--border-default)
- Padding: 0 24px
- Flex layout: left (sidebar toggle) — center (search) — right (actions)

**Sidebar toggle button (hamburger):**
- 32×32px, icon-only, ghost style
- Icon: `Menu` from Lucide, 18px

**Search (center/left of actions):**
- Input-style element, NOT just text
- Default width: 240px
- On focus: expand to 400px with transition 200ms
- Background: var(--color-input-bg)
- Border: 1px solid var(--border-default)
- Border-radius: 8px
- Placeholder: "Пошук..." in 13px var(--text-tertiary)
- Right side inside input: `⌘K` badge — 18px height, padding 2px 6px, background rgba(255,255,255,0.06), border-radius 4px, font-size 11px, color var(--text-tertiary)
- On focus: border-color var(--color-primary)

**Right actions (keep existing, restyle):**
- Language switcher: compact, flag + "UA" text, 13px
- Theme toggle: icon-only button, 32×32, Sun/Moon from Lucide
- Notifications: icon-only button, 32×32, Bell from Lucide. If unread: red dot 6px positioned top-right
- Logout: icon-only button, 32×32, LogOut from Lucide. Color var(--text-secondary), hover var(--text-primary)
- Gap between action buttons: 4px
- Divider between groups: 1px solid var(--border-default), height 20px, margin 0 8px

---

## Verification

1. `npx tsc --noEmit` — pass
2. `npm run build` — pass
3. Sidebar: 240px wide, dark background, icons on all top-level items, green active state with left border
4. Header: 48px, search input expands on focus, action buttons are 32px icons
5. Sidebar footer: avatar circle with initials + name + role
