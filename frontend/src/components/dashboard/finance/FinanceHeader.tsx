import { Download, SlidersHorizontal } from 'lucide-react';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';

export function FinanceHeader() {
  const { data } = useFinanceDashboard();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--fg-primary)' }}>
          Фінансовий огляд · {data?.quarter ?? 'Q2 2026'}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--fg-tertiary)' }}>
          Підбір по поточному кварталу
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--fg-secondary)' }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фільтри
        </button>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ background: 'var(--accent-emerald-500)', color: '#fff' }}
        >
          <Download className="h-4 w-4" />
          Excel
        </button>
      </div>
    </div>
  );
}
