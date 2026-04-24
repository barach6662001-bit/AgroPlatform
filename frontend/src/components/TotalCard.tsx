import type { ReactNode } from 'react';
import { Card } from 'antd';
import { useFormatCurrency } from '../hooks/useFormatCurrency';

interface TotalCardProps {
  valueUah: number;
  label: string;
  icon?: ReactNode;
  highlight?: boolean;
}

export default function TotalCard({ valueUah, label, icon, highlight = false }: TotalCardProps) {
  const fmt = useFormatCurrency();
  return (
    <Card
      data-testid="total-card"
      style={{
        background: highlight ? 'var(--info)' : 'var(--bg-surface)',
        border: highlight ? '1px solid var(--info)' : '1px solid var(--border)',
        boxShadow: highlight ? '0 4px 16px rgba(31,111,235,0.35)' : 'none',
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <span
          style={{
            color: highlight ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          color: highlight ? 'var(--bg-surface)' : 'var(--text-primary)',
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        {fmt(valueUah, { fractionDigits: 0 })}
      </div>
    </Card>
  );
}
