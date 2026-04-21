/**
 * PremiumChartTheme — shared Recharts config, gradient defs, and wrapper components.
 * All charts in the app should use these wrappers instead of raw Recharts components.
 */

import type { ReactNode } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import { formatUA } from '../../utils/numberFormat';

// ─── Colors ───────────────────────────────────────────────────────────────────

export const CHART_COLORS = {
  green:  '#22C55E',
  red:    '#EF4444',
  blue:   '#3B82F6',
  amber:  '#F59E0B',
  purple: '#A855F7',
  teal:   '#14B8A6',
  sky:    '#0EA5E9',
  slate:  '#94A3B8',
} as const;

export const CHART_PALETTE = Object.values(CHART_COLORS);

// ─── SVG gradient defs (embed inside charts) ──────────────────────────────────

export function PremiumGradients() {
  return (
    <defs>
      <linearGradient id="grad-green"  x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.18} />
        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="grad-red"    x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.18} />
        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="grad-blue"   x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.18} />
        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="grad-amber"  x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.18} />
        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="grad-purple" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="#A855F7" stopOpacity={0.18} />
        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

// ─── Shared axis / grid config ────────────────────────────────────────────────

export const premiumXAxis = {
  tick: { fontSize: 11, fill: 'rgba(255,255,255,0.35)', fontFamily: 'Inter,sans-serif' },
  axisLine: false,
  tickLine: false,
} as const;

export const premiumYAxis = (formatter?: (v: number) => string) => ({
  tick: { fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter,sans-serif' },
  axisLine: false,
  tickLine: false,
  width: 64,
  tickFormatter: formatter ?? ((v: number) => formatUA(v)),
});

export const premiumGrid = {
  strokeDasharray: '4 4',
  stroke: 'rgba(255,255,255,0.04)',
  vertical: false,
} as const;

// ─── Custom tooltip ───────────────────────────────────────────────────────────

export function PremiumTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      minWidth: 140,
    }}>
      {label && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 500 }}>
          {label}
        </div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.55)', flex: 1 }}>{entry.name}:</span>
          <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {typeof entry.value === 'number' ? formatUA(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Wrapper components ────────────────────────────────────────────────────────

interface BaseProps {
  data: Record<string, unknown>[];
  height?: number;
  children?: ReactNode;
}

interface AreaProps extends BaseProps {
  dataKey: string;
  color?: string;
  name?: string;
  gradientId?: string;
  yFormatter?: (v: number) => string;
}

export function PremiumAreaChart({ data, dataKey, color = '#22C55E', name, gradientId = 'grad-green', height = 260, yFormatter }: AreaProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <PremiumGradients />
        <CartesianGrid {...premiumGrid} />
        <XAxis dataKey="name" {...premiumXAxis} />
        <YAxis {...premiumYAxis(yFormatter)} />
        <Tooltip content={<PremiumTooltip />} />
        <Area
          type="monotone" dataKey={dataKey} stroke={color}
          fill={`url(#${gradientId})`} name={name ?? dataKey} strokeWidth={2}
          dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BarProps extends BaseProps {
  dataKey: string;
  color?: string;
  name?: string;
  yFormatter?: (v: number) => string;
}

export function PremiumBarChart({ data, dataKey, color = '#22C55E', name, height = 260, yFormatter }: BarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <PremiumGradients />
        <CartesianGrid {...premiumGrid} />
        <XAxis dataKey="name" {...premiumXAxis} />
        <YAxis {...premiumYAxis(yFormatter)} />
        <Tooltip content={<PremiumTooltip />} />
        <Bar dataKey={dataKey} fill={color} name={name ?? dataKey} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface LineProps extends BaseProps {
  lines: { dataKey: string; color: string; name?: string }[];
  yFormatter?: (v: number) => string;
}

export function PremiumLineChart({ data, lines, height = 260, yFormatter }: LineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid {...premiumGrid} />
        <XAxis dataKey="name" {...premiumXAxis} />
        <YAxis {...premiumYAxis(yFormatter)} />
        <Tooltip content={<PremiumTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{value}</span>}
        />
        {lines.map(l => (
          <Line
            key={l.dataKey} type="monotone" dataKey={l.dataKey}
            stroke={l.color} name={l.name ?? l.dataKey} strokeWidth={2}
            dot={false} activeDot={{ r: 4, fill: l.color, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DonutProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function PremiumDonutChart({ data, height = 240, innerRadius = 60, outerRadius = 90 }: DonutProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<PremiumTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface SparklineProps {
  data: Record<string, unknown>[];
  dataKey: string;
  color?: string;
  height?: number;
}

export function PremiumSparkline({ data, dataKey, color = '#22C55E', height = 40 }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
          dot={false} activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
