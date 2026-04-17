# TASK: Complete Product Redesign — Senior Designer Mindset

> Role: You are acting as a **Senior Product Designer and Information Architect** (Stripe/Linear/Notion level), not a code generator.
> Scope: Not a visual refresh. A complete rethink of navigation, information architecture, data presentation, and responsive behavior across the entire AgroPlatform application.
> Target: Take this from "functional MVP" to a product that a $10M-revenue agroholding CEO would use daily on both desktop and mobile.

---

## Context for You (Read First)

**Current state problems identified from user review:**
1. Navigation bloat — 8 top-level sidebar sections with nested submenus, total ~25+ pages, most users don't need half of them
2. Data bugs carried through — Sales KPI still shows "5" instead of sum, Audit log shows raw UUIDs
3. No mobile adaptation — tables overflow, sidebar doesn't collapse, touch targets too small
4. Visual polish applied but structure wasn't rethought — it "looks modern" but flow is still the same cluttered admin panel
5. Too many separate analytics pages doing overlapping things (Cost Analytics, Field PnL, Budget, Marginality, Season Comparison, Break-Even — all show variations of same data)

**What "good" means for this product:**
- A farm manager opens the app on mobile in the field → sees critical info immediately
- An accountant opens on desktop → has deep tools without menu hunting
- An owner/CEO opens on tablet → understands business health in 10 seconds

---

## Phase 0: Information Architecture Rethink

**Before writing a single line of code, propose the new structure.**

Take the current 8-section sidebar with ~25 pages and consolidate into **4-5 core sections** with logical grouping. Your proposal should explain reasoning for each decision.

### Current sidebar (problems marked):

```
- Головна
- Поля
  - Поля
  - Поради по сівозміні        ← why separate? move into Field detail
- Виробництво
  - Операції
  - Техніка
  - Карта парку                 ← merge into Machinery as tab
- Склад і логістика
  - Склади
  - Матеріали
  - Зерносховище
  - Паливна станція
  - Рух запасів                 ← why separate? show in Materials
  - Інвентаризація
  - Імпорт                      ← move to Materials as action button
- Персонал
  - Співробітники
  - Табель
  - Зарплата
- Фінанси
  - Витрати
  - P&L по полях                ← merge with Analytics
  - Бюджет
  - Орендні платежі             ← merge into Fields as financial tab
  - Продажі
- Аналітика
  - Аналітика витрат            ← duplicate of Фінанси/Витрати
  - Маржинальність              ← overlaps with P&L
  - Порівняння сезонів
  - Точка беззбитковості
  - Ефективність полів
  - Зарплати і пальне
  - Споживання ресурсів
- Налаштування (6 subpages)
```

### Proposed new structure (adjust as needed, justify choices):

```
🏠 Огляд               — Dashboard (single page, smart widgets)
🌾 Поля                — Fields with integrated map, PnL, crop rotation tabs
⚙️  Операції           — Operations + Machinery + Fuel (unified "work log" concept)
📦 Склад               — Single warehouse page with tabs: stock / movements / inventory / import
💰 Фінанси             — Unified finance: costs, sales, budget, ALL analytics as tabs/filters
👥 Команда             — HR combined: employees + timesheet + salary
⚙️  Налаштування       — Collapsed system settings (only visible to admins)
```

**Rules for consolidation:**
- If two pages show the same data with different filters → one page with filter toggle
- If a page has <5 items always → inline into parent as a widget
- Analytics pages multiply like rabbits — all analytics lives under "Фінанси" tab "Аналітика" with a smart query builder
- Never more than 2 levels of nesting

**Output format:** Write the proposal as `docs/IA-PROPOSAL.md` FIRST. Wait for no one — commit the proposal and continue. It's a living document for you to follow through subsequent phases.

---

## Phase 1: Fix Critical Data Bugs (Parallel to Design Work)

Use the **postgres MCP** to inspect actual data. Fix:

1. **Sales KPI bug** — find `frontend/src/pages/Sales/SalesList.tsx` (or wherever Sales KPIs render). Currently "Загальна сума продажів" shows row count (5) instead of SUM(amount). Debug in postgres MCP:
   ```sql
   SELECT SUM(amount), COUNT(*), AVG(amount) FROM "Sales" WHERE "TenantId" = 'aaaaaaaa-...';
   ```
   Then fix the aggregation logic in frontend/backend so it shows real 5,382,000 UAH.

2. **Audit log UUID → user name** — join with Users table. If frontend can't easily join, add backend endpoint that returns AuditLog with user.email included. Update column render to show email + role instead of UUID.

3. **Dashboard sparklines empty** — the financial chart on dashboard shows only red line, green missing. Use postgres MCP to verify CostRecords and Sales data exists for chart date range, then fix the query or chart data mapping.

4. **Demo user profile shows "—"** — seed realistic name "Олександр Петренко" in backend, or handle empty state in frontend with fallback to email.

Commit each fix separately with clear messages. Use postgres MCP liberally to verify data state before and after.

---

## Phase 2: Responsive Foundation

Before redesigning any page, establish responsive infrastructure.

**Create `frontend/src/hooks/useBreakpoint.ts`:**
```typescript
// Returns: 'mobile' (<640), 'tablet' (640-1024), 'desktop' (>1024)
// Use throughout app for conditional rendering
```

**Create responsive layout shell `frontend/src/components/Layout/AppShell.tsx`:**
- Desktop (>1024px): sidebar always visible, 240px width, content beside
- Tablet (640-1024): sidebar collapsed by default to icon-only, expand on hover
- Mobile (<640): sidebar hidden off-canvas, hamburger button in header opens drawer

**Header becomes adaptive:**
- Desktop: full width with search expanded, all icons visible
- Mobile: compact — hamburger + logo + notification bell only, search moves to dedicated page or bottom modal

**Sidebar mobile behavior:**
- Slides in from left as drawer
- Backdrop blur overlay
- Close on route change OR backdrop tap
- Includes language switcher + user menu inside (no header clutter on mobile)

**Tables responsive strategy** (critical — tables are everywhere):
- Desktop: full table as today
- Tablet: hide 2-3 less critical columns
- Mobile: transform each row into a card with primary info prominent, secondary info in collapsible "Детальніше" section

Apply this strategy via new `PremiumTable` component that takes `columns` with `mobilePriority: 'primary' | 'secondary' | 'hide'` metadata.

Commit as: `feat(responsive): establish breakpoint system and adaptive shell`

---

## Phase 3: Execute New IA

Apply the IA from Phase 0. This is real refactoring — moving routes, combining pages, killing duplicates.

**For each consolidation:**

1. **Create new unified page** (e.g., `frontend/src/pages/Warehouse/WarehousePage.tsx` with tabs)
2. **Migrate functionality** from old pages as tab contents (not as separate iframes — real integration)
3. **Update routes in App.tsx** — new unified routes, add redirects from old URLs to new (preserve bookmarks)
4. **Update sidebar menu** to reflect new structure
5. **Delete orphaned pages** once migrated and all links updated
6. **Update i18n keys** to match new structure

**Example — Finance consolidation:**

BEFORE: 6 separate pages (Витрати, Продажі, Бюджет, P&L, Орендні, Аналітика*6)

AFTER: Single `/finance` page with top-level tabs:
- **Огляд** — summary dashboard with key metrics
- **Витрати** — cost records list with inline analytics sidebar
- **Продажі** — sales list with revenue breakdown
- **Бюджет** — plan vs fact with categories
- **Аналітика** — flexible analytics with dimension selector (by crop / by field / by month / by category / by season) — this ONE page replaces 6 old analytics pages

Each tab deep-links (`/finance?tab=sales`) so bookmarks work.

Commit each section consolidation separately:
- `refactor(fields): unify field pages with integrated map and tabs`
- `refactor(warehouse): consolidate 6 warehouse pages into tabbed UI`
- `refactor(finance): merge all financial pages and analytics`
- `refactor(ops): combine operations, machinery, fuel into operations hub`
- `refactor(team): consolidate HR pages`

---

## Phase 4: Dashboard Reimagined (The 10-Second Test)

A CEO opens dashboard on their phone at 6am. They need to know in 10 seconds:
- How is the business doing this season?
- Anything critical that needs my attention today?
- What's my next action?

**Current dashboard fails this test** — 4 static KPI, a broken chart, a table, a timeline. Information without hierarchy.

**New dashboard structure:**

### Top hero section (above the fold, mobile first)

**Desktop/Tablet:**
```
[SEASON HEALTH SCORE — big gradient card]
│  Сезон 2026 · День 108/365                              │
│                                                         │
│  Фінансовий стан: 🟢 Добрий                             │
│  Прибуток 4.31 млн ₴ · Маржа 80.1% · На 12% вище плану  │
│                                                         │
│  [3 action items needing attention →]                   │
```

**Mobile:**
```
┌────────────────────────┐
│ Сезон 2026 · День 108  │
│                        │
│ 🟢 Добрий              │
│                        │
│ Прибуток               │
│ 4.31 млн ₴             │
│ ↑ 12% вище плану       │
│                        │
│ [ 3 задачі на сьогодні→]│
└────────────────────────┘
```

### Action items strip (new — replaces generic "alerts")

Smart list: 3-5 personalized action cards. Not "1 unit under repair" — but "Трактор МТЗ-82 на ремонті 3 дні, впливає на сівбу на Балка-5".

### Metrics in context

Below hero, 4 compact metric cards — each with sparkline AND link to where to drill down. Clicks take you to the right subpage with pre-filtered data.

### Field map preview

Small interactive map (250px height on mobile, 400px desktop) — when you tap a field polygon, you jump to full field page.

### Recent activity feed

Timeline of last 5 activities across entire farm (operations, sales, field changes). Each item clickable, shows user who did it.

**Remove from dashboard:**
- "Стан полів" table — belongs in Fields page as list view
- Static "Quick actions" strip — all actions are contextual on respective pages

Commit: `feat(dashboard): reimagined with season health, action items, adaptive layout`

---

## Phase 5: Visual Language Consistency

With IA settled and pages rebuilt, apply consistent visual language.

Use **magic MCP** to generate these foundational components (they'll be reused everywhere):

1. **StatCard** — KPI card with label, value, delta, sparkline, click action. 5 variants: hero, default, compact, inline, mobile-card.
2. **DataTable** — Responsive table with mobile card mode (from Phase 2).
3. **Chart wrappers** — PremiumArea, PremiumBar, PremiumDonut, PremiumSparkline. All use shared theme (navy bg, horizontal dashed grid, gradient fills, dark tooltips).
4. **PageHeader** — Title + breadcrumbs + actions bar + tabs. Used on every page.
5. **TabNav** — Tab strip used on Fields, Warehouse, Finance, etc.
6. **FilterBar** — Standardized filters above any list (search + date range + select filters).
7. **EmptyState** — Consistent empty placeholder for all lists/charts.
8. **Skeleton** — Loading skeletons for all data-dependent components.

All components share:
- Dark navy palette (`--bg-page: #060B14`, `--bg-card: #0C1222`)
- Green primary `#22C55E`
- Crop-colored accents for agro-specific data
- Framer Motion entrances (200ms stagger)
- Touch-friendly (44px min touch targets)
- Keyboard-navigable (tab order, focus rings)

**Roll out across app:**
After components are generated, systematically replace old Ant Design implementations on each page. Commit per page type:
- `refactor(ui): apply StatCard everywhere`  
- `refactor(ui): apply DataTable across all list pages`
- `refactor(ui): apply chart wrappers across all analytics`
- ...

---

## Phase 6: Mobile First Polish

At this point app should work on mobile — but "works" ≠ "great".

**Audit via playwright MCP on mobile viewport (375px):**
1. Open each main page on mobile viewport
2. Screenshot
3. Identify issues: overflow, cramped text, unusable touch targets, horizontal scroll, hidden content

**Fix issues systematically:**
- Font sizes: minimum 14px on mobile, never smaller
- Touch targets: minimum 44x44px for all clickable
- Spacing: more generous on mobile, tighter on desktop
- Cards: full-width on mobile, grid on tablet, multi-column on desktop
- Modals: full-screen on mobile, centered card on desktop
- Forms: stack fields on mobile, side-by-side on desktop
- Long text: truncate with ellipsis + tooltip on mobile

Commit: `feat(mobile): comprehensive mobile UX audit and fixes`

---

## Phase 7: Final Verification

Use **playwright MCP** to systematically screenshot EVERY page on 3 viewports:
- Mobile (375px)
- Tablet (768px)
- Desktop (1440px)

Save to `/tmp/redesign-screenshots/` organized by viewport.

Check:
- [ ] No horizontal scroll anywhere
- [ ] All text readable (contrast ratio > 4.5:1 for body, > 3:1 for large)
- [ ] All buttons/links have hover + focus states
- [ ] All forms validate and show errors clearly
- [ ] All empty states show custom message + CTA
- [ ] All loading states show skeleton, not blank screen
- [ ] No data bugs (KPI values correct, UUIDs resolved to names)
- [ ] Sidebar works on all 3 viewports
- [ ] All routes from old IA redirect to new IA

Create checklist `docs/REDESIGN-VERIFICATION.md` and document results per page.

---

## Phase 8: PR and Merge

```bash
git push origin feat/full-redesign-v2
gh pr create --base main \
  --title "refactor: complete product redesign — IA overhaul, responsive, data fixes" \
  --body "See docs/IA-PROPOSAL.md for architecture decisions. See docs/REDESIGN-VERIFICATION.md for per-page verification."

# Wait CI. Merge.
```

---

## Rules of Engagement

**You have these MCP tools — use them:**
- `magic` — generate premium UI components (but adapt, don't use raw output)
- `postgres` — verify real data state before and after changes
- `playwright` — screenshot everything for visual verification
- `context7` — look up latest React/Ant/Recharts/Tailwind patterns

**Think like a designer:**
- Before writing code, sketch what changes in prose. What's the hierarchy? What's primary vs secondary?
- Kill features aggressively. Less is more. If a page has <20 users, consider deleting it.
- Every interaction should have a clear path. No dead ends.
- Mobile is not a demotion — on farms, mobile is the primary device.

**Think like an information architect:**
- Group by user intent ("I want to know finances") not by database table ("I'll show you Costs, Sales, Budget as separate pages")
- Navigation depth: 2 max. Users shouldn't dig 3 clicks to find anything.
- Analytics is a cross-cutting concern — one flexible analytics view, not 6 fixed ones.

**Think like a developer:**
- Preserve all business logic, stores, API calls, permissions, multi-tenancy
- Don't break existing URLs — redirect from old paths to new
- Commit often with clear messages
- Each phase is its own commit set

**Think like a product manager:**
- After each phase, ask: "Does this make the product better for a real farmer using it at 6am on their phone in the field?"
- If yes → ship. If no → rethink.

---

## Execution

Work through phases 0 → 8 sequentially. Commit after each phase (or after each logical sub-task in big phases). Do not ask for confirmation. If a phase requires significant decisions (like IA proposal), make them and document your reasoning.

Start now. Target finish: one comprehensive PR merged into main.
