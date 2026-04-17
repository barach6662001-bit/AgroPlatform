import { Activity, Users, Wrench, Cloud } from 'lucide-react';
import { useManagerDashboard } from '@/hooks/useManagerDashboard';

export function ManagerKPIGrid() {
  const { data } = useManagerDashboard();
  const k = data?.kpis;

  const cards = [
    {
      icon: Activity,
      label: 'Операції сьогодні',
      value: k ? String(k.operationsToday) : '—',
      sub: k ? `${k.operationsCritical} критичних` : '',
      color: 'var(--accent-blue-500)',
      alert: k && k.operationsCritical > 0,
    },
    {
      icon: Users,
      label: 'Активна команда',
      value: k ? `${k.activeTeam}/${k.totalTeam}` : '—',
      sub: k ? `відсутні: ${k.absent.length}` : '',
      color: 'var(--accent-emerald-500)',
      alert: false,
    },
    {
      icon: Wrench,
      label: 'Техніка онлайн',
      value: k ? `${k.equipmentOnline}/${k.equipmentTotal}` : '—',
      sub: k ? `${k.equipmentService} на обслуговуванні` : '',
      color: 'var(--accent-purple-500)',
      alert: false,
    },
    {
      icon: Cloud,
      label: 'Погода на полях',
      value: k ? `${k.weather.temp}°C` : '—',
      sub: k ? `${k.weather.condition} · ${k.weather.rainDaysWeek} дні дощу` : '',
      color: 'var(--accent-amber-500)',
      alert: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="rounded-xl border p-4 card-hoverable"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: `${c.color}18`, color: c.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              {c.alert && (
                <span className="h-2 w-2 rounded-full bg-red-500 mt-1" />
              )}
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--fg-primary)', fontFeatureSettings: '"tnum"' }}>
              {c.value}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--fg-tertiary)' }}>{c.label}</div>
            {c.sub && (
              <div className="text-xs mt-0.5" style={{ color: 'var(--fg-tertiary)' }}>{c.sub}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
