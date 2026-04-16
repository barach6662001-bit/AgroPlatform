export const chartColors = {
  primary: '#22C55E',
  primaryGradientEnd: '#16A34A',
  secondary: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
  accent: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
};

export const chartPalette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.warning,
  chartColors.accent,
  chartColors.pink,
  chartColors.cyan,
];

export const chartConfig = {
  grid: {
    strokeDasharray: '3 3',
    stroke: 'rgba(255,255,255,0.06)',
    vertical: false as const,
  },
  xAxis: {
    fontSize: 11,
    fill: '#6b7b9a',
    tickLine: false as const,
    axisLine: false as const,
  },
  yAxis: {
    fontSize: 11,
    fill: '#6b7b9a',
    tickLine: false as const,
    axisLine: false as const,
    width: 80,
  },
  tooltip: {
    contentStyle: {
      background: 'var(--bg-elevated, #111A2E)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px',
      padding: '10px 14px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.92)',
    },
    itemStyle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: '12px',
      padding: '2px 0',
    },
    labelStyle: {
      color: 'rgba(255,255,255,0.45)',
      fontSize: '11px',
      marginBottom: '4px',
    },
    cursor: { stroke: 'rgba(255,255,255,0.06)' },
  },
  bar: {
    radius: [4, 4, 0, 0] as [number, number, number, number],
  },
  area: {
    fillOpacity: 0.15,
    strokeWidth: 2,
    dot: false as const,
    activeDot: {
      r: 4,
      fill: '#22C55E',
      stroke: '#060B14',
      strokeWidth: 2,
    },
  },
  pie: {
    innerRadius: '65%',
    outerRadius: '85%',
    paddingAngle: 2,
    cornerRadius: 4,
  },
};
