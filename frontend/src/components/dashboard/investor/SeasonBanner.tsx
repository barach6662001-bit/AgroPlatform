import { motion } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeasonBannerProps {
  season: string;
  day: number;
  totalDays: number;
  status: 'good' | 'warning' | 'critical';
  onAction?: () => void;
  className?: string;
}

const statusConfig = {
  good: {
    label: 'Задовільно · Загальний стан',
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
    badge: 'text-emerald-400',
  },
  warning: {
    label: 'Увага · Є проблеми',
    dot: 'bg-amber-500',
    ping: 'bg-amber-400',
    badge: 'text-amber-400',
  },
  critical: {
    label: 'Критично · Потрібна дія',
    dot: 'bg-red-500',
    ping: 'bg-red-400',
    badge: 'text-red-400',
  },
};

export function SeasonBanner({ season, day, totalDays, status, onAction, className }: SeasonBannerProps) {
  const cfg = statusConfig[status];
  const progress = (day / totalDays) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-5',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
        borderColor: 'var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Gradient accent top border */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent, var(--accent-emerald-500), transparent)' }}
      />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute -top-12 left-1/4 h-24 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: 'var(--accent-emerald-500)' }}
      />

      <div className="relative flex items-center justify-between gap-4">
        {/* Left: icon + season info */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--accent-emerald-500)18', color: 'var(--accent-emerald-500)' }}
          >
            <Leaf className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-base font-semibold tracking-tight"
                style={{ color: 'var(--fg-primary)' }}
              >
                {season}
              </span>
              {/* Pulse status indicator */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', cfg.ping)} />
                <span className={cn('relative inline-flex h-2 w-2 rounded-full', cfg.dot)} />
              </span>
            </div>

            <div className="mt-0.5 flex items-center gap-3">
              <span style={{ color: 'var(--fg-tertiary)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                День {day} / {totalDays}
              </span>
              <span
                className={cn('text-xs font-medium', cfg.badge)}
              >
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Center: progress bar */}
        <div className="hidden flex-1 max-w-xs md:block">
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--border-default)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--accent-emerald-600), var(--accent-emerald-400))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <div
            className="mt-1 text-right tabular-nums"
            style={{ color: 'var(--fg-tertiary)', fontSize: '10px' }}
          >
            {Math.round(progress)}% сезону
          </div>
        </div>

        {/* Right: CTA */}
        {onAction && (
          <button
            onClick={onAction}
            className="group/btn flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:gap-2.5"
            style={{
              background: 'var(--accent-emerald-500)18',
              color: 'var(--accent-emerald-500)',
              border: '1px solid var(--border-accent)',
            }}
          >
            + Додати поля
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
