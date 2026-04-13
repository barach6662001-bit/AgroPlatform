# DESIGN-P6: Charts & Data Visualization Upgrade

> Reference: `docs/design-system.md` section 4 (Data Visualization)
> Depends on: DESIGN-P1 completed
> Scope: Restyle all Recharts instances, create chart theme, fix donut/pie charts

---

## Steps

### Step 19: Create Recharts Theme Config

Create `frontend/src/components/charts/chartTheme.ts`:

```typescript
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
    stroke: 'rgba(255,255,255,0.04)',
    vertical: false, // horizontal lines only
  },
  xAxis: {
    fontSize: 11,
    fill: 'rgba(255,255,255,0.35)',
    tickLine: false,
    axisLine: false,
  },
  yAxis: {
    fontSize: 11,
    fill: 'rgba(255,255,255,0.35)',
    tickLine: false,
    axisLine: false,
    width: 80,
  },
  tooltip: {
    contentStyle: {
      background: '#1A2332',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.92)',
    },
    itemStyle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: '12px',
      padding: '2px 0',
    },
    labelStyle: {
      color: 'rgba(255,255,255,0.55)',
      fontSize: '11px',
      marginBottom: '4px',
    },
    cursor: { stroke: 'rgba(255,255,255,0.1)' },
  },
  bar: {
    radius: [4, 4, 0, 0] as [number, number, number, number],
    minBarSize: 24,
  },
  area: {
    fillOpacity: 0.15,
    strokeWidth: 2,
    dot: false,
    activeDot: {
      r: 4,
      fill: '#22C55E',
      stroke: '#0B1220',
      strokeWidth: 2,
    },
  },
  pie: {
    innerRadius: '65%',
    outerRadius: '85%',
    paddingAngle: 2,
    cornerRadius: 4,
  },
  legend: {
    iconSize: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
};
```

### Step 20: Apply Chart Theme Globally

Find all Recharts usages across pages. Apply the theme config:

**Files to find and update** (search for imports from 'recharts'):
- `frontend/src/pages/Dashboard.tsx` (if it has charts)
- `frontend/src/pages/Economics/CostAnalytics.tsx`
- `frontend/src/pages/Economics/FieldPnl.tsx`
- `frontend/src/pages/Economics/BudgetPage.tsx`
- `frontend/src/pages/Economics/MarginalityDashboard.tsx`
- `frontend/src/pages/Economics/SeasonComparison.tsx`
- `frontend/src/pages/Economics/BreakEvenCalculator.tsx`
- `frontend/src/pages/Analytics/ResourceConsumption.tsx`
- `frontend/src/pages/Analytics/FieldEfficiency.tsx`
- `frontend/src/pages/Analytics/MarginalityDashboard.tsx`
- `frontend/src/pages/Analytics/SalaryFuelAnalytics.tsx`
- `frontend/src/pages/Sales/RevenueAnalytics.tsx`
- Any other files importing from 'recharts'

For each file, apply:

**CartesianGrid:**
```tsx
<CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={chartConfig.grid.stroke} vertical={false} />
```

**XAxis / YAxis:**
```tsx
<XAxis
  dataKey="..."
  tick={{ fontSize: chartConfig.xAxis.fontSize, fill: chartConfig.xAxis.fill }}
  tickLine={false}
  axisLine={false}
/>
<YAxis
  tick={{ fontSize: chartConfig.yAxis.fontSize, fill: chartConfig.yAxis.fill }}
  tickLine={false}
  axisLine={false}
  width={80}
  tickFormatter={(v) => new Intl.NumberFormat('uk-UA').format(v)}
/>
```

**Tooltip:**
```tsx
<Tooltip contentStyle={chartConfig.tooltip.contentStyle} itemStyle={chartConfig.tooltip.itemStyle} labelStyle={chartConfig.tooltip.labelStyle} cursor={chartConfig.tooltip.cursor} />
```

**Bar charts:**
```tsx
<Bar dataKey="..." fill={chartColors.primary} radius={chartConfig.bar.radius} />
```

**Area charts:**
```tsx
<defs>
  <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.2} />
    <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
  </linearGradient>
</defs>
<Area
  dataKey="..."
  stroke={chartColors.primary}
  fill="url(#gradientGreen)"
  strokeWidth={2}
  dot={false}
  activeDot={chartConfig.area.activeDot}
/>
```

### Step 21: Fix Bar Chart Colors

On dark theme, bars are nearly invisible. For each bar chart:

- Revenue/Income bars: use `chartColors.primary` (#22C55E)
- Cost/Expense bars: use `chartColors.danger` (#EF4444) or `chartColors.secondary` (#3B82F6)
- Planned/Budget bars: use outline style — `fill="transparent"` + `stroke={chartColors.warning}` + `strokeWidth={2}`
- Comparison bars (Plan vs Fact): Plan = ghost outline, Fact = solid fill

For stacked/grouped bars, use `chartPalette` array for consistent sequential colors.

### Step 22: Redesign Pie/Donut Charts

Find all PieChart / Pie usages (likely in CostAnalytics.tsx and other analytics pages).

**Replace with donut style:**
```tsx
<PieChart>
  <Pie
    data={data}
    dataKey="value"
    cx="50%"
    cy="50%"
    innerRadius="65%"
    outerRadius="85%"
    paddingAngle={2}
    cornerRadius={4}
  >
    {data.map((entry, index) => (
      <Cell key={index} fill={chartPalette[index % chartPalette.length]} />
    ))}
  </Pie>
  <Tooltip contentStyle={chartConfig.tooltip.contentStyle} />
</PieChart>
```

**Replace default legend with custom vertical legend:**

Create `frontend/src/components/charts/ChartLegend.tsx`:

```tsx
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
  // Render vertical list:
  // Each row: [●] Label ................. Value (Percentage)
  // Dot: 8px circle, background: item.color
  // Label: 13px, var(--text-primary)
  // Value: 13px, var(--text-primary), right-aligned, tabular-nums
  // Percentage: 12px, var(--text-secondary)
  // Row padding: 8px 0, border-bottom: 1px solid var(--border-default) (except last)
}
```

Place the donut chart (50% width) and legend (50% width) side by side in a flex row.

---

## Verification

1. `npx tsc --noEmit` — pass
2. `npm run build` — pass
3. All charts: no axis lines, horizontal-only dashed grid, dark tooltip
4. Bar charts: bars are clearly visible with vibrant colors
5. Pie charts: donut style with inner radius, custom legend beside them
6. Area charts: gradient fill fading to transparent
7. Numbers on axes use space separator formatting
