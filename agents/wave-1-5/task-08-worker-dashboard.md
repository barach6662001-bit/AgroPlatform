# Task 08 — Worker Dashboard

**Goal:** Dense functional dashboard for WarehouseOperator. No eye-candy hero. Priority: workers finish tasks fast.

**Depends on:** task-02

---

## Step 1 — Magic MCP searches (lightweight)

Worker view is more utilitarian. Keep 21st aesthetic for buttons/cards but skip flashy animations.

1. `"task list compact with quick actions"`
2. `"data table with inline action buttons dark mode"`
3. `"dashboard quick action buttons grid"`

---

## Step 2 — Layout

Match WIREFRAMES §3.

```tsx
// frontend/src/pages/dashboards/WorkerDashboard.tsx
export default function WorkerDashboard() {
  return (
    <div className="min-h-screen bg-bg-deep">
      <div className="p-6 max-w-[1400px] mx-auto space-y-4">
        <WorkerHeader />
        <QuickTasksRow />
        <WarehouseStateTable />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MyRecentActivity />
          </div>
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  )
}
```

---

## Step 3 — Components

### WorkerHeader
- "Мої завдання на сьогодні"
- CTA: "[Швидка дія: + Приймання]"

### QuickTasksRow — 4 compact cards
- Приймання (3 pending)
- Переміщення (1 pending)
- Списання (0)
- Інвентаризація (Next: Friday)
- Each card has arrow button to navigate to that action

### WarehouseStateTable
- Dense rows (28px tall): batch id, culture, qty, status, last action, inline action buttons
- Sortable columns
- Pagination at bottom
- No animations on row mount (worker wants speed)
- Mock 15 rows

### MyRecentActivity
- Compact list of user's own recent actions
- Similar to ActivityFeed from task-05 but filtered to current user
- Smaller rows, no fade-in

### QuickActionsPanel
- 5 big buttons for common actions:
  - + Приймання
  - ↔ Переміщення
  - − Списання
  - ≡ Інвентаризація
  - 📊 Денний звіт
- Each uses accent-emerald on hover

---

## Step 4 — Data hook

Create `frontend/src/hooks/useWorkerDashboard.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

interface WorkerDashboardData {
  tasks: { receive: number; transfer: number; writeoff: number; nextInventory: string }
  warehouse: { id: string; name: string }
  batches: Array<{
    id: string; name: string; culture: string; cultureKey: string
    qty: number; unit: string; status: string; lastAction: string; lastActionTime: string
  }>
  myActivity: Array<{
    id: string; action: string; details: string; timestamp: string
  }>
}

export function useWorkerDashboard() {
  return useQuery<WorkerDashboardData>({
    queryKey: ['worker-dashboard'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/worker', { credentials: 'include' })
        if (!res.ok) throw new Error('not ready')
        return await res.json()
      } catch {
        return {
          tasks: { receive: 3, transfer: 1, writeoff: 0, nextInventory: 'Friday' },
          warehouse: { id: 'WH-SILO-2', name: 'WH-Silo-2' },
          batches: Array.from({ length: 15 }, (_, i) => ({
            id: `B-${(i + 1).toString().padStart(3, '0')}`,
            name: `B-${(i + 1).toString().padStart(3, '0')}`,
            culture: ['Соняшник', 'Пшениця', 'Кукурудза', 'Ріпак'][i % 4],
            cultureKey: ['sunflower', 'wheat', 'corn', 'rapeseed'][i % 4],
            qty: 200 + Math.random() * 1200,
            unit: 't',
            status: ['Active', 'Reserved', 'Active'][i % 3],
            lastAction: ['Receive', 'Transfer', 'Reserve'][i % 3],
            lastActionTime: ['Yesterday', '2 days ago', '1 week ago'][i % 3],
          })),
          myActivity: [
            { id: 'm1', action: 'Received 12.5t Corn', details: 'to B-042', timestamp: '2m ago' },
            { id: 'm2', action: 'Transferred 8.0t Wheat', details: 'B-001 → B-015', timestamp: '15m ago' },
            { id: 'm3', action: 'Reserved 340t Sunflower', details: 'B-003', timestamp: '1h ago' },
            { id: 'm4', action: 'Started shift', details: '', timestamp: '3h ago' },
          ],
        }
      }
    },
  })
}
```

---

## Acceptance criteria

- [ ] Worker dashboard renders, no shimmer/glow on content (only on shell)
- [ ] 4 task cards + table + activity + action panel
- [ ] Dense rows (28px) in warehouse table
- [ ] Quick action buttons work (navigate to correct routes)
- [ ] As WarehouseOperator → auto-renders this page
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-08-worker-full.png`

---

## Git

```bash
git add frontend/src/components/dashboard/worker/ \
        frontend/src/hooks/useWorkerDashboard.ts \
        frontend/src/pages/dashboards/WorkerDashboard.tsx \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): Worker dashboard - functional density

- WorkerHeader, QuickTasksRow, WarehouseStateTable,
  MyRecentActivity, QuickActionsPanel
- 28px dense rows, no mount animations (speed priority)
- Quick actions for common warehouse operations

Task: wave-1-5/task-08"
git push
```

Append to `_progress.md`.
