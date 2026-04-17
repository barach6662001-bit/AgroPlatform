import { TrendingUp, TrendingDown, AlertCircle, Percent } from 'lucide-react';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { useCountUp, fmt } from '@/hooks/useCountUp';

function KPICard({ icon: Icon, label, value, delta, deltaLabel, color, danger = false }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; delta: number; deltaLabel: string;
  color: string; danger?: boolean;
}) {
  const animated = useCountUp(value);
  const positive = delta >= 0;
  return (
    <div
      className="rounded-xl border p-4 card-hoverable"
      style={{ background: 'var(--bg-surface)', borderColor: danger ? '#EF444430' : 'var(--border-subtle)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${color}18`, color }}>
          <Icon className="h-5 w-5" />
        </div>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded-full"
          style={{
            background: positive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: positive ? 'var(--accent-emerald-400, #34d399)' : '#fca5a5',
          }}
        >
          {positive ? '+' : ''}{delta.toFixed(1)}%
        </span>
      </div>
      <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--fg-primary)', fontFeatureSettings: '"tnum"' }}>
        {deltaLabel === '%' ? `${animated.toFixed(1)}%` : fmt.currency(animated)}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--fg-tertiary)' }}>{label}</div>
    </div>
  );
}

export function FinanceKPIGrid() {
  const { data } = useFinanceDashboard();
  const k = data?.kpis;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard icon={TrendingUp} label="Надходження" value={k?.cashIn ?? 0} delta={k?.cashInDelta ?? 0} deltaLabel="₴" color="var(--accent-emerald-500)" />
      <KPICard icon={TrendingDown} label="Витрати" value={k?.cashOut ?? 0} delta={k?.cashOutDelta ?? 0} deltaLabel="₴" color="var(--accent-blue-500)" />
      <KPICard icon={Percent} label="Чиста маржа" value={k?.netMargin ?? 0} delta={k?.netMarginDelta ?? 0} deltaLabel="%" color="var(--accent-purple-500)" />
      <KPICard icon={AlertCircle} label="Прострочена дебіторка" value={k?.overdueReceivables ?? 0} delta={-(k?.oldestDays ?? 0)} deltaLabel="₴" color="#EF4444" danger />
    </div>
  );
}
