import { FileText } from 'lucide-react';
import { useManagerDashboard } from '@/hooks/useManagerDashboard';

export function ManagerHeader() {
  const { data } = useManagerDashboard();
  const g = data?.greeting;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--fg-primary)' }}>
          Ранковий огляд
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--fg-tertiary)' }}>
          {g ? `${g.dateText} · ${g.timeText}` : '—'}{g ? ` · Привіт, ${g.userName}` : ''}
        </p>
      </div>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--fg-secondary)',
        }}
      >
        <FileText className="h-4 w-4" />
        Генерувати звіт
      </button>
    </div>
  );
}
