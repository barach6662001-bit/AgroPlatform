import { ArrowRight, ClipboardList, Clock, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useManagerDashboard } from '@/hooks/useManagerDashboard';

export function TasksToApprove() {
  const { data } = useManagerDashboard();
  const navigate = useNavigate();
  const approvals = data?.approvals;

  const items = [
    { icon: ClipboardList, label: 'Операції', count: approvals?.operations ?? 0, href: '/operations/pending', color: 'var(--accent-blue-500)' },
    { icon: Clock, label: 'Табелі', count: approvals?.timesheets ?? 0, href: '/timesheets/pending', color: 'var(--accent-emerald-500)' },
    { icon: ShoppingCart, label: 'Закупівлі', count: approvals?.purchases ?? 0, href: '/purchases/pending', color: 'var(--accent-amber-500)' },
  ];

  const total = (approvals?.operations ?? 0) + (approvals?.timesheets ?? 0) + (approvals?.purchases ?? 0);

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>
          Очікує підтвердження
        </h3>
        {total > 0 && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}
          >
            {total}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors group"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${item.color}18`, color: item.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm" style={{ color: 'var(--fg-secondary)' }}>{item.label}</span>
              <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--fg-primary)' }}>
                {item.count}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--fg-tertiary)' }} />
            </button>
          );
        })}
      </div>

      <button
        className="mt-4 w-full text-sm flex items-center justify-center gap-1 group"
        style={{ color: 'var(--fg-tertiary)' }}
        onClick={() => navigate('/approvals')}
      >
        Переглянути всі
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
