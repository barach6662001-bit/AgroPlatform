import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatUA } from '../../../utils/numberFormat';
import { useTranslation } from '../../../i18n';
import s from './RevenueCostChart.module.css';

interface DataPoint {
  name: string;
  cost: number;
  revenue?: number;
}

interface Props {
  data: DataPoint[];
  title: string;
  costLabel: string;
  revenueLabel?: string;
}

interface TooltipEntry {
  color: string;
  name: string;
  value: number;
  dataKey?: string;
  payload?: DataPoint;
}

/* Chart series colours intentionally use literal hex values that mirror the
   design tokens (#22C55E === var(--acc) === var(--success);
   #F59E0B === var(--warning)). Recharts requires concrete colour strings for
   <Area> stroke/fill and <stop> stopColor — `var(...)` is not honoured by SVG
   attributes — so the literals stay locked to the same palette as the rest
   of the dashboard. If a token changes, update both places. */

/** Compact ₴ formatter: 1 250 000 → "1.25M ₴", 750 000 → "750k ₴" */
function formatCompactUAH(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.0', '')}M ₴`;
  if (Math.abs(v) >= 1_000)     return `${Math.round(v / 1_000)}k ₴`;
  return `${formatUA(v)} ₴`;
}

const CustomTooltip = ({ active, payload, label, profitLabel }: {
  active?: boolean; payload?: TooltipEntry[]; label?: string; profitLabel: string;
}) => {
  if (!active || !payload?.length) return null;
  const dp = payload[0]?.payload;
  const cost = dp?.cost ?? 0;
  const revenue = dp?.revenue;
  const profit = typeof revenue === 'number' ? revenue - cost : null;
  return (
    <div className={s.tooltip}>
      <div className={s.tooltipLabel}>{label}</div>
      {payload.map((entry: TooltipEntry, i: number) => (
        <div key={i} className={s.tooltipRow}>
          <span className={s.tooltipDot} style={{ background: entry.color }} />
          <span className={s.tooltipName}>{entry.name}:</span>
          <span className={s.tooltipValue}>{formatUA(entry.value)} ₴</span>
        </div>
      ))}
      {profit !== null && (
        <div className={s.tooltipFooter}>
          <span className={s.tooltipName}>{profitLabel}:</span>
          <span
            className={s.tooltipValue}
            style={{ color: profit >= 0 ? 'var(--success)' : 'var(--error)' }}
          >
            {profit >= 0 ? '+' : ''}{formatUA(profit)} ₴
          </span>
        </div>
      )}
    </div>
  );
};

export default function RevenueCostChart({ data, title, costLabel, revenueLabel }: Props) {
  const { t } = useTranslation();
  const profitLabel = (t.dashboard as Record<string, string | undefined>).profitDelta ?? 'Profit';
  return (
    <div className={s.card}>
      <div className={s.header}>
        <span className={s.title}>{title}</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-mono)' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false} tickLine={false} width={56}
            tickFormatter={formatCompactUAH}
          />
          <Tooltip content={<CustomTooltip profitLabel={profitLabel} />} />
          {revenueLabel && (
            <Area
              type="monotone" dataKey="revenue" stroke="#22C55E"
              fill="url(#gradRevenue)" name={revenueLabel} strokeWidth={2.2}
              dot={false} activeDot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }}
            />
          )}
          <Area
            type="monotone" dataKey="cost" stroke="#F59E0B"
            fill="url(#gradCost)" name={costLabel} strokeWidth={2.2}
            dot={false} activeDot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
          />
          {revenueLabel && (
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{value}</span>}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
