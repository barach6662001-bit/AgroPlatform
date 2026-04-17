# Task 07 — Manager Dashboard

**Goal:** Operations-focused dashboard for Manager role. Same aesthetic as Investor but different content priority (active operations, team status, alerts).

**Depends on:** task-02

---

## Step 1 — Magic MCP searches

1. `"operations list with status badges and progress indicators"`
2. `"team productivity card with avatars and performance stars"`
3. `"alerts panel with action buttons"`
4. `"compact field grid with mini gauges"`

Install chosen components.

---

## Step 2 — Layout

Match WIREFRAMES §2.

```tsx
// frontend/src/pages/dashboards/ManagerDashboard.tsx
import { ManagerHeader } from '@/components/dashboard/manager/ManagerHeader'
import { ManagerKPIGrid } from '@/components/dashboard/manager/ManagerKPIGrid'
import { ActiveOperations } from '@/components/dashboard/manager/ActiveOperations'
import { AlertsPanel } from '@/components/dashboard/manager/AlertsPanel'
import { FieldStatusGrid } from '@/components/dashboard/manager/FieldStatusGrid'
import { TeamPerformance } from '@/components/dashboard/manager/TeamPerformance'
import { TasksToApprove } from '@/components/dashboard/manager/TasksToApprove'

export default function ManagerDashboard() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 gradient-mesh-default -z-10">
        <div className="noise-overlay" />
      </div>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6 relative">
        <ManagerHeader />
        <ManagerKPIGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ActiveOperations />
          </div>
          <AlertsPanel />
        </div>

        <FieldStatusGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TeamPerformance />
          <TasksToApprove />
        </div>
      </div>
    </div>
  )
}
```

---

## Step 3 — Sub-components (brief specs)

### ManagerHeader
- Left: "Ранковий огляд · {date}, {time}" + greeting by user name
- Right: "[Генерувати звіт]" button (stub action)

### ManagerKPIGrid
- 4 cards like Investor but labels: Operations Today / Active Team / Equipment Online / Weather at Fields
- Smaller version of KPICard from task-01 (no sparkline needed, just big number + 1 supporting line)

### ActiveOperations
- Real-time list of in-progress operations
- Each row: culture icon, operation type, worker, equipment, field, progress bar, speed metric
- Severity dot (green=ok, amber=behind schedule, red=stopped)
- Mock 3-5 rows

### AlertsPanel
- Sorted by severity
- Each alert: icon, title, details, action button
- Mock alerts: fuel low, contract expires, equipment service due

### FieldStatusGrid
- 18 (3×6) compact cards
- Each: field ID, culture color dot, mini NDVI gauge, status label
- Click → navigate to /fields/{id}
- "Show all" link

### TeamPerformance
- Avatar + name + metric + rating stars
- Mock 5 workers

### TasksToApprove
- Counts of pending approvals
- Operations, timesheets, purchases
- "Review all" link

---

## Step 4 — Data hook

Create `frontend/src/hooks/useManagerDashboard.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

interface ManagerDashboardData {
  greeting: { dateText: string; timeText: string; userName: string }
  kpis: {
    operationsToday: number; operationsCritical: number
    activeTeam: number; totalTeam: number; absent: string[]
    equipmentOnline: number; equipmentTotal: number; equipmentService: number
    weather: { temp: number; condition: string; rainDaysWeek: number }
  }
  activeOperations: Array<{
    id: string; status: 'ok'|'warning'|'critical'
    type: string; worker: string; equipment: string; field: string
    progress: number; speed: string
  }>
  alerts: Array<{
    id: string; severity: 'info'|'warning'|'danger'
    title: string; description: string
    action?: { label: string; href?: string }
  }>
  fields: Array<{
    id: string; name: string; culture: string; cultureKey: string
    ndvi: number; status: 'active'|'fallow'|'harvested'
  }>
  team: Array<{ name: string; initials: string; metric: string; rating: number }>
  approvals: { operations: number; timesheets: number; purchases: number }
}

export function useManagerDashboard() {
  return useQuery<ManagerDashboardData>({
    queryKey: ['manager-dashboard'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/manager', { credentials: 'include' })
        if (!res.ok) throw new Error('not ready')
        return await res.json()
      } catch {
        // Full mock
        return {
          greeting: {
            dateText: new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }),
            timeText: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
            userName: 'Влас',
          },
          kpis: {
            operationsToday: 12, operationsCritical: 3,
            activeTeam: 8, totalTeam: 10, absent: ['Hryhorovych'],
            equipmentOnline: 23, equipmentTotal: 25, equipmentService: 2,
            weather: { temp: 18, condition: 'Dry', rainDaysWeek: 2 },
          },
          activeOperations: [
            { id: 'o1', status: 'ok', type: 'Збір врожаю', worker: 'Morgunok A.', equipment: 'CASE 310', field: 'XRI-BOT-001', progress: 67, speed: '12.3 t/h' },
            { id: 'o2', status: 'warning', type: 'Внесення добрив', worker: 'Podolyanuk V.', equipment: 'Amazone', field: 'HRY-PEN-008', progress: 34, speed: '8.4 t/h' },
            { id: 'o3', status: 'ok', type: 'Обприскування', worker: 'Lyzko Yu.', equipment: 'Challenger', field: 'HOL-KRU-004', progress: 91, speed: '4.2 ha/h' },
            { id: 'o4', status: 'critical', type: 'Оранка', worker: 'Migov V.', equipment: 'John Deere 8R', field: 'GOL-LUC-007', progress: 12, speed: 'stopped' },
          ],
          alerts: [
            { id: 'a1', severity: 'danger', title: 'Паливо низьке', description: 'WH-Silo-2 · 15% залишилось', action: { label: 'Замовити зараз', href: '/warehouses/fuel' } },
            { id: 'a2', severity: 'warning', title: 'Контракт закінчується', description: 'Grain Trader LLC · 12 днів', action: { label: 'Переглянути', href: '/contracts' } },
            { id: 'a3', severity: 'info', title: 'ТО техніки', description: 'CASE 310 · 50 год до обслуговування' },
          ],
          fields: Array.from({ length: 18 }, (_, i) => {
            const cultures = [
              { k: 'sunflower', n: 'Соняшник' },
              { k: 'wheat', n: 'Пшениця' },
              { k: 'corn', n: 'Кукурудза' },
              { k: 'rapeseed', n: 'Ріпак' },
              { k: 'soy', n: 'Соя' },
              { k: 'peas', n: 'Люцерна' },
            ]
            const c = cultures[i % cultures.length]
            return {
              id: `F-${100 + i}`, name: `ХРИ-${100 + i}`,
              culture: c.n, cultureKey: c.k,
              ndvi: 0.55 + Math.random() * 0.35,
              status: i % 7 === 0 ? 'fallow' : 'active' as any,
            }
          }),
          team: [
            { name: 'Podolyanuk V.', initials: 'PV', metric: '12.3 t/h', rating: 5 },
            { name: 'Migov V.', initials: 'MV', metric: '8.4 t/h', rating: 4 },
            { name: 'Morgunok A.', initials: 'MA', metric: '7.6 t/h', rating: 4 },
            { name: 'Lyzko Yu.', initials: 'LY', metric: '5.1 t/h', rating: 3 },
            { name: 'Без водія', initials: '??', metric: '3.2 t/h', rating: 0 },
          ],
          approvals: { operations: 3, timesheets: 2, purchases: 1 },
        }
      }
    },
    refetchInterval: 60_000,
  })
}
```

---

## Acceptance criteria

- [ ] All 7 sub-components render with mock data
- [ ] Operations list shows progress bars animated from 0 to current %
- [ ] Alerts sorted by severity (danger first)
- [ ] Field grid shows 18 mini cards with NDVI gauges
- [ ] Culture color dots match tokens
- [ ] Team rating stars render
- [ ] Click any field card → navigates to /fields/{id}
- [ ] Logged in as Manager → sees this page
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-07-manager-full.png`
- `docs/screenshots/wave-1-5/task-07-manager-field-grid.png`

---

## Git

```bash
git add frontend/src/components/dashboard/manager/ \
        frontend/src/hooks/useManagerDashboard.ts \
        frontend/src/pages/dashboards/ManagerDashboard.tsx \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): Manager dashboard - operations focused

- ManagerHeader, ManagerKPIGrid, ActiveOperations, AlertsPanel,
  FieldStatusGrid, TeamPerformance, TasksToApprove
- 21st.dev components adapted for operations UI
- Mock data with realistic Ukrainian agri operations
- Animated progress bars, severity-sorted alerts

Task: wave-1-5/task-07"
git push
```

Append to `_progress.md`.
