import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatUA } from '../../../utils/numberFormat';
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
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
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
    </div>
  );
};

export default function RevenueCostChart({ data, title, costLabel, revenueLabel }: Props) {
  return (
    <div className={s.card}>
      <div className={s.header}>
        <span className={s.title}>{title}</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sans)' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
            axisLine={false} tickLine={false} width={64}
            tickFormatter={(v: number) => formatUA(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          {revenueLabel && (
            <Area
              type="monotone" dataKey="revenue" stroke="#22C55E"
              fill="url(#gradRevenue)" name={revenueLabel} strokeWidth={2}
              dot={false} activeDot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }}
            />
          )}
          <Area
            type="monotone" dataKey="cost" stroke="#EF4444"
            fill="url(#gradCost)" name={costLabel} strokeWidth={2}
            dot={false} activeDot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
          />
          {revenueLabel && (
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{value}</span>}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
