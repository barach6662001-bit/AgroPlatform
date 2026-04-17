import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { fmt } from '@/hooks/useCountUp';

export function UpcomingPaymentsCalendar() {
  const { data } = useFinanceDashboard();
  const navigate = useNavigate();
  const groups = data?.upcomingPayments ?? [];

  return (
    <div
      className="rounded-xl border p-5 card-hoverable"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>
          Майбутні платежі
        </h3>
        <button
          className="text-xs flex items-center gap-1 group"
          style={{ color: 'var(--accent-blue-500)' }}
          onClick={() => navigate('/finance/calendar')}
        >
          Календар <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.group}>
            <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--fg-tertiary)' }}>
              {group.group}
            </div>
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <span className="text-sm" style={{ color: 'var(--fg-secondary)' }}>{item.label}</span>
                <span className="tabular-nums text-sm font-semibold" style={{ color: 'var(--fg-primary)', fontFeatureSettings: '"tnum"' }}>
                  {fmt.currency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
