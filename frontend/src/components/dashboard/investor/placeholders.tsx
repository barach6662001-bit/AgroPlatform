export function FieldMapPlaceholder() {
  return (
    <div className="rounded-xl border h-[500px] flex items-center justify-center"
      style={{ borderColor: 'var(--border-subtle)', background: 'rgba(var(--bg-surface-rgb, 17,17,19), 0.3)', backdropFilter: 'blur(8px)' }}>
      <p className="text-sm" style={{ color: 'var(--fg-tertiary)' }}>NDVI field map — built in task-04</p>
    </div>
  );
}

export function ActivityFeedPlaceholder() {
  return (
    <div className="rounded-xl border h-[500px] flex items-center justify-center"
      style={{ borderColor: 'var(--border-subtle)', background: 'rgba(var(--bg-surface-rgb, 17,17,19), 0.3)', backdropFilter: 'blur(8px)' }}>
      <p className="text-sm" style={{ color: 'var(--fg-tertiary)' }}>Activity feed — built in task-05</p>
    </div>
  );
}

export function FinanceSectionPlaceholder() {
  return (
    <div className="rounded-xl border h-[200px] flex items-center justify-center"
      style={{ borderColor: 'var(--border-subtle)', background: 'rgba(var(--bg-surface-rgb, 17,17,19), 0.3)', backdropFilter: 'blur(8px)' }}>
      <p className="text-sm" style={{ color: 'var(--fg-tertiary)' }}>Finance section — built in task-06</p>
    </div>
  );
}
