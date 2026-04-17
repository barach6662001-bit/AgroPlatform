# Task 01 — Hero Components via Magic MCP

**Goal:** Build the Investor Dashboard hero section: Season banner + 4 KPI cards with sparklines. All components come from magic MCP (21st.dev), not written by hand.

**Depends on:** task-00

---

## Target look

Match WIREFRAMES.md §1 (top two rows):
- **Row 1 (Season banner):** glossy card with pulse dot, day counter, status badge, "Додати поля" action button — gradient background, slight glow
- **Row 2 (KPI grid):** 4 cards each with icon, label, big animated number, trend pill, mini sparkline, hover glow

---

## Step 1 — Use magic MCP to find the hero banner component

Call the magic MCP with query variations until you get a component matching the wireframe.

Try these queries in order:
1. `"hero banner with gradient glow status badge and counter dark mode"`
2. `"premium stats banner pulse indicator animated"`
3. `"gradient hero card with cta button"`

Pick the one closest to the wireframe. Install it following magic MCP's instructions.

---

## Step 2 — Use magic MCP to find the KPI card component

Try these queries:
1. `"animated metric card with sparkline and trend arrow"`
2. `"glassmorphism stats card with hover glow sparkline"`
3. `"dashboard tile with icon sparkline percentage badge dark"`

Install the chosen one. This becomes the basis for the KPI grid.

---

## Step 3 — Adapt both components to our tokens

Open the installed files. Replace:
- Any hardcoded hex colors → CSS variables from AESTHETIC.md
- Any static numbers → `useCountUp` hook from task-00
- Any hardcoded font-sizes → token classes
- Ensure `font-variant-numeric: tabular-nums` on all numeric displays

Example transformation (installed component):
```tsx
// BEFORE (from 21st install)
<div className="text-white" style={{ color: '#fff' }}>
  ₴{value.toLocaleString()}
</div>

// AFTER (adapted)
<div className="text-fg-primary tabular-nums" style={{ color: 'var(--fg-primary)' }}>
  {fmt.currency(useCountUp(value))}
</div>
```

---

## Step 4 — Create the hero components

Create `frontend/src/components/dashboard/investor/SeasonBanner.tsx`:
- Props: `{ season: string, day: number, totalDays: number, status: 'good'|'warning'|'critical', onAction: () => void }`
- Renders the magic-installed banner, wired to props
- Pulse dot color based on status (emerald/amber/red)

Create `frontend/src/components/dashboard/investor/KPICard.tsx`:
- Props: `{ label, value, format, delta, deltaLabel, icon, sparkline, accentColor, glowColor }`
- Renders the magic-installed card, wired to props
- `useCountUp` on value
- Gradient top-border using `accentColor`
- Glow box-shadow using `glowColor`

Create `frontend/src/components/dashboard/investor/HeroSection.tsx` that composes both:
```tsx
export function HeroSection() {
  const data = useDashboardSummary()  // react-query hook, task-03 wires real data

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 gradient-mesh-default rounded-2xl overflow-hidden">
        <div className="noise-overlay" />
      </div>

      <SeasonBanner
        season="Сезон 2026"
        day={data?.dayOfSeason ?? 107}
        totalDays={365}
        status={data?.status ?? 'good'}
        onAction={() => navigate('/fields/new')}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total revenue" value={data?.revenue ?? 0} ... />
        <KPICard label="Margin" value={data?.margin ?? 0} ... />
        <KPICard label="Active fields" value={data?.activeFields ?? 0} ... />
        <KPICard label="NDVI average" value={data?.ndviAvg ?? 0} ... />
      </div>
    </div>
  )
}
```

---

## Step 5 — Stub the data hook (real data comes later)

Create `frontend/src/hooks/useDashboardSummary.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

interface DashboardSummary {
  dayOfSeason: number
  status: 'good' | 'warning' | 'critical'
  revenue: number
  revenueDelta: number
  revenueSparkline: number[]
  margin: number
  marginDelta: number
  marginSparkline: number[]
  activeFields: number
  totalHectares: number
  ndviAvg: number
  ndviDelta: number
  ndviSparkline: number[]
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/summary', { credentials: 'include' })
        if (!res.ok) throw new Error('not ready')
        return await res.json()
      } catch {
        // Mock fallback
        return {
          dayOfSeason: 107,
          status: 'good',
          revenue: 12840000,
          revenueDelta: 18.4,
          revenueSparkline: [4, 6, 5, 8, 7, 9, 11, 10, 13, 12, 14, 17],
          margin: 34.2,
          marginDelta: 4.1,
          marginSparkline: [28, 30, 29, 31, 30, 32, 31, 33, 33, 34, 34, 34],
          activeFields: 47,
          totalHectares: 2340,
          ndviAvg: 0.73,
          ndviDelta: -2.3,
          ndviSparkline: [0.68, 0.71, 0.70, 0.74, 0.75, 0.76, 0.77, 0.76, 0.74, 0.73, 0.72, 0.73],
        }
      }
    },
    refetchInterval: 60_000,
  })
}
```

If react-query not installed: `npm install @tanstack/react-query` and add `<QueryClientProvider>` to App.tsx.

---

## Step 6 — Test on /dashboard temporarily

For this task, temporarily wire HeroSection into the existing `Dashboard.tsx` at the top. Full role router comes in task-02.

Just add:
```tsx
import { HeroSection } from '@/components/dashboard/investor/HeroSection'
// ...top of page:
<HeroSection />
{/* existing content below */}
```

---

## Acceptance criteria

- [ ] Magic MCP searched and component(s) installed (logged in _progress.md with query used)
- [ ] SeasonBanner, KPICard, HeroSection created in `components/dashboard/investor/`
- [ ] All hardcoded colors replaced with CSS vars from task-00
- [ ] All numbers animate from 0 on mount
- [ ] Hover on KPI card → glow intensifies
- [ ] Sparkline renders inside each KPI
- [ ] useDashboardSummary hook works with mock fallback
- [ ] `/dashboard` shows new hero at top
- [ ] Existing AntD content still visible below (not broken)
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-01-hero-light.png`
- `docs/screenshots/wave-1-5/task-01-hero-dark.png` (this is the canonical — dark is default)

---

## Git

```bash
git add frontend/src/components/dashboard/investor/ \
        frontend/src/hooks/useDashboardSummary.ts \
        frontend/src/components/ui/ \
        frontend/src/pages/Dashboard.tsx \
        frontend/package.json frontend/package-lock.json \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): investor hero section via 21st.dev

- SeasonBanner sourced from 21st magic MCP
- KPICard sourced from 21st magic MCP
- HeroSection composition with gradient mesh + noise overlay
- useDashboardSummary hook with mock fallback
- tabular-nums everywhere, useCountUp animations

Task: wave-1-5/task-01"
git push
```

Append to `_progress.md` with the 21st components used.
