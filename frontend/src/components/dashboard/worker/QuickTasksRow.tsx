import { ArrowRight, Package, ArrowLeftRight, Trash2, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';

export function QuickTasksRow() {
  const { data } = useWorkerDashboard();
  const navigate = useNavigate();
  const t = data?.tasks;

  const cards = [
    { icon: Package, label: 'Приймання', count: t?.receive ?? 0, suffix: 'в очікуванні', href: '/warehouse/receive', color: 'var(--accent-emerald-500)', urgent: (t?.receive ?? 0) > 0 },
    { icon: ArrowLeftRight, label: 'Переміщення', count: t?.transfer ?? 0, suffix: 'в очікуванні', href: '/warehouse/transfer', color: 'var(--accent-blue-500)', urgent: false },
    { icon: Trash2, label: 'Списання', count: t?.writeoff ?? 0, suffix: 'в очікуванні', href: '/warehouse/writeoff', color: 'var(--accent-amber-500)', urgent: false },
    { icon: ClipboardList, label: 'Інвентаризація', count: null, suffix: `Наступна: ${t?.nextInventory ?? '—'}`, href: '/warehouse/inventory', color: 'var(--accent-purple-500)', urgent: false },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.label}
            onClick={() => navigate(card.href)}
            className="rounded-lg border p-4 text-left flex items-center justify-between group transition-colors"
            style={{
              background: 'var(--bg-surface)',
              borderColor: card.urgent ? card.color : 'var(--border-subtle)',
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" style={{ color: card.color }} />
                <span className="text-sm font-medium" style={{ color: 'var(--fg-primary)' }}>{card.label}</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>
                {card.count !== null ? `${card.count} ${card.suffix}` : card.suffix}
              </div>
            </div>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              style={{ color: 'var(--fg-tertiary)' }}
            />
          </button>
        );
      })}
    </div>
  );
}
