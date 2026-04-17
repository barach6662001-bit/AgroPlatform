import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';

export function MyRecentActivity() {
  const { data } = useWorkerDashboard();
  const activity = data?.myActivity ?? [];

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--fg-primary)' }}>
        Моя активність
      </h3>
      <div className="space-y-0">
        {activity.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-1.5"
            style={{ borderBottom: i < activity.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
          >
            <div className="min-w-0">
              <span className="text-sm" style={{ color: 'var(--fg-primary)' }}>{item.action}</span>
              {item.details && (
                <span className="text-xs ml-2" style={{ color: 'var(--fg-tertiary)' }}>{item.details}</span>
              )}
            </div>
            <span className="text-xs tabular-nums shrink-0 ml-3" style={{ color: 'var(--fg-tertiary)' }}>
              {item.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
