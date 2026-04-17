import { Star } from 'lucide-react';
import { useManagerDashboard } from '@/hooks/useManagerDashboard';

export function TeamPerformance() {
  const { data } = useManagerDashboard();
  const team = data?.team ?? [];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--fg-primary)' }}>
        Команда · продуктивність
      </h3>
      <div className="space-y-3">
        {team.map((member) => (
          <div key={member.name} className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: 'var(--bg-elevated)', color: 'var(--fg-secondary)' }}
            >
              {member.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--fg-primary)' }}>
                {member.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>{member.metric}</div>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-3 w-3"
                  style={{
                    fill: s <= member.rating ? 'var(--accent-amber-500)' : 'transparent',
                    color: s <= member.rating ? 'var(--accent-amber-500)' : 'var(--fg-tertiary)',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
