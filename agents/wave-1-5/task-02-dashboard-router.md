# Task 02 — Role-Based Dashboard Router

**Goal:** `Dashboard.tsx` becomes a thin router that selects one of 4 role views. Auto by role, no toggle.

**Depends on:** task-01

---

## Step 1 — Restructure Dashboard.tsx

Rename current `frontend/src/pages/Dashboard.tsx` → keep as `Dashboard.tsx` but make it a router:

```tsx
import { useAuthStore } from '@/store/authStore'
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const InvestorDashboard = lazy(() => import('./dashboards/InvestorDashboard'))
const ManagerDashboard = lazy(() => import('./dashboards/ManagerDashboard'))
const WorkerDashboard = lazy(() => import('./dashboards/WorkerDashboard'))
const FinanceDashboard = lazy(() => import('./dashboards/FinanceDashboard'))

type Role = 'SuperAdmin' | 'CompanyAdmin' | 'Manager' | 'WarehouseOperator' | 'Accountant' | 'Viewer'

const roleToView: Record<Role, React.LazyExoticComponent<React.ComponentType>> = {
  SuperAdmin: InvestorDashboard,
  CompanyAdmin: InvestorDashboard,
  Manager: ManagerDashboard,
  WarehouseOperator: WorkerDashboard,
  Accountant: FinanceDashboard,
  Viewer: InvestorDashboard,  // read-only investor view
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const role = (user?.role ?? 'CompanyAdmin') as Role
  const Component = roleToView[role] ?? InvestorDashboard

  return (
    <Suspense fallback={<DashboardShimmer />}>
      <Component />
    </Suspense>
  )
}

function DashboardShimmer() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4">
      <div className="skeleton-shimmer h-24 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="skeleton-shimmer h-36 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="skeleton-shimmer h-96 rounded-xl lg:col-span-2" />
        <div className="skeleton-shimmer h-96 rounded-xl" />
      </div>
    </div>
  )
}
```

---

## Step 2 — Create the 4 dashboard page files (stubs for now)

Create `frontend/src/pages/dashboards/InvestorDashboard.tsx`:
```tsx
import { HeroSection } from '@/components/dashboard/investor/HeroSection'

export default function InvestorDashboard() {
  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <HeroSection />
        {/* task-03 adds the rest */}
      </div>
    </div>
  )
}
```

Create `frontend/src/pages/dashboards/ManagerDashboard.tsx`:
```tsx
export default function ManagerDashboard() {
  return (
    <div className="min-h-screen gradient-mesh-default relative">
      <div className="noise-overlay" />
      <div className="p-6 max-w-[1600px] mx-auto relative">
        <h1 className="text-2xl font-semibold text-fg-primary mb-6">Менеджерська панель</h1>
        <p className="text-fg-secondary">Будується в task-07</p>
      </div>
    </div>
  )
}
```

Create `frontend/src/pages/dashboards/WorkerDashboard.tsx`:
```tsx
export default function WorkerDashboard() {
  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-semibold text-fg-primary mb-6">Мої завдання</h1>
        <p className="text-fg-secondary">Будується в task-08</p>
      </div>
    </div>
  )
}
```

Create `frontend/src/pages/dashboards/FinanceDashboard.tsx`:
```tsx
export default function FinanceDashboard() {
  return (
    <div className="min-h-screen gradient-mesh-finance relative">
      <div className="noise-overlay" />
      <div className="p-6 max-w-[1600px] mx-auto relative">
        <h1 className="text-2xl font-semibold text-fg-primary mb-6">Фінансовий огляд</h1>
        <p className="text-fg-secondary">Будується в task-09</p>
      </div>
    </div>
  )
}
```

---

## Step 3 — Manual test with different roles

Log in as each role and verify correct dashboard renders:
1. As CompanyAdmin → see InvestorDashboard with HeroSection
2. As Manager → see ManagerDashboard stub
3. As WarehouseOperator → see WorkerDashboard stub
4. As Accountant → see FinanceDashboard stub

If login doesn't allow role switching for testing, check authStore and force a role temporarily via browser DevTools:
```js
// In browser console:
useAuthStore.setState({ user: { ...useAuthStore.getState().user, role: 'Manager' } })
```

---

## Acceptance criteria

- [ ] `Dashboard.tsx` is a router reading `user.role`
- [ ] 4 page components exist in `pages/dashboards/`
- [ ] Lazy-loaded with Suspense fallback shimmer
- [ ] Default fallback = InvestorDashboard if role unknown
- [ ] Each stub renders with correct gradient mesh background
- [ ] Navigating to /dashboard after login as each role shows correct view
- [ ] `npm run build` passes, bundle splits per dashboard

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-02-investor-loaded.png` (as CompanyAdmin)
- `docs/screenshots/wave-1-5/task-02-manager-stub.png` (as Manager)
- `docs/screenshots/wave-1-5/task-02-worker-stub.png` (as WarehouseOperator)
- `docs/screenshots/wave-1-5/task-02-finance-stub.png` (as Accountant)

---

## Git

```bash
git add frontend/src/pages/Dashboard.tsx \
        frontend/src/pages/dashboards/ \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): role-based dashboard router

- Dashboard.tsx reads user.role, lazy-loads one of 4 views
- InvestorDashboard (SuperAdmin, CompanyAdmin, Viewer)
- ManagerDashboard (Manager)
- WorkerDashboard (WarehouseOperator)
- FinanceDashboard (Accountant)
- Suspense fallback is shimmer skeleton matching layout
- Each dashboard has its own gradient-mesh background

Task: wave-1-5/task-02"
git push
```

Append to `_progress.md`.
