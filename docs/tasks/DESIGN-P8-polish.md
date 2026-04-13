# DESIGN-P8: Polish & Final Touches

> Reference: `docs/design-system.md` sections 3, 6
> Depends on: All previous phases
> Scope: Loading states, animations, formatting, breadcrumbs, pagination consistency

---

## Steps

### Step 28: Add Skeleton Loading States

Create `frontend/src/components/Skeletons.tsx`:

```tsx
import { Skeleton } from 'antd';

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <Skeleton.Input active size="small" style={{ width: 80, marginBottom: 12 }} />
          <Skeleton.Input active size="large" style={{ width: 140 }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-default)',
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton.Input key={i} active size="small" style={{ width: '70%', height: 12 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '16px',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton.Input key={c} active size="small" style={{ width: `${60 + Math.random() * 30}%`, height: 14 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div style={{
      background: 'var(--color-card-bg)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Skeleton.Node active style={{ width: '90%', height: height - 60 }}>
        <span />
      </Skeleton.Node>
    </div>
  );
}
```

**Apply loading states on key pages:**

Find pages that use React Query (`useQuery`) or similar data fetching. While `isLoading` is true, show skeleton instead of empty space:

- Dashboard: KpiSkeleton(4) + ChartSkeleton + TableSkeleton
- Fields list: TableSkeleton(7, 6)
- Operations list: TableSkeleton(8, 5)
- Sales list: KpiSkeleton(4) + TableSkeleton(5, 6)
- Economics pages: KpiSkeleton(3) + ChartSkeleton + TableSkeleton

Example pattern:
```tsx
if (isLoading) return <KpiSkeleton count={4} />;
return <div>{/* actual KPI cards */}</div>;
```

### Step 29: Add Page Transition Animation

Create `frontend/src/components/PageTransition.tsx`:

```tsx
import { useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 200ms ease, transform 200ms ease',
      }}
    >
      {children}
    </div>
  );
}
```

Wrap the `<Outlet />` (or main content area) in AppLayout with `<PageTransition>`:

```tsx
// In AppLayout.tsx, around the content area:
<PageTransition>
  <Outlet />
</PageTransition>
```

### Step 30: Add Breadcrumbs to All Pages

**Currently:** Breadcrumbs exist on nested pages (analytics, PnL, budget) but NOT on root list pages (Fields, Machinery, Operations, HR, etc.).

Create a reusable breadcrumb approach. Check if there's already a `PageHeader` or `Breadcrumb` component.

**For every page that lacks breadcrumbs, add:**

```tsx
import { Breadcrumb } from 'antd';

// At the top of the page content, before the title:
<Breadcrumb
  items={[
    { title: <a href="/">🏠</a> },
    { title: 'Виробництво' },  // parent group
    { title: 'Операції' },      // current page
  ]}
  style={{ marginBottom: 12, fontSize: 12 }}
/>
```

Pages to add breadcrumbs to (search for pages that don't have `<Breadcrumb`):
- Fields list: 🏠 / Поля / Поля
- Operations list: 🏠 / Виробництво / Операції
- Machinery list: 🏠 / Виробництво / Техніка
- Warehouses list: 🏠 / Склад і логістика / Склади
- Warehouse items: already has
- Employee list: 🏠 / Персонал / Співробітники
- Work logs: 🏠 / Персонал / Табель
- Salary: 🏠 / Персонал / Зарплата
- Cost records: 🏠 / Фінанси / Витрати
- Sales list: 🏠 / Фінанси / Продажі
- Users page: 🏠 / Налаштування / Користувачі
- Notifications: 🏠 / Сповіщення

Style breadcrumb separator and text with muted colors (var(--text-tertiary)).

### Step 31: Format All UAH Amounts

Create `frontend/src/utils/format.ts` (or add to existing utils):

```typescript
const uahFormatter = new Intl.NumberFormat('uk-UA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const uahFormatterDecimals = new Intl.NumberFormat('uk-UA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUAH(value: number, decimals = false): string {
  const formatter = decimals ? uahFormatterDecimals : uahFormatter;
  return `${formatter.format(value)} UAH`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('uk-UA').format(value);
}

export function formatHa(value: number): string {
  return `${new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 }).format(value)} га`;
}

export function formatTons(value: number): string {
  return `${new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 }).format(value)} т`;
}
```

**Find and replace** all hardcoded number formatting across pages:
- Search for `.toFixed(`, `.toLocaleString(`, manual string concatenation with "UAH", "грн", "га", "т"
- Replace with appropriate format function
- Ensure ALL monetary values use space as thousands separator: "1 234 567 UAH" not "1234567 UAH" or "1,234,567 UAH"

### Step 32: Tabular Nums on All Numbers

Already added `font-variant-numeric: tabular-nums` on body in P1. Verify it works on:
- All KPI values
- All table numeric cells
- All chart axis labels

If specific elements override font settings, add inline `fontVariantNumeric: 'tabular-nums'` where needed.

### Step 33: Standardize Pagination

In the DataTable component (from P2), pagination is already standardized. But verify:
- ALL pages with tables show consistent pagination
- Format: "Показано 1-20 з 156" (not "Всього: 7" or "20 / сторінці")
- Same page size options: [10, 20, 50]
- Pagination position: right-aligned below table
- Compact style: no extra borders around pagination

Find pages where pagination might be custom (not using DataTable) and align:
- Audit log pages
- Notifications page
- Any page with manual pagination implementation

---

## Verification

1. `npx tsc --noEmit` — pass
2. `npm run build` — pass
3. Pages show skeleton loading while data fetches (not blank space)
4. Page transitions: smooth fade + slide up when navigating
5. Breadcrumbs visible on ALL pages
6. All monetary values formatted with space separator: "1 234 567 UAH"
7. Numbers in tables align properly (tabular-nums)
8. Pagination consistent across all table pages
9. Overall: product feels polished, no default Ant Design appearance remaining
