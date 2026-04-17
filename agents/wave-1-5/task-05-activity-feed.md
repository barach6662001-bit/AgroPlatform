# Task 05 — Live Activity Feed

**Goal:** Replace ActivityFeedPlaceholder with a real-time activity feed showing recent operations. Via magic MCP.

**Depends on:** task-03

---

## Step 1 — Magic MCP search

Queries:
1. `"timeline activity feed with avatars and relative timestamps"`
2. `"real-time events feed with status icons and user info"`
3. `"notification feed with categories and actions"`

Install chosen component. Adapt to our data shape.

---

## Step 2 — Data hook

Create `frontend/src/hooks/useActivityFeed.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

export type ActivityKind =
  | 'harvest_completed' | 'harvest_started'
  | 'field_sprayed' | 'field_fertilized'
  | 'gps_synced' | 'device_alert'
  | 'invoice_paid' | 'invoice_overdue'
  | 'shift_started' | 'shift_ended'
  | 'batch_received' | 'batch_transferred'

export interface ActivityItem {
  id: string
  kind: ActivityKind
  title: string
  subtitle?: string
  timestamp: string       // ISO
  actor?: { name: string; initials: string; avatarUrl?: string }
  link?: string           // e.g. '/fields/XRI-BOT-001'
  severity?: 'info' | 'success' | 'warning' | 'danger'
}

export function useActivityFeed(limit = 10) {
  return useQuery<ActivityItem[]>({
    queryKey: ['activity-feed', limit],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/dashboard/activity?limit=${limit}`, { credentials: 'include' })
        if (!res.ok) throw new Error('not ready')
        return await res.json()
      } catch {
        // Mock
        const now = Date.now()
        return [
          {
            id: 'a1', kind: 'harvest_completed',
            title: 'Збір врожаю завершено',
            subtitle: 'Поле XRI-BOT-001 · 96.06 га',
            timestamp: new Date(now - 2*60_000).toISOString(),
            actor: { name: 'Podolyanuk V.', initials: 'PV' },
            link: '/fields/XRI-BOT-001', severity: 'success',
          },
          {
            id: 'a2', kind: 'gps_synced',
            title: 'GPS синхронізовано',
            subtitle: 'CASE 310 · позиція оновлена',
            timestamp: new Date(now - 15*60_000).toISOString(),
            actor: { name: 'System', initials: 'SY' },
            severity: 'info',
          },
          {
            id: 'a3', kind: 'invoice_paid',
            title: 'Оплачено рахунок',
            subtitle: '₴186,450 · ТОВ "Хіллс Трейд ЛТД"',
            timestamp: new Date(now - 60*60_000).toISOString(),
            actor: { name: 'Finance bot', initials: 'FI' },
            severity: 'success',
          },
          {
            id: 'a4', kind: 'field_fertilized',
            title: 'Внесено добрива',
            subtitle: 'Поле HRY-PEN-008 · 83.23 га · Azoter',
            timestamp: new Date(now - 3*60*60_000).toISOString(),
            actor: { name: 'Migov V.', initials: 'MV' },
            link: '/fields/HRY-PEN-008', severity: 'info',
          },
          {
            id: 'a5', kind: 'device_alert',
            title: 'Паливо низьке',
            subtitle: 'WH-Silo-2 · залишок 15%',
            timestamp: new Date(now - 5*60*60_000).toISOString(),
            actor: { name: 'Sensor', initials: 'SN' },
            severity: 'warning',
          },
          {
            id: 'a6', kind: 'batch_received',
            title: 'Прийнято партію',
            subtitle: 'B-042 · 12.5 т · Кукурудза',
            timestamp: new Date(now - 8*60*60_000).toISOString(),
            actor: { name: 'Lyzko Yu.', initials: 'LY' },
            severity: 'info',
          },
          {
            id: 'a7', kind: 'shift_started',
            title: 'Зміна почалась',
            subtitle: '5 працівників у полі',
            timestamp: new Date(now - 10*60*60_000).toISOString(),
            actor: { name: 'Morgunok A.', initials: 'MA' },
            severity: 'info',
          },
        ]
      }
    },
    refetchInterval: 30_000,
  })
}
```

---

## Step 3 — Activity feed component

Create `frontend/src/components/dashboard/investor/ActivityFeed.tsx`:

```tsx
import { useActivityFeed, type ActivityItem } from '@/hooks/useActivityFeed'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Zap, AlertTriangle, Satellite, CreditCard,
  Sprout, Truck, User, ArrowRight,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  harvest_completed: CheckCircle2, harvest_started: Truck,
  field_sprayed: Sprout, field_fertilized: Sprout,
  gps_synced: Satellite, device_alert: AlertTriangle,
  invoice_paid: CreditCard, invoice_overdue: CreditCard,
  shift_started: User, shift_ended: User,
  batch_received: Zap, batch_transferred: Zap,
}

const SEVERITY_COLOR: Record<string, string> = {
  info: 'var(--accent-blue-500)',
  success: 'var(--accent-emerald-500)',
  warning: 'var(--accent-amber-500)',
  danger: 'var(--danger, #EF4444)',
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diffMs / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export function ActivityFeed() {
  const { data: items = [], isLoading } = useActivityFeed(10)
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="skeleton-shimmer h-[500px] rounded-xl" />
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface/30 backdrop-blur-sm h-[500px] flex flex-col">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <div>
          <h2 className="text-section-title text-fg-primary">Активність</h2>
          <p className="text-xs text-fg-tertiary">Live feed · оновлюється кожні 30с</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-fg-secondary">live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item, i) => (
          <ActivityRow
            key={item.id}
            item={item}
            delay={i * 80}
            onClick={() => item.link && navigate(item.link)}
          />
        ))}
      </div>

      <div className="border-t border-border-subtle px-5 py-3">
        <button
          className="text-sm text-fg-secondary hover:text-fg-primary transition-colors flex items-center gap-1 group"
          onClick={() => navigate('/activity')}
        >
          Усі події
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}

function ActivityRow({
  item, delay, onClick,
}: { item: ActivityItem; delay: number; onClick: () => void }) {
  const Icon = ICON_MAP[item.kind] ?? CheckCircle2
  const color = SEVERITY_COLOR[item.severity ?? 'info']

  return (
    <button
      onClick={onClick}
      style={{
        animation: `fadeInUp 400ms ${delay}ms ease-out backwards`,
      }}
      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-bg-elevated transition-colors text-left"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
        style={{ background: `${color}15`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-fg-primary truncate">{item.title}</p>
          <span className="text-xs text-fg-tertiary shrink-0 tabular-nums">
            {relativeTime(item.timestamp)}
          </span>
        </div>
        {item.subtitle && (
          <p className="text-xs text-fg-secondary truncate mt-0.5">{item.subtitle}</p>
        )}
        {item.actor && (
          <p className="text-xs text-fg-tertiary mt-1">by {item.actor.name}</p>
        )}
      </div>
    </button>
  )
}
```

Add keyframe to tokens.css (or global CSS):

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Step 4 — Replace placeholder

In `InvestorDashboard.tsx`:
- Remove `ActivityFeedPlaceholder` import
- Import `ActivityFeed`
- Replace `<ActivityFeedPlaceholder />` with `<ActivityFeed />`

---

## Acceptance criteria

- [ ] ActivityFeed renders 7 mock events on load
- [ ] Each row has icon (colored by severity), title, subtitle, relative timestamp, actor
- [ ] Staggered fade-in animation on mount (80ms per row)
- [ ] Live indicator dot pulses
- [ ] Feed auto-refetches every 30s
- [ ] Click row with link → navigates
- [ ] "Усі події" button at bottom
- [ ] Scrolls within its own 500px height
- [ ] Shimmer skeleton during load
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-05-activity-feed.png`

---

## Git

```bash
git add frontend/src/components/dashboard/investor/ActivityFeed.tsx \
        frontend/src/hooks/useActivityFeed.ts \
        frontend/src/pages/dashboards/InvestorDashboard.tsx \
        frontend/src/styles/tokens.css \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): live activity feed with staggered fade-in

- ActivityFeed component (21st-inspired, adapted)
- 12 activity kinds with semantic icons + colors
- Relative timestamps (2s, 5m, 3h, 2d)
- Staggered fadeInUp animation on mount
- Live indicator + polling every 30s
- Mock fallback with 7 realistic events
- Navigates to related pages on row click

Task: wave-1-5/task-05"
git push
```

Append to `_progress.md`.
