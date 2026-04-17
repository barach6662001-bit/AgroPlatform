import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useCountUp, fmt } from '@/hooks/useCountUp';

export function FinanceHighlights() {
  const { data, isLoading } = useFinanceData();

  if (isLoading) return <div className="skeleton-shimmer h-64 rounded-xl" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <EBITDATrendCard data={data?.cashflow ?? []} />
      <CostMonitoringCard categories={data?.costs ?? []} />
      <UpcomingPaymentsCard payments={data?.upcomingPayments ?? []} />
    </div>
  );
}

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
  );
}

function EBITDATrendCard({ data }: { data: Array<{ month: string; value: number }> }) {
  const current = data[data.length - 1]?.value ?? 0;
  const prev = data[data.length - 2]?.value ?? 0;
  const growth = prev > 0 ? ((current - prev) / prev) * 100 : 0;
  const animated = useCountUp(current);

  return (
    <div
      className="lg:col-span-2 rounded-xl border p-5 card-hoverable"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--fg-tertiary)' }}>
            EBITDA тренд · 12 місяців
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--fg-primary)', fontFeatureSettings: '"tnum"' }}>
              {fmt.currency(animated)}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: growth >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: growth >= 0 ? 'var(--accent-emerald-400, #34d399)' : '#fca5a5',
              }}
            >
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      <AreaChartWithGradient data={data} />
    </div>
  );
}

function CostMonitoringCard({ categories }: { categories: Array<{ name: string; plan: number; fact: number; color: string }> }) {
  return (
    <div
      className="rounded-xl border p-5 card-hoverable"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
    >
      <div className="text-xs uppercase tracking-wider font-medium mb-4" style={{ color: 'var(--fg-tertiary)' }}>
        Витрати · план / факт
      </div>
      <div className="space-y-3">
        {categories.map((cat) => {
          const pct = cat.plan > 0 ? (cat.fact / cat.plan) * 100 : 0;
          return (
            <div key={cat.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: 'var(--fg-secondary)' }}>{cat.name}</span>
                <span className="tabular-nums" style={{ color: 'var(--fg-tertiary)' }}>
                  {fmt.currency(cat.fact)} / {fmt.currency(cat.plan)}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: cat.color,
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UpcomingPaymentsCard({ payments }: { payments: Array<{ id: string; name: string; amount: number; dueDate: string; daysLeft: number }> }) {
  return (
    <div
      className="rounded-xl border p-5 card-hoverable"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
    >
      <div className="text-xs uppercase tracking-wider font-medium mb-4" style={{ color: 'var(--fg-tertiary)' }}>
        Майбутні платежі
      </div>
      <div className="space-y-3">
        {payments.slice(0, 4).map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm">
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium" style={{ color: 'var(--fg-primary)' }}>{p.name}</div>
              <div className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>
                через {p.daysLeft} {p.daysLeft === 1 ? 'день' : 'днів'}
              </div>
            </div>
            <div className="tabular-nums font-semibold ml-3 shrink-0" style={{ color: 'var(--fg-primary)', fontFeatureSettings: '"tnum"' }}>
              {fmt.currency(p.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
