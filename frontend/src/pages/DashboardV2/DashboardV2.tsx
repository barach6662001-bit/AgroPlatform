import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Banknote, Activity, TrendingUp } from 'lucide-react';
import type { DashboardDto } from '../../types/analytics';
import type { FieldDto } from '../../types/field';
import type { AgroOperationDto } from '../../types/operation';
import { useTranslation } from '../../i18n';
import { formatUA } from '../../utils/numberFormat';
import { computeTrend } from '../../utils/computeTrend';
import { formatPeriodRange } from '../../utils/formatPeriodRange';
import KpiHeroRow from '../Dashboard/components/KpiHeroRow';
import RevenueCostChart from '../Dashboard/components/RevenueCostChart';
import FieldStatusCard from '../Dashboard/components/FieldStatusCard';
import OperationsTimeline from '../Dashboard/components/OperationsTimeline';
import AlertsStrip from './components/AlertsStrip';
import WarehouseSnapshot from './components/WarehouseSnapshot';
import UpcomingPanel from './components/UpcomingPanel';
import s from './DashboardV2.module.css';

export type DashboardPeriod = 'day' | 'week' | 'month' | 'season';

export interface DashboardV2Props {
  data: DashboardDto;
  fields: FieldDto[];
  operations: AgroOperationDto[];
  /** Optional preview-only weather snapshot (no live API call). */
  weather?: { tempC: number; condition: 'clear' | 'cloudy'; location: string };
  /** Controlled period selection. If omitted, component manages its own state. */
  period?: DashboardPeriod;
  onPeriodChange?: (p: DashboardPeriod) => void;
}

type Period = DashboardPeriod;

/* ── Framer-motion variants — fade-in only, 60ms stagger per row ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const fadeIn = {
  hidden: { opacity: 0, y: 4 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const } },
};

/**
 * Pure presentational v2 dashboard.  Takes all data as props — no hooks,
 * no axios, no auth.  This makes it trivial to embed in the
 * /preview/dashboard-v2 route AND, after design approval, to wire into
 * the real /dashboard route by wrapping it in a hook-driven container.
 */
export default function DashboardV2({ data, fields, operations, weather, period: periodProp, onPeriodChange }: DashboardV2Props) {
  const { t, lang } = useTranslation();
  const dash = t.dashboard as Record<string, string | undefined>;
  const navigate = useNavigate();
  const [periodLocal, setPeriodLocal] = useState<Period>('season');
  const period = periodProp ?? periodLocal;
  const handlePeriodChange = useCallback((p: Period) => {
    if (onPeriodChange) onPeriodChange(p);
    else setPeriodLocal(p);
  }, [onPeriodChange]);

  /* Drill-down from the revenue/cost chart: each point's `name` is
     "YYYY-MM" (see costTrendData below). Clicking a point jumps to the
     Costs page pre-filtered to that month. */
  const handleChartPointClick = useCallback((name: string) => {
    const m = /^(\d{4})-(\d{2})$/.exec(name);
    if (!m) return;
    const year = Number(m[1]);
    const month = Number(m[2]); // 1-12
    const from = `${m[1]}-${m[2]}-01`;
    // last day of the month in UTC
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const to = `${m[1]}-${m[2]}-${String(lastDay).padStart(2, '0')}`;
    navigate(`/economics/costs?from=${from}&to=${to}`);
  }, [navigate]);

  /* KPI label resolver — uses dedicated i18n key per period so the card title
     reflects the selected range (day / week / month / season). */
  const periodLabel = (kind: 'expenses' | 'revenue' | 'profit'): string => {
    const map: Record<Period, Record<'expenses' | 'revenue' | 'profit', string | undefined>> = {
      day:    { expenses: dash.dayExpenses,    revenue: dash.dayRevenue,    profit: dash.dayProfit    },
      week:   { expenses: dash.weekExpenses,   revenue: dash.weekRevenue,   profit: dash.weekProfit   },
      month:  { expenses: dash.monthlyExpenses,revenue: dash.monthlyRevenue,profit: dash.monthlyProfit },
      season: { expenses: dash.seasonExpenses, revenue: dash.seasonRevenue, profit: dash.seasonProfit },
    };
    const fallback = { expenses: t.dashboard.monthlyExpenses, revenue: t.dashboard.monthlyRevenue, profit: t.dashboard.monthlyProfit } as const;
    return map[period][kind] ?? fallback[kind];
  };

  /* ── Derived figures ──────────────────────────────────── */
  const derived = useMemo(() => {
    const expenses = data.totalCosts || data.monthlyExpenses;
    const revenue  = data.totalRevenue || data.monthlyRevenue;
    const profit   = revenue - expenses;
    const margin   = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) + '%' : undefined;

    const expensesTrend = computeTrend(data.costTrend.map((p) => p.totalAmount));
    const revenueTrend  = computeTrend(data.costTrend.map((p) => p.revenueAmount));
    const profitTrend   = computeTrend(
      data.costTrend.map((p) =>
        typeof p.revenueAmount === 'number' ? p.revenueAmount - p.totalAmount : undefined,
      ),
    );

    return { expenses, revenue, profit, margin, expensesTrend, revenueTrend, profitTrend };
  }, [data]);

  /* Alerts derivation — same logic as production Dashboard */
  const today = new Date().toISOString().slice(0, 10);
  const overdueOperations = operations.filter(
    (op) => !op.isCompleted && op.plannedDate && op.plannedDate < today,
  ).length;

  /* KPI items — single accent (white for area, amber kept for expense semantics,
     green for revenue + profit hero).  All deltas are computed, never hardcoded. */
  const kpiItems = [
    {
      label: t.dashboard.totalArea,
      value: `${formatUA(data.totalAreaHectares)} ${dash.haUnit ?? 'га'}`,
      accentColor: 'rgba(255, 255, 255, 0.85)',
      icon: <Map size={16} strokeWidth={1.6} />,
      href: '/fields',
    },
    {
      label: periodLabel('expenses'),
      value: `${formatUA(derived.expenses)} ₴`,
      accentColor: '#F59E0B',
      icon: <Banknote size={16} strokeWidth={1.6} />,
      trend: derived.expenses > 0 ? derived.expensesTrend : undefined,
      href: '/economics',
    },
    {
      label: periodLabel('revenue'),
      value: `${formatUA(derived.revenue)} ₴`,
      accentColor: '#22C55E',
      icon: <Activity size={16} strokeWidth={1.6} />,
      trend: derived.revenue > 0 ? derived.revenueTrend : undefined,
      href: '/sales',
    },
    {
      label: periodLabel('profit'),
      value: `${formatUA(derived.profit)} ₴`,
      accentColor: '#22C55E',
      icon: <TrendingUp size={16} strokeWidth={1.6} />,
      hero: true,
      trend: derived.revenue > 0 ? derived.profitTrend : undefined,
      delta: derived.revenue > 0 ? derived.margin : undefined,
      deltaLabel: derived.revenue > 0 ? (dash.margin ?? 'маржа') : undefined,
      href: '/economics/pnl',
    },
  ];

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
    revenue: item.revenueAmount,
  }));
  const hasRevenueSeries = data.costTrend.some((p) => typeof p.revenueAmount === 'number');

  const periodOptions: Array<{ key: Period; label: string }> = [
    { key: 'day',    label: dash.day    ?? 'День'    },
    { key: 'week',   label: dash.week   ?? 'Тиждень' },
    { key: 'month',  label: dash.month  ?? 'Місяць'  },
    { key: 'season', label: dash.season ?? 'Сезон'   },
  ];

  return (
    <motion.div className={s.page} variants={container} initial="hidden" animate="show">
      {/* ── Header ── */}
      <motion.header className={s.header} variants={fadeIn}>
        <div className={s.headerLeft}>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} aria-hidden="true" />
            DASHBOARD / SEASON 2026
          </span>
          <h1 className={s.title}>{dash.commandCenter ?? t.dashboard.title}</h1>
          <p className={s.subtitle}>
            <span>{t.dashboard.subtitle}</span>
            <span className={s.sep}>·</span>
            <span>{formatUA(data.totalAreaHectares)} {dash.haUnit ?? 'га'}</span>
            <span className={s.sep}>·</span>
            <span>{data.totalFields} {dash.fieldsUnit ?? 'полів'}</span>
          </p>
        </div>
        <div className={s.headerRight}>
          <div className={s.segmented} role="tablist" aria-label="Period">
            {periodOptions.map((opt) => (
              <button
                key={opt.key}
                role="tab"
                aria-selected={period === opt.key}
                className={`${s.seg} ${period === opt.key ? s.segActive : ''}`}
                onClick={() => handlePeriodChange(opt.key)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className={s.rangeLabel} aria-live="polite">
            {formatPeriodRange(period, dash.allTime ?? 'Весь час', lang as 'uk' | 'en')}
          </div>
        </div>
      </motion.header>

      {/* ── Row 1 — At a glance (KPI hero) ── */}
      <motion.section className={s.row} variants={fadeIn} aria-label={dash.atGlance}>
        <h2 className={s.sectionLabel}>{dash.atGlance}</h2>
        <KpiHeroRow items={kpiItems} />
      </motion.section>

      {/* ── Row 2 — Alerts strip ── */}
      <motion.section className={s.row} variants={fadeIn}>
        <AlertsStrip
          underRepairMachines={data.underRepairMachines}
          pendingOperations={data.pendingOperations}
          overdueOperations={overdueOperations}
        />
      </motion.section>

      {/* ── Row 3 — Financial overview ── */}
      {costTrendData.length > 0 && (
        <motion.section id="financial" className={s.row} variants={fadeIn} aria-label={dash.financialOverview}>
          <h2 className={s.sectionLabel}>{dash.financialOverview}</h2>
          <RevenueCostChart
            data={costTrendData}
            title={t.dashboard.costTrend}
            costLabel={t.dashboard.costsUAH}
            revenueLabel={hasRevenueSeries ? dash.revenueLabel : undefined}
            onPointClick={handleChartPointClick}
          />
        </motion.section>
      )}

      {/* ── Row 4 — Field status + Recent operations ── */}
      <motion.section className={`${s.row} ${s.twoCol}`} variants={fadeIn}>
        <div>
          <h2 className={s.sectionLabel}>{dash.fieldStatus}</h2>
          <FieldStatusCard fields={fields} onAddField={() => { /* preview noop */ }} />
        </div>
        <div>
          <h2 className={s.sectionLabel}>{t.dashboard.recentOperations}</h2>
          <div className={s.card}>
            <OperationsTimeline operations={operations.slice(0, 7)} />
          </div>
        </div>
      </motion.section>

      {/* ── Row 5 — Warehouse snapshot + Upcoming ── */}
      <motion.section id="bottom" className={`${s.row} ${s.twoCol}`} variants={fadeIn}>
        <div>
          <h2 className={s.sectionLabel}>{dash.warehouseSnapshot}</h2>
          <div className={s.card}>
            <WarehouseSnapshot items={data.topStockItems} />
          </div>
        </div>
        <div>
          <h2 className={s.sectionLabel}>{dash.upcoming}</h2>
          <div className={s.card}>
            <UpcomingPanel operations={operations} weather={weather} />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
