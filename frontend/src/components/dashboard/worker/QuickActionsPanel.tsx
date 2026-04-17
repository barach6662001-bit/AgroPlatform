import { Plus, ArrowLeftRight, Minus, ClipboardList, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { icon: Plus, label: '+ Приймання', href: '/warehouse/receive', color: 'var(--accent-emerald-500)' },
  { icon: ArrowLeftRight, label: '↔ Переміщення', href: '/warehouse/transfer', color: 'var(--accent-blue-500)' },
  { icon: Minus, label: '− Списання', href: '/warehouse/writeoff', color: 'var(--accent-amber-500)' },
  { icon: ClipboardList, label: '≡ Інвентаризація', href: '/warehouse/inventory', color: 'var(--accent-purple-500)' },
  { icon: BarChart3, label: '📊 Денний звіт', href: '/reports/daily', color: 'var(--fg-secondary)' },
];

export function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--fg-primary)' }}>
        Швидкі дії
      </h3>
      <div className="space-y-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
              style={{ background: 'var(--bg-elevated)', color: 'var(--fg-secondary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = `${action.color}18`;
                (e.currentTarget as HTMLElement).style.color = action.color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                (e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)';
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
