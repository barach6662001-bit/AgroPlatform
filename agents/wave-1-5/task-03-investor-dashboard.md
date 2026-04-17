# Task 03 — Complete Investor Dashboard

**Goal:** Finish InvestorDashboard layout per WIREFRAMES §1. Adds everything below the hero: field map (placeholder for task-04), activity feed (placeholder for task-05), finance section (placeholder for task-06), secondary stats (semi-circle gauges), marginality donut.

**Depends on:** task-02

---

## Step 1 — Secondary stats row via magic MCP

Below the hero KPI grid, add a row of 4 secondary cards:
- **Cost per hectare** — semi-circle gauge
- **Profit per hectare** — semi-circle gauge
- **Fuel efficiency** — big number + trend
- **Team productivity** — sparkline + top 3 performers

Query magic MCP:
1. `"semi circle radial progress gauge with label"`
2. `"half circle progress indicator dashboard"`
3. `"performance stat card with top performers list"`

Install and adapt. Create `frontend/src/components/dashboard/investor/SecondaryStats.tsx`.

Each gauge needs:
- Current value (animated from 0)
- Target value (as secondary dim number)
- Percentage fill (animated)
- Accent color from tokens (emerald for profit, blue for cost, amber for efficiency)

---

## Step 2 — Marginality donut + bars via magic MCP

Bottom section of InvestorDashboard: marginality breakdown by culture.

Query magic MCP:
1. `"donut chart with center label and multi color segments"`
2. `"financial breakdown donut with horizontal bar legend"`
3. `"pie chart with percentage and category list"`

Install. Create `frontend/src/components/dashboard/investor/MarginalityBreakdown.tsx`.

Use the culture colors from tokens:
- Sunflower → `--culture-sunflower`
- Wheat → `--culture-wheat`
- Corn → `--culture-corn`
- Rapeseed → `--culture-rapeseed`
- Soy → `--culture-soy`

Data shape:
```ts
interface MarginalityData {
  totalProfit: number
  byCulture: Array<{
    culture: string
    cultureKey: 'sunflower'|'wheat'|'corn'|'rapeseed'|'soy'|'peas'
    profit: number
    percent: number
    area: number
  }>
}
```

Center of donut: animated total profit. Horizontal bars below sorted by profit desc.

---

## Step 3 — Placeholder slots for task-04/05/06

Add placeholder cards for the three remaining sections that later tasks fill:

```tsx
// In InvestorDashboard.tsx
import { FieldMapPlaceholder } from '@/components/dashboard/investor/placeholders'
import { ActivityFeedPlaceholder } from '@/components/dashboard/investor/placeholders'
import { FinanceSectionPlaceholder } from '@/components/dashboard/investor/placeholders'

// Inside return:
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">
    <FieldMapPlaceholder />   {/* task-04 replaces */}
  </div>
  <ActivityFeedPlaceholder /> {/* task-05 replaces */}
</div>

<SecondaryStats />

<FinanceSectionPlaceholder /> {/* task-06 replaces */}

<MarginalityBreakdown />
```

Create `frontend/src/components/dashboard/investor/placeholders.tsx`:

```tsx
export function FieldMapPlaceholder() {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface/30 backdrop-blur-sm h-[500px] flex items-center justify-center">
      <p className="text-fg-tertiary text-sm">NDVI field map — built in task-04</p>
    </div>
  )
}
export function ActivityFeedPlaceholder() {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface/30 backdrop-blur-sm h-[500px] flex items-center justify-center">
      <p className="text-fg-tertiary text-sm">Activity feed — built in task-05</p>
    </div>
  )
}
export function FinanceSectionPlaceholder() {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface/30 backdrop-blur-sm h-[200px] flex items-center justify-center">
      <p className="text-fg-tertiary text-sm">Finance section — built in task-06</p>
    </div>
  )
}
```

---

## Step 4 — Final InvestorDashboard.tsx

```tsx
import { HeroSection } from '@/components/dashboard/investor/HeroSection'
import { SecondaryStats } from '@/components/dashboard/investor/SecondaryStats'
import { MarginalityBreakdown } from '@/components/dashboard/investor/MarginalityBreakdown'
import {
  FieldMapPlaceholder, ActivityFeedPlaceholder, FinanceSectionPlaceholder,
} from '@/components/dashboard/investor/placeholders'

export default function InvestorDashboard() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 gradient-mesh-default -z-10">
        <div className="noise-overlay" />
      </div>

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <FieldMapPlaceholder />
          </div>
          <ActivityFeedPlaceholder />
        </div>

        <SecondaryStats />

        <FinanceSectionPlaceholder />

        <MarginalityBreakdown />
      </div>
    </div>
  )
}
```

---

## Acceptance criteria

- [ ] SecondaryStats renders with 4 cards (2 gauges + big number + sparkline+avatars)
- [ ] Semi-circle gauges animate fill from 0 on mount
- [ ] MarginalityBreakdown renders donut + horizontal bars
- [ ] Culture colors match tokens
- [ ] Placeholder cards for task-04/05/06 in place
- [ ] Full InvestorDashboard scrolls with gradient mesh background visible throughout
- [ ] All magic MCP components logged in _progress.md
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-03-investor-full.png` (full page scroll)
- `docs/screenshots/wave-1-5/task-03-secondary-stats.png` (just secondary row)
- `docs/screenshots/wave-1-5/task-03-marginality.png` (marginality section)

---

## Git

```bash
git add frontend/src/components/dashboard/investor/ \
        frontend/src/pages/dashboards/InvestorDashboard.tsx \
        frontend/src/components/ui/ \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): full InvestorDashboard layout via 21st components

- SecondaryStats: 2 semi-circle gauges + fuel eff + team perf (all from 21st)
- MarginalityBreakdown: donut + horizontal bars with culture colors
- placeholders for task-04/05/06
- InvestorDashboard composition complete except for field map / activity feed / finance section

Task: wave-1-5/task-03"
git push
```

Append to `_progress.md`.
