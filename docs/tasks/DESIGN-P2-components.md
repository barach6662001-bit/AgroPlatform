# DESIGN-P2: Component Overhaul

> Reference: `docs/design-system.md` sections 2, 3, 4
> Depends on: DESIGN-P1 completed
> Scope: Create reusable components — KpiCard, DataTable, StatusBadge, EmptyState
> Do NOT modify page layouts yet — only build components and replace usages.

---

## Steps

### Step 5: Create KpiCard component

Create `frontend/src/components/KpiCard.tsx`:

```tsx
interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  hero?: boolean;
  prefix?: React.ReactNode; // e.g. currency icon
}
```

Visual spec:
- Container: card-bg background, 1px border var(--border-default), border-radius 12px, padding 20px
- If `hero`: 1.5x width (use CSS grid span or flex-grow), top border 2px gradient from #22C55E to #3B82F6
- Label: 11px, font-weight 500, uppercase, letter-spacing 0.04em, color var(--text-secondary), margin-bottom 8px
- Value: 28px (hero: 32px), font-weight 600, color white, letter-spacing -0.02em, font-variant-numeric: tabular-nums
- Delta row: 12px, margin-top 6px. If trend='up': color #22C55E, prefix "↑". If 'down': color #EF4444, prefix "↓". If 'neutral': color var(--text-tertiary), prefix "→"
- deltaLabel: 12px, color var(--text-tertiary), inline after delta value
- NO icon circles. Clean and typographic only.
- Transition: border-color on hover 150ms

### Step 6: Replace all KPI usages

Find all existing KPI/stat card implementations across pages:
- `Dashboard` — 4 KPI cards (Площа, Витрати, Дохід, Прибуток)
- `Sales/SalesList` — 2 KPI cards
- `Economics/CostRecords` — 7 category summary cards
- `Economics/CostAnalytics` — 3 KPI cards (Витрати, Дохід, Прибуток)
- `Economics/FieldPnl` — 3 KPI cards
- `Economics/BudgetPage` — 4 KPI cards
- `Economics/MarginalityDashboard` — 4 KPI cards

Replace each with `<KpiCard>`. Use a flex/grid row with gap 16px. Mark the most important metric in each group as `hero`.

For Dashboard specifically: `Прибуток` should be `hero={true}`.

### Step 7: Create DataTable wrapper

Create `frontend/src/components/DataTable.tsx`:

A thin wrapper around Ant Design `<Table>` that enforces the design system:

```tsx
import { Table, TableProps } from 'antd';

export function DataTable<T extends object>(props: TableProps<T>) {
  return (
    <Table
      {...props}
      className={`data-table ${props.className || ''}`}
      size="middle"
      pagination={
        props.pagination === false
          ? false
          : {
              ...props.pagination as object,
              showSizeChanger: true,
              showTotal: (total, range) => `Показано ${range[0]}-${range[1]} з ${total}`,
              pageSizeOptions: ['10', '20', '50'],
            }
      }
    />
  );
}
```

Add CSS class `.data-table` overrides in a new file `frontend/src/components/DataTable.css`:
- Row height: 44px (via cell padding)
- Action column cells: opacity 0 by default, opacity 1 on row hover (`.data-table .ant-table-row:hover .action-cell { opacity: 1 }`)
- Ensure no vertical borders (already handled globally in P1, but reinforce here)

### Step 8: Replace all Table usages

Find every `<Table` import from 'antd' across all page files. Replace with `<DataTable` from the new component. Preserve all existing props (columns, dataSource, etc).

Files to update (search for `import { Table` or `import { ... Table` from 'antd'):
- All files in `frontend/src/pages/` that use `<Table>`

This is a mechanical find-and-replace. Do NOT change column definitions or data — only the component import and usage.

### Step 9: Create StatusBadge component

Create `frontend/src/components/StatusBadge.tsx`:

```tsx
interface StatusBadgeProps {
  status: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';
}
```

Visual spec:
- Display inline-flex, padding 2px 8px, border-radius 9999px (full pill), font-size 11px, font-weight 500
- Color mapping:
  - green: bg rgba(34,197,94,0.12), text #22C55E
  - yellow: bg rgba(245,158,11,0.12), text #F59E0B
  - red: bg rgba(239,68,68,0.12), text #EF4444
  - blue: bg rgba(59,130,246,0.12), text #3B82F6
  - gray: bg rgba(255,255,255,0.06), text var(--text-secondary)
  - orange: bg rgba(249,115,22,0.12), text #F97316
  - purple: bg rgba(139,92,246,0.12), text #8B5CF6

Replace existing Ant Design `<Tag>` usages for statuses (Активна, На ремонті, Завершена, etc.) with `<StatusBadge>`.

### Step 10: Create EmptyState component

Create `frontend/src/components/EmptyState.tsx`:

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode; // Lucide icon
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

Visual spec:
- Centered container, padding 48px 24px
- Icon: 48px, color var(--text-tertiary), margin-bottom 16px
- Title: 16px, font-weight 500, color var(--text-primary), margin-bottom 8px
- Description: 13px, color var(--text-secondary), max-width 320px, text-align center
- Action button: primary style, margin-top 20px

Install `lucide-react` if not already present: `npm install lucide-react`

Replace all `<Empty>` from Ant Design with `<EmptyState>`. Provide relevant icons (Package for warehouse, Map for fields, Wrench for machinery, etc.) and CTA buttons where applicable.

### Step 11: Update button visual consistency

Review all buttons across the app. Ensure:
- Primary actions (Create, Save, Submit): use `type="primary"` — gets gradient from P1 global CSS
- Secondary actions (Export, Filter, Cancel): use `type="default"` — gets ghost style from P1
- Danger actions (Delete): add custom className `btn-danger` with style: `background: transparent, border: 1px solid rgba(239,68,68,0.3), color: #EF4444`. Add `.btn-danger:hover { background: rgba(239,68,68,0.08) }` to global CSS.
- Icon-only buttons (edit, view): size 32px, ghost style, border-radius 8px

---

## Verification

1. `npx tsc --noEmit` — pass
2. `npm run build` — pass
3. Check: KpiCard renders correctly with label/value/delta
4. Check: DataTable renders without vertical borders, has hover, has consistent pagination
5. Check: StatusBadge is a colored pill, not Ant default tag
6. Check: EmptyState shows icon + text + optional CTA
