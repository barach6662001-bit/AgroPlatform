import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatUA } from '../../../utils/numberFormat';
import { useCurrencySymbol, useConvertFromUah } from '../../../hooks/useFormatCurrency';
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
  /** Fires with the clicked point's `name` ("YYYY-MM"). Used for drill-down. */
  onPointClick?: (name: string) => void;
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

/** Compact money formatter using the user's currency symbol. */
function makeCompactFormatter(symbol: string, convert: (v: number) => number) {
  return (v: number): string => {
    const c = convert(v);
    if (Math.abs(c) >= 1_000_000) return `${(c / 1_000_000).toFixed(1).replace('.0', '')}M ${symbol}`;
    if (Math.abs(c) >= 1_000)     return `${Math.round(c / 1_000)}k ${symbol}`;
    return `${formatUA(c)} ${symbol}`;
  };
}

const CustomTooltip = ({ active, payload, label, profitLabel, currencySymbol, convert }: {
  active?: boolean; payload?: TooltipEntry[]; label?: string; profitLabel: string;
  currencySymbol: string; convert: (v: number) => number;
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
          <span className={s.tooltipValue}>{formatUA(convert(entry.value))} {currencySymbol}</span>
        </div>
      ))}
      {profit !== null && (
        <div className={s.tooltipFooter}>
          <span className={s.tooltipName}>{profitLabel}:</span>
          <span
            className={s.tooltipValue}
            style={{ color: profit >= 0 ? 'var(--success)' : 'var(--error)' }}
          >
            {profit >= 0 ? '+' : ''}{formatUA(convert(profit))} {currencySymbol}
          </span>
        </div>
      )}
    </div>
  );
};

export default function RevenueCostChart({ data, title, costLabel, revenueLabel, onPointClick }: Props) {
  const { t } = useTranslation();
  const currencySymbol = useCurrencySymbol();
  const convert = useConvertFromUah();
  const formatCompact = makeCompactFormatter(currencySymbol, convert);
  const profitLabel = (t.dashboard as Record<string, string | undefined>).profitDelta ?? 'Profit';
  const handleClick = onPointClick
    ? (state: { activeLabel?: string } | null) => {
        if (state?.activeLabel) onPointClick(state.activeLabel);
      }
    : undefined;
  return (
    <div className={s.card}>
      <div className={s.header}>
        <span className={s.title}>{title}</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          onClick={handleClick}
          style={onPointClick ? { cursor: 'pointer' } : undefined}
        >
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
            tickFormatter={formatCompact}
          />
          <Tooltip content={<CustomTooltip profitLabel={profitLabel} currencySymbol={currencySymbol} convert={convert} />} />
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
