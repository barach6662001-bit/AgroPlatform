import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { fmt } from '@/hooks/useCountUp';

export function CashflowTrendCard() {
  const { data } = useFinanceDashboard();
  const cashflow = data?.cashflow ?? [];

  return (
    <div
      className="rounded-xl border p-5 card-hoverable"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--fg-primary)' }}>
        Cashflow · 12 місяців
      </h3>
      <div className="h-48 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cashflow} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-emerald-500)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--accent-emerald-500)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--fg-tertiary)', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, name: string) => [fmt.currency(v), name === 'inflow' ? 'Надходження' : 'Витрати']}
            />
            <Area type="monotone" dataKey="inflow" stroke="var(--accent-emerald-500)" strokeWidth={2} fill="url(#inflowGrad)" />
            <Area type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={1.5} fill="url(#outflowGrad)" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm" style={{ background: 'var(--accent-emerald-500)' }} />
          <span className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>Надходження</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm" style={{ background: '#EF4444' }} />
          <span className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>Витрати</span>
        </div>
      </div>
    </div>
  );
}
