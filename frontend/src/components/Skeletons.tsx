import { Skeleton } from 'antd';

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <Skeleton.Input active size="small" style={{ width: 80, marginBottom: 12 }} />
          <Skeleton.Input active size="large" style={{ width: 140 }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-default)',
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton.Input key={i} active size="small" style={{ width: '70%', height: 12 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '16px',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton.Input key={c} active size="small" style={{ width: '65%', height: 14 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div style={{
      background: 'var(--color-card-bg)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Skeleton.Node active style={{ width: '90%', height: height - 60 }}>
        <span />
      </Skeleton.Node>
    </div>
  );
}
