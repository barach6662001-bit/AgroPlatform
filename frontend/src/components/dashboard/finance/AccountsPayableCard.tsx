import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { fmt } from '@/hooks/useCountUp';

function dueDaysColor(days: number) {
  if (days < 0) return '#EF4444';
  if (days <= 7) return 'var(--accent-emerald-500)';
  if (days <= 14) return 'var(--accent-amber-500)';
  return 'var(--fg-tertiary)';
}

function dueDaysLabel(days: number) {
  if (days < 0) return `прострочено ${Math.abs(days)}д`;
  if (days === 0) return 'сьогодні';
  return `${days}д`;
}

export function AccountsPayableCard() {
  const { data } = useFinanceDashboard();
  const navigate = useNavigate();
  const payables = [...(data?.payables ?? [])].sort((a, b) => a.dueDays - b.dueDays);

  return (
    <div
      className="rounded-xl border p-5 card-hoverable"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>
          Кредиторська заборгованість
        </h3>
        <button
          className="text-xs flex items-center gap-1 group"
          style={{ color: 'var(--accent-blue-500)' }}
          onClick={() => navigate('/finance/payables')}
        >
          Всі <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="space-y-0">
        <div
          className="grid text-xs font-medium pb-2 mb-1"
          style={{ gridTemplateColumns: '1fr auto auto', color: 'var(--fg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span>Контрагент</span>
          <span className="text-right pr-4">Сума</span>
          <span className="text-right w-20">Термін</span>
        </div>
        {payables.map((p, i) => {
          const color = dueDaysColor(p.dueDays);
          return (
            <div
              key={p.id}
              className="grid items-center py-2 text-sm"
              style={{
                gridTemplateColumns: '1fr auto auto',
                borderBottom: i < payables.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <span style={{ color: 'var(--fg-secondary)' }}>{p.contractor}</span>
              <span className="tabular-nums text-right pr-4 font-medium" style={{ color: 'var(--fg-primary)' }}>
                {p.currency}{fmt.number(p.amount)}
              </span>
              <span className="text-xs text-right w-20 font-medium" style={{ color }}>
                {dueDaysLabel(p.dueDays)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
