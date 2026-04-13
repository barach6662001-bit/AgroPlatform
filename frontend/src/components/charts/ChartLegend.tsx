interface LegendItem {
  label: string;
  value: string | number;
  percentage?: string;
  color: string;
}

interface ChartLegendProps {
  items: LegendItem[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 0',
            borderBottom: i < items.length - 1 ? '1px solid var(--border-default, var(--border))' : undefined,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: item.color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
            {item.label}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {item.value}
          </span>
          {item.percentage && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {item.percentage}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
