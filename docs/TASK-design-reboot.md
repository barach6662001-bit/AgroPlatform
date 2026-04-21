# TASK: Design Reboot — Navy Theme + Visual Vibrancy

> The previous design implementation used pure gray backgrounds (#0a0a0a, #111111) which looks like a 2010 admin panel.
> This task replaces ALL grays with navy-tinted blues for a modern premium SaaS look.
> This is the single most impactful visual change possible.
> Do not ask for confirmation. Execute all sections, commit after each.

---

## Section 1: Replace Gray Theme with Navy

Edit `frontend/src/theme/darkTheme.ts`. Replace ALL gray hex values with navy-tinted equivalents:

**Color mapping (gray → navy):**

| OLD (gray) | NEW (navy) | Usage |
|---|---|---|
| `#0a0a0a` | `#060B14` | Page background |
| `#111111` | `#0C1222` | Sidebar, cards, containers |
| `#1a1a1a` | `#111A2E` | Elevated surfaces, inputs, hover |
| `#242424` | `#1A2540` | Active states, tooltips |
| `#2a2a2a` | `#1E2A45` | Borders primary |
| `#383838` | `#253350` | Borders secondary, stronger |

Apply this mapping to EVERY occurrence in `darkTheme.ts`. This includes all component overrides (Layout, Menu, Card, Table, Button, Input, Select, Modal, Drawer, Dropdown, Tooltip, Pagination, Badge, Tag, Divider, DatePicker, Notification, Message).

Specific changes:
```typescript
export const darkTheme: ThemeConfig = {
  token: {
    colorBgBase:          '#060B14',
    colorBgContainer:     '#0C1222',
    colorBgElevated:      '#111A2E',
    colorBgLayout:        '#060B14',
    colorBgSpotlight:     '#111A2E',
    colorBorder:          '#1E2A45',
    colorBorderSecondary: '#253350',
    // ... rest stays the same
  },
  components: {
    Layout: {
      siderBg:      '#0C1222',
      headerBg:     '#0C1222',
      bodyBg:       '#060B14',
      triggerBg:    '#1A2540',
      triggerColor: '#a1a1a1',
    },
    Menu: {
      darkItemBg:        '#0C1222',
      darkSubMenuItemBg: '#0C1222',
      darkItemHoverBg:   '#1A2540',
      // ... rest stays the same
    },
    Card: {
      colorBgContainer:     '#0C1222',
      colorBorderSecondary: '#1E2A45',
      // ...
    },
    Table: {
      colorBgContainer: 'transparent',
      headerBg:           '#0C1222',
      rowHoverBg:         '#111A2E',
      borderColor:        '#1E2A45',
      // ...
    },
    Button: {
      defaultBg:          '#111A2E',
      defaultBorderColor: '#253350',
      defaultHoverBg:     '#1A2540',
      // ...
    },
    Input: {
      colorBgContainer: '#111A2E',
      colorBorder:      '#253350',
      // ...
    },
    Select: {
      colorBgContainer: '#111A2E',
      colorBorder:      '#253350',
      optionActiveBg:   '#1A2540',
      colorBgElevated:  '#0C1222',
      // ...
    },
    // Apply same pattern to ALL components...
    Modal:        { colorBgElevated: '#0C1222', colorBorder: '#1E2A45' },
    Drawer:       { colorBgElevated: '#0C1222' },
    Dropdown:     { colorBgElevated: '#0C1222', controlItemBgHover: '#1A2540' },
    Tooltip:      { colorBgSpotlight: '#1A2540' },
    Pagination:   { colorBgContainer: '#111A2E' },
    Badge:        { colorBgContainer: '#0C1222' },
    Tag:          { defaultBg: '#1A2540' },
    Divider:      { colorSplit: '#1E2A45' },
    DatePicker:   { colorBgContainer: '#111A2E', colorBorder: '#253350', colorBgElevated: '#0C1222' },
    Notification: { colorBgElevated: '#0C1222' },
    Message:      { colorBgElevated: '#0C1222' },
  },
};
```

Also update any CSS files that hardcode gray values. Search across the entire frontend:
```bash
grep -r "#0a0a0a\|#111111\|#1a1a1a\|#242424\|#2a2a2a\|#383838" frontend/src/ --include="*.css" --include="*.tsx" --include="*.ts" -l
```
Replace all found occurrences with the navy equivalents.

Update Login page CSS if it has hardcoded backgrounds — the login background should be `#060B14`.

### Verification:
```bash
cd frontend && npx tsc --noEmit && npm run build
git add -A && git commit -m "feat(ui): navy theme — replace all gray backgrounds with blue-tinted navy"
```

---

## Section 2: Brighter Accent Colors + Tag Vibrancy

The current accent colors are technically correct but too muted against the dark background. Make them POP.

### Tag/Badge colors — make vibrant

Find where crop culture tags are rendered (FieldsList, Dashboard "Стан полів"). The tags should use bright, saturated colors with higher contrast backgrounds.

Create or update a utility for crop tag colors in the appropriate file:

```typescript
export const cropTagColors: Record<string, { bg: string; text: string; border: string }> = {
  'Пшениця':  { bg: 'rgba(251, 191, 36, 0.15)',  text: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
  'Соняшник': { bg: 'rgba(249, 115, 22, 0.15)',  text: '#F97316', border: 'rgba(249, 115, 22, 0.3)' },
  'Кукурудза':{ bg: 'rgba(34, 197, 94, 0.15)',   text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
  'Ріпак':    { bg: 'rgba(168, 85, 247, 0.15)',   text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
  'Ячмінь':   { bg: 'rgba(14, 165, 233, 0.15)',   text: '#0EA5E9', border: 'rgba(14, 165, 233, 0.3)' },
  'Соя':      { bg: 'rgba(20, 184, 166, 0.15)',   text: '#14B8A6', border: 'rgba(20, 184, 166, 0.3)' },
  'Пар':      { bg: 'rgba(148, 163, 184, 0.12)',  text: '#94A3B8', border: 'rgba(148, 163, 184, 0.25)' },
};
```

Apply these colors to crop tags wherever they render — use inline styles or a wrapper component. The tag should have:
- Background: the `bg` value
- Color: the `text` value
- Border: 1px solid `border` value
- Padding: 2px 10px
- Border-radius: 6px
- Font-size: 12px
- Font-weight: 500

### KPI Cards — add gradient borders and visual weight

Find the KpiCard component. Add a subtle top border gradient to ALL KPI cards (not just hero):

```css
.kpi-card {
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-color) 0%, transparent 100%);
  opacity: 0.6;
}
```

Each KPI card should have a different accent color for its top border:
- Площа: `#22C55E` (green)
- Витрати: `#EF4444` (red)
- Дохід: `#3B82F6` (blue)
- Прибуток: `#F59E0B` (amber) — wider, hero style

### Verification:
```bash
cd frontend && npx tsc --noEmit && npm run build
git add -A && git commit -m "feat(ui): vibrant tags, brighter accents, KPI card gradient borders"
```

---

## Section 3: Fix Empty Charts

The charts on CostAnalytics ("По категоріях", "По місяцях") render as empty white space. This is likely because:
1. Recharts components render but data isn't passed correctly after the refactor
2. Or the chart styling makes bars/lines invisible against the background

Debug steps:
1. Open `frontend/src/pages/Economics/CostAnalytics.tsx`
2. Check if chart data is actually being passed to Recharts components
3. Check if bar/line fill colors are visible against navy background
4. If charts use `fill` colors from the old gray theme, they'll be invisible on navy

Ensure ALL charts across the app use colors from the `CHART_COLORS` array:
```typescript
export const CHART_COLORS = [
  '#22C55E', // green — primary
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#A855F7', // purple
  '#14B8A6', // teal
  '#F97316', // orange
  '#EC4899', // pink
  '#0EA5E9', // sky
];
```

For bar charts specifically, ensure:
- Bars have `fill={CHART_COLORS[0]}` (not a gray or transparent value)
- Bar minimum width is 20px
- Bar border-radius top: `radius={[4, 4, 0, 0]}`

For the pie/donut chart ("По категоріях"):
- Ensure `<Cell>` components have fills from `CHART_COLORS`
- `innerRadius="60%"` for donut style
- Check that the component actually renders — add a console.log to verify data presence

For Recharts tooltip styling — ensure tooltip has navy background:
```tsx
<Tooltip
  contentStyle={{
    backgroundColor: '#111A2E',
    border: '1px solid #253350',
    borderRadius: 8,
    color: '#ededed',
  }}
/>
```

Grid lines:
```tsx
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
```

Axis text:
```tsx
<XAxis tick={{ fill: '#6b7b9a', fontSize: 11 }} axisLine={false} tickLine={false} />
<YAxis tick={{ fill: '#6b7b9a', fontSize: 11 }} axisLine={false} tickLine={false} />
```

Go through EVERY page that has charts and fix them:
- `Economics/CostAnalytics.tsx` — pie + bar
- `Economics/FieldPnl.tsx` — bar chart
- `Economics/BudgetPage.tsx` — bar chart
- `Economics/MarginalityDashboard.tsx` — bar chart
- `Economics/SeasonComparison.tsx`
- `Economics/BreakEvenCalculator.tsx`
- `Analytics/FieldEfficiency.tsx`
- `Analytics/MarginalityDashboard.tsx`
- `Analytics/SalaryFuelAnalytics.tsx`
- `Analytics/ResourceConsumption.tsx`
- `Sales/RevenueAnalytics.tsx`
- `Dashboard.tsx` — "Фінансовий огляд" chart

### Verification:
```bash
cd frontend && npx tsc --noEmit && npm run build
git add -A && git commit -m "fix(ui): fix empty charts, apply navy tooltip/grid, vibrant bar colors"
```

---

## Section 4: Sidebar Visual Depth

The sidebar blends into the page. It needs visual separation.

In the sidebar CSS (find the sidebar component or its CSS module):

Add right-edge glow:
```css
.sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 1px 0 12px rgba(0, 0, 0, 0.3);
}
```

Active menu item — make it more visible:
```css
/* Active item should have a left accent bar */
.ant-menu-item-selected {
  border-left: 2px solid #22C55E !important;
  background: rgba(34, 197, 94, 0.08) !important;
}
```

### Verification:
```bash
cd frontend && npx tsc --noEmit && npm run build
git add -A && git commit -m "feat(ui): sidebar depth, active item accent bar"
```

---

## Final
```bash
git log --oneline -4
git push
```
