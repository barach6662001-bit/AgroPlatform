# Task 06 — Finance Section for Investor View

**Goal:** Replace FinanceSectionPlaceholder with EBITDA trend + cost monitoring + cashflow area chart. Via magic MCP.

**Depends on:** task-03

---

## Step 1 — Magic MCP searches

1. `"area chart with gradient fill and hover tooltip"`
2. `"financial dashboard card with trend indicator"`
3. `"cost breakdown horizontal bars with percentages"`

Install chosen components.

---

## Step 2 — FinanceHighlights component

Create `frontend/src/components/dashboard/investor/FinanceHighlights.tsx`:

The section has three columns:
1. **EBITDA Trend** (big area chart, 12 months)
2. **Cost monitoring** (stacked bar — plan vs fact per category)
3. **Upcoming payments** (compact list)

```tsx
import { useFinanceData } from '@/hooks/useFinanceData'
import { useCountUp, fmt } from '@/hooks/useCountUp'
// + imports from 21st-installed components

export function FinanceHighlights() {
  const { data, isLoading } = useFinanceData()

  if (isLoading) return <div className="skeleton-shimmer h-64 rounded-xl" />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <EBITDATrendCard data={data?.cashflow ?? []} />
      <CostMonitoringCard categories={data?.costs ?? []} />
      <UpcomingPaymentsCard payments={data?.upcomingPayments ?? []} />
    </div>
  )
}

function EBITDATrendCard({ data }: { data: Array<{ month: string; value: number }> }) {
  const current = data[data.length - 1]?.value ?? 0
  const prev = data[data.length - 2]?.value ?? 0
  const growth = prev > 0 ? ((current - prev) / prev) * 100 : 0
  const animated = useCountUp(current)

  return (
    <div className="lg:col-span-2 rounded-xl border border-border-subtle bg-bg-surface/30 backdrop-blur-sm p-5 card-hoverable">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-kpi-label">EBITDA тренд · 12 місяців</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-kpi-hero tabular-nums" style={{ color: 'var(--fg-primary)' }}>
              {fmt.currency(animated)}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: growth >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: growth >= 0 ? 'var(--accent-emerald-400)' : '#fca5a5',
              }}
            >
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Area chart — use the 21st-installed component OR recharts */}
      <AreaChartWithGradient data={data} />
    </div>
  )
}

function CostMonitoringCard({ categories }: { categories: Array<{ name: string; plan: number; fact: number; color: string }> }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface/30 backdrop-blur-sm p-5 card-hoverable">
      <div className="text-kpi-label mb-4">Витрати · план / факт</div>
      <div className="space-y-3">
        {categories.map((cat) => {
          const pct = cat.plan > 0 ? (cat.fact / cat.plan) * 100 : 0
          return (
            <div key={cat.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-fg-secondary">{cat.name}</span>
                <span className="text-fg-tertiary tabular-nums">
                  {fmt.currency(cat.fact)} / {fmt.currency(cat.plan)}
                </span>
              </div>
              <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: cat.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UpcomingPaymentsCard({ payments }: { payments: Array<{ id: string; name: string; amount: number; dueDate: string; daysLeft: number }> }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface/30 backdrop-blur-sm p-5 card-hoverable">
      <div className="text-kpi-label mb-4">Майбутні платежі</div>
      <div className="space-y-3">
        {payments.slice(0, 4).map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm">
            <div className="min-w-0 flex-1">
              <div className="text-fg-primary truncate">{p.name}</div>
              <div className="text-xs text-fg-tertiary">
                через {p.daysLeft} {p.daysLeft === 1 ? 'день' : 'днів'}
              </div>
            </div>
            <div className="text-fg-primary tabular-nums font-medium ml-2">
              {fmt.currency(p.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Implement `AreaChartWithGradient` using either the 21st-installed chart component or `recharts` (already in package.json from Phase 0):

```tsx
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

function AreaChartWithGradient({ data }: { data: Array<{ month: string; value: number }> }) {
  return (
    <div className="h-48 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="ebitdaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-emerald-500)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--accent-emerald-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--fg-tertiary)', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [fmt.currency(v), 'EBITDA']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--accent-emerald-500)"
            strokeWidth={2}
            fill="url(#ebitdaGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## Step 3 — useFinanceData hook

Create `frontend/src/hooks/useFinanceData.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

export interface FinanceData {
  cashflow: Array<{ month: string; value: number }>
  costs: Array<{ name: string; plan: number; fact: number; color: string }>
  upcomingPayments: Array<{ id: string; name: string; amount: number; dueDate: string; daysLeft: number }>
}

export function useFinanceData() {
  return useQuery<FinanceData>({
    queryKey: ['finance-data'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/finance', { credentials: 'include' })
        if (!res.ok) throw new Error('not ready')
        return await res.json()
      } catch {
        return {
          cashflow: [
            { month: 'Тра', value: 4_200_000 },
            { month: 'Чер', value: 5_100_000 },
            { month: 'Лип', value: 5_800_000 },
            { month: 'Сер', value: 6_400_000 },
            { month: 'Вер', value: 7_200_000 },
            { month: 'Жов', value: 8_100_000 },
            { month: 'Лис', value: 9_300_000 },
            { month: 'Гру', value: 10_400_000 },
            { month: 'Січ', value: 11_100_000 },
            { month: 'Лют', value: 11_600_000 },
            { month: 'Бер', value: 12_200_000 },
            { month: 'Кві', value: 12_840_000 },
          ],
          costs: [
            { name: 'Паливо', plan: 2_000_000, fact: 1_640_000, color: 'var(--accent-blue-500)' },
            { name: 'Добрива', plan: 1_800_000, fact: 1_320_000, color: 'var(--accent-emerald-500)' },
            { name: 'Насіння', plan: 1_200_000, fact: 720_000, color: 'var(--culture-wheat)' },
            { name: 'Зарплата', plan: 1_000_000, fact: 998_000, color: 'var(--accent-purple-500)' },
            { name: 'Хімікати', plan: 600_000, fact: 430_000, color: 'var(--accent-amber-500)' },
          ],
          upcomingPayments: [
            { id: 'p1', name: 'Зарплати · квітень', amount: 420_000, dueDate: '2026-04-20', daysLeft: 3 },
            { id: 'p2', name: 'Кредит банк "Аваль"', amount: 850_000, dueDate: '2026-04-23', daysLeft: 6 },
            { id: 'p3', name: 'Syngenta · хімікати', amount: 120_000, dueDate: '2026-04-25', daysLeft: 8 },
            { id: 'p4', name: 'Оренда землі · Q2', amount: 280_000, dueDate: '2026-05-01', daysLeft: 14 },
          ],
        }
      }
    },
  })
}
```

---

## Step 4 — Replace placeholder

In `InvestorDashboard.tsx`:
- Import `FinanceHighlights`
- Replace `<FinanceSectionPlaceholder />` with `<FinanceHighlights />`

---

## Acceptance criteria

- [ ] Three-column finance section renders
- [ ] EBITDA area chart with gradient fill + tooltip
- [ ] Cost monitoring with animated progress bars + plan/fact labels
- [ ] Upcoming payments list with relative dates
- [ ] All numbers have tabular-nums
- [ ] Cards have `card-hoverable` class → hover glow
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-06-finance-highlights.png`

---

## Git

```bash
git add frontend/src/components/dashboard/investor/FinanceHighlights.tsx \
        frontend/src/hooks/useFinanceData.ts \
        frontend/src/pages/dashboards/InvestorDashboard.tsx \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): finance highlights section

- EBITDA trend (12 months) with gradient area chart via recharts
- Cost monitoring: plan vs fact bars with culture colors
- Upcoming payments list with relative days
- card-hoverable on all three
- Mock fallback with realistic Ukrainian agri data

Task: wave-1-5/task-06"
git push
```

Append to `_progress.md`.
