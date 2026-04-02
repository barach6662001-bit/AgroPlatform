import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import s from './KpiCard.module.css';

interface Props {
  label: string;
  value: string | number;
  trend?: { value: number; label?: string };
  prefix?: string;
  suffix?: string;
}

export default function KpiCard({ label, value, trend, prefix, suffix }: Props) {
  const trendColor = trend && trend.value >= 0 ? 'var(--success)' : 'var(--error)';

  return (
    <div className={s.padded}>
      <div className={s.upper}>
        {label}
      </div>
      <div className={s.text28}>
        {prefix}{value}{suffix}
      </div>
      {trend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 8,
          fontSize: 12,
          color: trendColor,
        }}>
          {trend.value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span>{Math.abs(trend.value)}%</span>
          {trend.label && (
            <span className={s.spaced}>{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
