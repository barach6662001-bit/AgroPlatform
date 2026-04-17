import CountUp from 'react-countup';
import s from './KpiCard.module.css';

interface Props {
  label: string;
  value: string | number;
  trend?: { value: number; label?: string };
  delta?: string;
  deltaLabel?: string;
  prefix?: string;
  suffix?: string;
  hero?: boolean;
  accentColor?: string;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'hero';
}

function parseNumeric(value: string | number): { num: number; suffix: string; decimals: number } | null {
  if (typeof value === 'number') {
    return { num: value, suffix: '', decimals: value % 1 !== 0 ? 2 : 0 };
  }
  const match = value.match(/^([\d\s.,]+)\s*(.*)$/);
  if (!match) return null;
  const raw = match[1].replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(raw);
  if (isNaN(num)) return null;
  const decimalPart = raw.split('.')[1];
  return { num, suffix: match[2] ? ' ' + match[2] : '', decimals: decimalPart ? decimalPart.length : 0 };
}

export default function KpiCard({ label, value, trend, delta, deltaLabel, prefix, suffix, hero, accentColor, onClick, variant }: Props) {
  const trendColor = trend && trend.value >= 0 ? 'var(--success)' : 'var(--error)';
  const trendIcon = trend ? (trend.value >= 0 ? '↑' : '↓') : '';
  const parsed = parseNumeric(value);
  const accent = accentColor ?? '#22C55E';
  const isHero = hero || variant === 'hero';
  const isCompact = variant === 'compact';

  return (
    <div
      className={`${s.card} ${isHero ? s.hero : ''} ${isCompact ? s.compact : ''} ${onClick ? s.clickable : ''}`}
      style={{ '--kpi-accent': accent } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className={s.label}>
        {label}
      </div>
      <div className={isHero ? s.valueHero : isCompact ? s.valueCompact : s.value}>
        {prefix}
        {parsed ? (
          <CountUp
            end={parsed.num}
            duration={0.8}
            separator=" "
            decimal=","
            decimals={parsed.decimals}
            suffix={parsed.suffix}
          />
        ) : value}
        {suffix}
      </div>
      {trend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 6,
          fontSize: 12,
          color: trendColor,
        }}>
          <span>{trendIcon} {Math.abs(trend.value)}%</span>
          {trend.label && (
            <span style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>{trend.label}</span>
          )}
        </div>
      )}
      {delta && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 6,
          fontSize: 12,
          color: 'var(--text-tertiary)',
        }}>
          <span>{delta}</span>
          {deltaLabel && <span>{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
