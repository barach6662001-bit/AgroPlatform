# Task 09 — Finance Dashboard (Accountant)

**Goal:** Financial-focused dashboard. Polished but dense. Via magic MCP.

**Depends on:** task-02, task-06 (reuses components)

---

## Step 1 — Magic MCP searches

1. `"financial dashboard with cashflow chart and payables"`
2. `"sortable financial table with progress bars"`
3. `"cost categories pie chart with legend dark"`
4. `"payment calendar compact list"`

---

## Step 2 — Layout

Match WIREFRAMES §4.

```tsx
// frontend/src/pages/dashboards/FinanceDashboard.tsx
export default function FinanceDashboard() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 gradient-mesh-finance -z-10">
        <div className="noise-overlay" />
      </div>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6 relative">
        <FinanceHeader />
        <FinanceKPIGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CashflowTrendCard />
          <AccountsPayableCard />
        </div>

        <MarginalityByFieldTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CostCategoriesPie />
          <UpcomingPaymentsCalendar />
        </div>
      </div>
    </div>
  )
}
```

---

## Step 3 — Components

### FinanceHeader
- Left: "Фінансовий огляд · Q2 2026"
- Right: "[Завантажити Excel]" "[Фільтри]"

### FinanceKPIGrid
- 4 cards: Cash In, Cash Out, Net Margin, Overdue Receivables
- Same KPICard style as Investor but compact (smaller sparklines or none)

### CashflowTrendCard
- Area chart, 12 months, gradient fill (reuse pattern from task-06)
- Title "Cashflow · 12 місяців"

### AccountsPayableCard
- Compact sortable list
- Columns: Contractor | Amount | Due (days)
- Days column color-coded (green < 7, amber 7-14, red > 14 overdue)
- 5 rows visible, link to full list

### MarginalityByFieldTable
- Dense sortable table
- Columns: Field ID, Culture (color dot), Area, Cost/ha, Revenue, Profit, Margin%, inline progress bar
- Sortable by any numeric column
- Total row at bottom
- Mock 15 fields

### CostCategoriesPie
- Donut chart (reuse pattern from investor MarginalityBreakdown)
- Categories: Fuel, Fertilizers, Seeds, Labor, Chemicals, Other
- Legend with percentages

### UpcomingPaymentsCalendar
- List grouped by day (Tomorrow / Apr 20 / Apr 23...)
- Each item: label + amount
- "Calendar view" link → opens full calendar (Wave 2)

---

## Step 4 — Data hook

Create `frontend/src/hooks/useFinanceDashboard.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

interface FinanceDashboardData {
  quarter: string
  kpis: {
    cashIn: number; cashInDelta: number
    cashOut: number; cashOutDelta: number
    netMargin: number; netMarginDelta: number
    overdueReceivables: number; overdueCount: number; oldestDays: number
  }
  cashflow: Array<{ month: string; inflow: number; outflow: number }>
  payables: Array<{
    id: string; contractor: string; amount: number; dueDays: number; currency: string
  }>
  marginalityByField: Array<{
    fieldId: string; fieldName: string; culture: string; cultureKey: string
    area: number; costPerHa: number; revenue: number; profit: number; marginPct: number
  }>
  costCategories: Array<{ category: string; amount: number; percent: number; color: string }>
  upcomingPayments: Array<{
    group: string; items: Array<{ id: string; label: string; amount: number }>
  }>
}

export function useFinanceDashboard() {
  return useQuery<FinanceDashboardData>({
    queryKey: ['finance-dashboard'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/finance-view', { credentials: 'include' })
        if (!res.ok) throw new Error('not ready')
        return await res.json()
      } catch {
        return {
          quarter: 'Q2 2026',
          kpis: {
            cashIn: 8_420_000, cashInDelta: 2.1,
            cashOut: 5_610_000, cashOutDelta: -5.6,
            netMargin: 33.4, netMarginDelta: 3.2,
            overdueReceivables: 342_000, overdueCount: 3, oldestDays: 12,
          },
          cashflow: Array.from({ length: 12 }, (_, i) => ({
            month: ['Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру','Січ','Лют','Бер','Кві'][i],
            inflow: 400_000 + Math.random() * 600_000 + i * 80_000,
            outflow: 300_000 + Math.random() * 400_000 + i * 50_000,
          })),
          payables: [
            { id: 'p1', contractor: 'Syngenta', amount: 120_000, dueDays: 3, currency: '₴' },
            { id: 'p2', contractor: 'Ukrnafta', amount: 85_000, dueDays: 7, currency: '₴' },
            { id: 'p3', contractor: 'BASF', amount: 62_000, dueDays: 14, currency: '₴' },
            { id: 'p4', contractor: 'Нібулон', amount: 340_000, dueDays: -2, currency: '₴' },
            { id: 'p5', contractor: 'Добродія', amount: 48_000, dueDays: 21, currency: '₴' },
          ],
          marginalityByField: Array.from({ length: 15 }, (_, i) => {
            const cultures = [
              { k: 'sunflower', n: 'Соняшник' }, { k: 'wheat', n: 'Пшениця' },
              { k: 'corn', n: 'Кукурудза' }, { k: 'rapeseed', n: 'Ріпак' },
              { k: 'soy', n: 'Соя' },
            ]
            const c = cultures[i % cultures.length]
            const area = 40 + Math.random() * 200
            const costPerHa = 1800 + Math.random() * 800
            const revenue = area * (3000 + Math.random() * 4000)
            const cost = area * costPerHa
            const profit = revenue - cost
            return {
              fieldId: `F${i}`,
              fieldName: `${c.n.slice(0,3).toUpperCase()}-${100 + i}`,
              culture: c.n, cultureKey: c.k,
              area, costPerHa, revenue, profit,
              marginPct: (profit / revenue) * 100,
            }
          }),
          costCategories: [
            { category: 'Паливо', amount: 1_640_000, percent: 29.2, color: 'var(--accent-emerald-500)' },
            { category: 'Зарплата', amount: 1_184_000, percent: 21.1, color: 'var(--accent-purple-500)' },
            { category: 'Добрива', amount: 1_038_000, percent: 18.5, color: 'var(--accent-blue-500)' },
            { category: 'Насіння', amount: 802_000, percent: 14.3, color: 'var(--culture-wheat)' },
            { category: 'Хімікати', amount: 550_000, percent: 9.8, color: 'var(--accent-amber-500)' },
            { category: 'Інше', amount: 398_000, percent: 7.1, color: 'var(--fg-tertiary)' },
          ],
          upcomingPayments: [
            { group: 'Завтра', items: [{ id: 'up1', label: 'Зарплати', amount: 42_000 }] },
            { group: '20 квітня', items: [{ id: 'up2', label: 'Кредит', amount: 120_000 }] },
            { group: '23 квітня', items: [{ id: 'up3', label: 'Паливо', amount: 85_000 }] },
            { group: '1 травня', items: [{ id: 'up4', label: 'Оренда землі', amount: 280_000 }] },
          ],
        }
      }
    },
  })
}
```

---

## Acceptance criteria

- [ ] 4-KPI grid renders
- [ ] Cashflow chart with area fill (inflow + outflow overlay)
- [ ] Payables table sorted by due days, overdue in red
- [ ] Marginality table has inline progress bars per row
- [ ] Cost categories donut with legend
- [ ] Upcoming payments grouped by date
- [ ] As Accountant → auto-renders this page
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-09-finance-full.png`
- `docs/screenshots/wave-1-5/task-09-marginality-table.png`

---

## Git

```bash
git add frontend/src/components/dashboard/finance/ \
        frontend/src/hooks/useFinanceDashboard.ts \
        frontend/src/pages/dashboards/FinanceDashboard.tsx \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): Finance dashboard for Accountant role

- FinanceHeader, FinanceKPIGrid, CashflowTrendCard, AccountsPayableCard,
  MarginalityByFieldTable, CostCategoriesPie, UpcomingPaymentsCalendar
- Polished financial data visualization
- Mock: Q2 2026 with realistic UAH amounts
- Color-coded due days on payables
- Full sortable marginality table

Task: wave-1-5/task-09"
git push
```

Append to `_progress.md`.
