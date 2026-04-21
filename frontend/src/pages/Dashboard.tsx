import { useEffect, useState } from 'react';
import { message } from 'antd';
import { KpiSkeleton, ChartSkeleton, TableSkeleton as TableSkeletonNew } from '../components/Skeletons';
import { Clipboard, Fuel, Wheat, Receipt, Map, Activity, Banknote, Users, ArrowRight } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import EyebrowChip from '../components/EyebrowChip';
import WeatherWidget from '../components/WeatherWidget';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../stores/authStore';
import { formatUA } from '../utils/numberFormat';
import {
  useDashboardQuery,
  useDashboardFieldsQuery,
  useDashboardOperationsQuery,
} from '../hooks/useDashboardQuery';
import KpiHeroRow from './Dashboard/components/KpiHeroRow';
import RevenueCostChart from './Dashboard/components/RevenueCostChart';
import FieldStatusCard from './Dashboard/components/FieldStatusCard';
import OperationsTimeline from './Dashboard/components/OperationsTimeline';
import QuickActionsStrip from './Dashboard/components/QuickActionsStrip';
import s from './Dashboard.module.css';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'season'>('season');
  const { data, isLoading: dashLoading, isError: dashError } = useDashboardQuery();
  const { data: fieldsData, isLoading: fieldsLoading } = useDashboardFieldsQuery();
  const { data: operationsData, isLoading: opsLoading } = useDashboardOperationsQuery();

  const loading = dashLoading || fieldsLoading || opsLoading;
  const fields: FieldDto[] = fieldsData?.items ?? [];
  const operations: AgroOperationDto[] = operationsData?.items ?? [];

  useEffect(() => {
    if (dashError) {
      message.error(t.dashboard.loadError);
    }
  }, [dashError, t.dashboard.loadError]);

  if (role === 'SuperAdmin') {
    return <Navigate to="/superadmin/companies" replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (loading) return <><KpiSkeleton count={4} /><ChartSkeleton /><TableSkeletonNew /></>;
  if (!data) return null;

  const isWarehouseOp = role === 'WarehouseOperator';
  const isAccountant = role === 'Accountant';

  const expenses = data.totalCosts || data.monthlyExpenses;
  const revenue = data.totalRevenue || data.monthlyRevenue;
  const profit = revenue - expenses;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) + '%' : undefined;

  // Compute period-over-period trend from the cost trend series. Returns a
  // formatted arrow-prefixed percentage string, or `undefined` when we cannot
  // compute a meaningful delta (no previous data / previous value is zero /
  // current value is zero — don't show a "↑ 8%" chip next to "0,00 ₴").
  const computeTrend = (values: Array<number | undefined | null>): string | undefined => {
    const nums = values.filter((v): v is number => typeof v === 'number' && !isNaN(v));
    if (nums.length < 2) return undefined;
    const current = nums[nums.length - 1];
    const previous = nums[nums.length - 2];
    if (!previous || current === 0) return undefined;
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    if (!isFinite(pct) || Math.abs(pct) < 0.5) return undefined;
    const arrow = pct >= 0 ? '↑' : '↓';
    return `${arrow} ${Math.abs(pct).toFixed(0)}%`;
  };

  const expensesTrend = computeTrend(data.costTrend.map((p) => p.totalAmount));
  const revenueTrend = computeTrend(data.costTrend.map((p) => p.revenueAmount));

  // KPI accent palette: keep ONE living green for area/profit; expenses use
  // amber (not red) — increased spend is only "bad" if it exceeds budget.
  // Revenue uses the brand accent. This matches the landing's single-accent rule.
  const kpiItems = [
    {
      label: t.dashboard.totalArea,
      value: `${formatUA(data.totalAreaHectares)} га`,
      accentColor: 'rgba(255, 255, 255, 0.85)',
      icon: <Map size={16} strokeWidth={1.6} />,
    },
    {
      label: t.dashboard.seasonExpenses ?? t.dashboard.monthlyExpenses,
      value: `${formatUA(expenses)} ₴`,
      accentColor: '#F59E0B',
      icon: <Banknote size={16} strokeWidth={1.6} />,
      trend: expenses > 0 ? expensesTrend : undefined,
    },
    {
      label: t.dashboard.seasonRevenue ?? t.dashboard.monthlyRevenue,
      value: `${formatUA(revenue)} ₴`,
      accentColor: '#22C55E',
      icon: <Activity size={16} strokeWidth={1.6} />,
      trend: revenue > 0 ? revenueTrend : undefined,
    },
    {
      label: t.dashboard.seasonProfit ?? t.dashboard.monthlyProfit,
      value: `${formatUA(profit)} ₴`,
      accentColor: '#22C55E',
      icon: <Users size={16} strokeWidth={1.6} />,
      hero: true,
      delta: revenue > 0 ? margin : undefined,
      deltaLabel: revenue > 0 ? (t.dashboard.margin ?? 'маржа') : undefined,
    },
  ];

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
    revenue: item.revenueAmount,
  }));
  const hasRevenueSeries = data.costTrend.some((p) => typeof p.revenueAmount === 'number');

  // Derive synthetic alert tiers from the existing dashboard DTO.
  const today = new Date().toISOString().slice(0, 10);
  const overdueOperations = operations.filter(
    (op) => !op.isCompleted && op.plannedDate && op.plannedDate < today,
  ).length;
  const lowStockItems = (data.topStockItems ?? []).filter((it) => it.totalBalance < 500).length;
  const completedToday = operations.filter(
    (op) => op.isCompleted && op.completedDate?.slice(0, 10) === today,
  ).length;

  const quickActions = isWarehouseOp
    ? [
        { label: t.dashboard.quickOperation, icon: <Clipboard size={16} />, color: '#3B82F6', route: '/operations' },
        { label: t.dashboard.quickFuel, icon: <Fuel size={16} />, color: '#F59E0B', route: '/fuel' },
        { label: t.dashboard.quickGrain ?? t.nav.grainModule, icon: <Wheat size={16} />, color: '#22C55E', route: '/storage' },
        { label: t.dashboard.quickCost, icon: <Receipt size={16} />, color: '#8B5CF6', route: '/economics' },
      ]
    : isAccountant
    ? [
        { label: t.dashboard.quickCost, icon: <Receipt size={16} />, color: '#8B5CF6', route: '/economics' },
        { label: t.nav.pnl, icon: <Receipt size={16} />, color: '#3B82F6', route: '/economics/pnl' },
        { label: t.dashboard.quickOperation, icon: <Clipboard size={16} />, color: '#3B82F6', route: '/operations' },
        { label: t.dashboard.quickGrain ?? t.nav.grainModule, icon: <Wheat size={16} />, color: '#22C55E', route: '/storage' },
      ]
    : [
        { label: t.dashboard.quickOperation, icon: <Clipboard size={16} />, color: '#3B82F6', route: '/operations' },
        { label: t.dashboard.quickFuel, icon: <Fuel size={16} />, color: '#F59E0B', route: '/fuel' },
        { label: t.dashboard.quickGrain ?? t.nav.grainModule, icon: <Wheat size={16} />, color: '#22C55E', route: '/storage' },
        { label: t.dashboard.quickCost, icon: <Receipt size={16} />, color: '#8B5CF6', route: '/economics' },
      ];

  const dashI18n = t.dashboard as Record<string, string | undefined>;
  const periodOptions: Array<{ key: typeof period; label: string }> = [
    { key: 'day', label: dashI18n.day ?? 'День' },
    { key: 'week', label: dashI18n.week ?? 'Тиждень' },
    { key: 'month', label: dashI18n.month ?? 'Місяць' },
    { key: 'season', label: dashI18n.season ?? 'Сезон' },
  ];

  return (
    <div className={`${s.pageWrap} page-enter`}>
      {/* Premium header */}
      <header className={s.pageHead}>
        <div className={s.headLeft}>
          <EyebrowChip label="DASHBOARD / SEASON 2026" />
          <h1 className={s.headTitle}>{t.dashboard.title}</h1>
          <p className={s.headSubMeta}>
            <span>{t.dashboard.subtitle}</span>
            <span className={s.dotSep}>·</span>
            <span>{formatUA(data.totalAreaHectares)} {dashI18n.haUnit ?? 'га'}</span>
            <span className={s.dotSep}>·</span>
            <span>{fields.length} {dashI18n.fieldsUnit ?? 'полів'}</span>
          </p>
        </div>
        <div className={s.headRight}>
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
          <button
            type="button"
            className={s.ctaPrimary}
            onClick={() => navigate('/operations')}
          >
            <span>{dashI18n.newOperation ?? 'Нова операція'}</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
          <div className={s.weatherSlot}>
            <WeatherWidget />
          </div>
        </div>
      </header>

      {/* KPI Hero Row */}
      <KpiHeroRow items={kpiItems} />

      {/* Alerts */}
      <div className={s.alertsGap}>
        <AlertsPanel
          underRepairMachines={data.underRepairMachines}
          pendingOperations={data.pendingOperations}
          overdueOperations={overdueOperations}
          lowStockItems={lowStockItems}
          completedToday={completedToday}
        />
      </div>

      {/* Revenue/Cost Chart */}
      {costTrendData.length > 0 && (
        <RevenueCostChart
          data={costTrendData}
          title={t.dashboard.costTrend}
          costLabel={t.dashboard.costsUAH}
          revenueLabel={hasRevenueSeries ? (t.dashboard as Record<string, string | undefined>).revenueLabel ?? 'Дохід' : undefined}
        />
      )}

      {/* Fields + Operations */}
      <div className={s.contentGrid}>
        <FieldStatusCard fields={fields} onAddField={() => navigate('/fields')} />
        <div className={s.timelineCard}>
          <div className={s.timelineHeader}>
            <span className={s.cardTitle}>{t.dashboard.recentOperations}</span>
          </div>
          <OperationsTimeline operations={operations.slice(0, 7)} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsStrip actions={quickActions} />
    </div>
  );
}
