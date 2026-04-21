import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Banknote, Activity, TrendingUp } from 'lucide-react';
import type { DashboardDto } from '../../types/analytics';
import type { FieldDto } from '../../types/field';
import type { AgroOperationDto } from '../../types/operation';
import { useTranslation } from '../../i18n';
import { formatUA } from '../../utils/numberFormat';
import { computeTrend } from '../../utils/computeTrend';
import KpiHeroRow from '../Dashboard/components/KpiHeroRow';
import RevenueCostChart from '../Dashboard/components/RevenueCostChart';
import FieldStatusCard from '../Dashboard/components/FieldStatusCard';
import OperationsTimeline from '../Dashboard/components/OperationsTimeline';
import AlertsStrip from './components/AlertsStrip';
import WarehouseSnapshot from './components/WarehouseSnapshot';
import UpcomingPanel from './components/UpcomingPanel';
import s from './DashboardV2.module.css';

export interface DashboardV2Props {
  data: DashboardDto;
  fields: FieldDto[];
  operations: AgroOperationDto[];
  /** Optional preview-only weather snapshot (no live API call). */
  weather?: { tempC: number; condition: 'clear' | 'cloudy'; location: string };
}

type Period = 'day' | 'week' | 'month' | 'season';

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
export default function DashboardV2({ data, fields, operations, weather }: DashboardV2Props) {
  const { t } = useTranslation();
  const dash = t.dashboard as Record<string, string | undefined>;
  const [period, setPeriod] = useState<Period>('season');

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
    },
    {
      label: dash.seasonExpenses ?? t.dashboard.monthlyExpenses,
      value: `${formatUA(derived.expenses)} ₴`,
      accentColor: '#F59E0B',
      icon: <Banknote size={16} strokeWidth={1.6} />,
      trend: derived.expenses > 0 ? derived.expensesTrend : undefined,
    },
    {
      label: dash.seasonRevenue ?? t.dashboard.monthlyRevenue,
      value: `${formatUA(derived.revenue)} ₴`,
      accentColor: '#22C55E',
      icon: <Activity size={16} strokeWidth={1.6} />,
      trend: derived.revenue > 0 ? derived.revenueTrend : undefined,
    },
    {
      label: dash.seasonProfit ?? t.dashboard.monthlyProfit,
      value: `${formatUA(derived.profit)} ₴`,
      accentColor: '#22C55E',
      icon: <TrendingUp size={16} strokeWidth={1.6} />,
      hero: true,
      trend: derived.revenue > 0 ? derived.profitTrend : undefined,
      delta: derived.revenue > 0 ? derived.margin : undefined,
      deltaLabel: derived.revenue > 0 ? (dash.margin ?? 'маржа') : undefined,
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
            <span>{fields.length} {dash.fieldsUnit ?? 'полів'}</span>
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
                onClick={() => setPeriod(opt.key)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* ── Row 1 — At a glance (KPI hero) ── */}
      <motion.section className={s.row} variants={fadeIn} aria-label={dash.atGlance ?? 'At a glance'}>
        <h2 className={s.sectionLabel}>{dash.atGlance ?? 'At a glance'}</h2>
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
        <motion.section id="financial" className={s.row} variants={fadeIn} aria-label={dash.financialOverview ?? 'Financial overview'}>
          <h2 className={s.sectionLabel}>{dash.financialOverview ?? 'Financial overview'}</h2>
          <RevenueCostChart
            data={costTrendData}
            title={t.dashboard.costTrend}
            costLabel={t.dashboard.costsUAH}
            revenueLabel={hasRevenueSeries ? (dash.revenueLabel ?? 'Дохід') : undefined}
          />
        </motion.section>
      )}

      {/* ── Row 4 — Field status + Recent operations ── */}
      <motion.section className={`${s.row} ${s.twoCol}`} variants={fadeIn}>
        <div>
          <h2 className={s.sectionLabel}>{dash.fieldStatus ?? t.dashboard.fields}</h2>
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
          <h2 className={s.sectionLabel}>{dash.warehouseSnapshot ?? 'Warehouse'}</h2>
          <div className={s.card}>
            <WarehouseSnapshot items={data.topStockItems} />
          </div>
        </div>
        <div>
          <h2 className={s.sectionLabel}>{dash.upcoming ?? 'Upcoming'}</h2>
          <div className={s.card}>
            <UpcomingPanel operations={operations} weather={weather} />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
