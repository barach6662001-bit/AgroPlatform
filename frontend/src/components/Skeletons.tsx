import { Skeleton } from 'antd';
import s from './Skeletons.module.css';

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={s.kpiGrid} style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={s.kpiCard}>
          <div className={s.shimmerBar} style={{ width: 64, height: 10, marginBottom: 12 }} />
          <div className={s.shimmerBar} style={{ width: 120, height: 28 }} />
          <div className={s.shimmerBar} style={{ width: 80, height: 10, marginTop: 10 }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className={s.tableWrap}>
      {/* Header row */}
      <div className={s.tableHeader} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className={s.shimmerBar} style={{ width: '60%', height: 10 }} />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={s.tableRow} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className={s.shimmerBar} style={{ width: `${50 + Math.random() * 35}%`, height: 13 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className={s.chartCard} style={{ height }}>
      <div className={s.shimmerBar} style={{ width: 160, height: 16, marginBottom: 20 }} />
      <div className={s.shimmerChart} style={{ height: height - 80 }} />
    </div>
  );
}

export function MapSkeleton({ height = 500 }: { height?: number }) {
  return (
    <div className={s.mapCard} style={{ height }}>
      <div className={s.mapGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${s.shimmerBar} ${s.mapBlock}`} />
        ))}
      </div>
    </div>
  );
}

// Forwarded Ant Skeleton for one-off use
export { Skeleton };
