import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useCountUp, fmt } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

type FormatType = 'currency' | 'percent' | 'number' | 'decimal';

interface KPICardProps {
  label: string;
  value: number;
  format?: FormatType;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  sparkline?: number[];
  accentColor?: string;
  glowColor?: string;
  index?: number;
}

function formatValue(v: number, format: FormatType): string {
  switch (format) {
    case 'currency': return fmt.currency(v);
    case 'percent': return fmt.percent(v);
    case 'decimal': return fmt.decimal(v);
    default: return fmt.number(v);
  }
}

export function KPICard({
  label,
  value,
  format = 'number',
  delta,
  deltaLabel,
  icon,
  sparkline = [],
  accentColor = 'var(--accent-emerald-500)',
  glowColor = 'var(--accent-emerald-glow)',
  index = 0,
}: KPICardProps) {
  const animated = useCountUp(value, 1400);
  const isPositive = delta === undefined || delta >= 0;
  const sparkData = sparkline.map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="group relative overflow-hidden rounded-xl border"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.02)',
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      whileHover={{
        boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 0 80px -20px ${glowColor}`,
      }}
    >
      {/* Top gradient accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-50 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div
            className="text-kpi-label mb-3"
            style={{ color: 'var(--fg-tertiary)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            {label}
          </div>
          {icon && (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
              style={{ background: `${accentColor}18`, color: accentColor }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div
          className="tabular-nums"
          style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--fg-primary)', lineHeight: 1, fontFeatureSettings: '"tnum"' }}
        >
          {formatValue(animated, format)}
        </div>

        {/* Delta */}
        {delta !== undefined && (
          <div className={cn('mt-1.5 flex items-center gap-1 text-xs font-medium')}>
            {isPositive
              ? <TrendingUp className="h-3 w-3" style={{ color: 'var(--success)' }} />
              : <TrendingDown className="h-3 w-3" style={{ color: 'var(--danger)' }} />
            }
            <span style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
              {isPositive ? '+' : ''}{fmt.percent(delta)}
            </span>
            {deltaLabel && (
              <span style={{ color: 'var(--fg-tertiary)' }}>{deltaLabel}</span>
            )}
          </div>
        )}

        {/* Sparkline */}
        {sparkData.length > 0 && (
          <div className="mt-4 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`spark-${label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
                  strokeWidth={1.5}
                  fill={`url(#spark-${label.replace(/\s/g,'')})`}
                  dot={false}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
