import { AlertTriangle, Info, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useManagerDashboard } from '@/hooks/useManagerDashboard';

const SEVERITY_ORDER = { danger: 0, warning: 1, info: 2 };

const SEVERITY_COLOR = {
  danger: '#EF4444',
  warning: 'var(--accent-amber-500)',
  info: 'var(--accent-blue-500)',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SEVERITY_ICON: Record<string, React.ComponentType<any>> = {
  danger: Zap,
  warning: AlertTriangle,
  info: Info,
};

export function AlertsPanel() {
  const { data } = useManagerDashboard();
  const navigate = useNavigate();
  const alerts = [...(data?.alerts ?? [])].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <div
      className="rounded-xl border p-5 flex flex-col"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Сповіщення</h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}
        >
          {alerts.filter((a) => a.severity === 'danger').length} критичних
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {alerts.map((alert) => {
          const color = SEVERITY_COLOR[alert.severity];
          const Icon = SEVERITY_ICON[alert.severity];
          return (
            <div
              key={alert.id}
              className="rounded-lg p-3 flex items-start gap-3"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${color}18`, color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--fg-primary)' }}>{alert.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--fg-tertiary)' }}>{alert.description}</p>
                {alert.action && (
                  <button
                    className="mt-2 flex items-center gap-1 text-xs font-medium group"
                    style={{ color }}
                    onClick={() => alert.action?.href && navigate(alert.action.href)}
                  >
                    {alert.action.label}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
