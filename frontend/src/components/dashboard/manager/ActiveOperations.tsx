import { motion } from 'framer-motion';
import { useManagerDashboard } from '@/hooks/useManagerDashboard';

const STATUS_COLOR = {
  ok: 'var(--accent-emerald-500)',
  warning: 'var(--accent-amber-500)',
  critical: '#EF4444',
};

export function ActiveOperations() {
  const { data } = useManagerDashboard();
  const ops = data?.activeOperations ?? [];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Активні операції</h3>
        <span className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>{ops.length} активних</span>
      </div>

      <div className="space-y-3">
        {ops.map((op, i) => {
          const color = STATUS_COLOR[op.status];
          return (
            <motion.div
              key={op.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="rounded-lg p-3"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                  />
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--fg-primary)' }}>
                    {op.type}
                  </span>
                </div>
                <span className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--fg-tertiary)' }}>
                  {op.speed}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'var(--fg-tertiary)' }}>
                <span>{op.worker}</span>
                <span>·</span>
                <span>{op.equipment}</span>
                <span>·</span>
                <span>{op.field}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${op.progress}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <span className="text-xs tabular-nums shrink-0" style={{ color: 'var(--fg-tertiary)' }}>
                  {op.progress}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
