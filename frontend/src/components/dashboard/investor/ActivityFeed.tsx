import { useActivityFeed, type ActivityItem } from '@/hooks/useActivityFeed';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Zap, AlertTriangle, Satellite, CreditCard,
  Sprout, Truck, User, ArrowRight,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  harvest_completed: CheckCircle2, harvest_started: Truck,
  field_sprayed: Sprout, field_fertilized: Sprout,
  gps_synced: Satellite, device_alert: AlertTriangle,
  invoice_paid: CreditCard, invoice_overdue: CreditCard,
  shift_started: User, shift_ended: User,
  batch_received: Zap, batch_transferred: Zap,
};

const SEVERITY_COLOR: Record<string, string> = {
  info: 'var(--accent-blue-500)',
  success: 'var(--accent-emerald-500)',
  warning: 'var(--accent-amber-500)',
  danger: 'var(--danger, #EF4444)',
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function ActivityFeed() {
  const { data: items = [], isLoading } = useActivityFeed(10);
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="skeleton-shimmer h-[500px] rounded-xl" />;
  }

  return (
    <div
      className="rounded-xl border h-[500px] flex flex-col"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Активність</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg-tertiary)' }}>Live feed · оновлюється кожні 30с</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs" style={{ color: 'var(--fg-secondary)' }}>live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item, i) => (
          <ActivityRow
            key={item.id}
            item={item}
            delay={i * 80}
            onClick={() => item.link && navigate(item.link)}
          />
        ))}
      </div>

      <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          className="text-sm flex items-center gap-1 group transition-colors"
          style={{ color: 'var(--fg-secondary)' }}
          onClick={() => navigate('/activity')}
        >
          Усі події
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function ActivityRow({
  item, delay, onClick,
}: { item: ActivityItem; delay: number; onClick: () => void }) {
  const Icon = ICON_MAP[item.kind] ?? CheckCircle2;
  const color = SEVERITY_COLOR[item.severity ?? 'info'];

  return (
    <button
      onClick={onClick}
      style={{ animation: `fadeInUp 400ms ${delay}ms ease-out backwards` }}
      className="w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors"
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
        style={{ background: `${color}20`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--fg-primary)' }}>{item.title}</p>
          <span className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--fg-tertiary)' }}>
            {relativeTime(item.timestamp)}
          </span>
        </div>
        {item.subtitle && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--fg-secondary)' }}>{item.subtitle}</p>
        )}
        {item.actor && (
          <p className="text-xs mt-1" style={{ color: 'var(--fg-tertiary)' }}>by {item.actor.name}</p>
        )}
      </div>
    </button>
  );
}
