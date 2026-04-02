import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

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
    <div style={{
      padding: '20px 24px',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        color: 'var(--text-secondary)',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 600,
        color: 'var(--text-primary)',
        lineHeight: 1.1,
      }}>
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
            <span style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
