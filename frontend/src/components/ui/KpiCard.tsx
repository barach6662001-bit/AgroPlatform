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
}

export default function KpiCard({ label, value, trend, delta, deltaLabel, prefix, suffix, hero }: Props) {
  const trendColor = trend && trend.value >= 0 ? 'var(--success)' : 'var(--error)';
  const trendIcon = trend ? (trend.value >= 0 ? '↑' : '↓') : '';

  return (
    <div className={`${s.card} ${hero ? s.hero : ''}`}>
      <div className={s.label}>
        {label}
      </div>
      <div className={hero ? s.valueHero : s.value}>
        {prefix}{value}{suffix}
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
