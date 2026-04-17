import { useEffect } from 'react';
import { message } from 'antd';
import { KpiSkeleton, ChartSkeleton, TableSkeleton as TableSkeletonNew } from '../components/Skeletons';
import { Clipboard, Fuel, Wheat, Receipt } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import PageHeader from '../components/PageHeader';
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

  const kpiItems = [
    {
      label: t.dashboard.totalArea,
      value: `${formatUA(data.totalAreaHectares)} га`,
      accentColor: '#22C55E',
    },
    {
      label: t.dashboard.seasonExpenses ?? t.dashboard.monthlyExpenses,
      value: `${formatUA(expenses)} ₴`,
      accentColor: '#EF4444',
    },
    {
      label: t.dashboard.seasonRevenue ?? t.dashboard.monthlyRevenue,
      value: `${formatUA(revenue)} ₴`,
      accentColor: '#3B82F6',
    },
    {
      label: t.dashboard.seasonProfit ?? t.dashboard.monthlyProfit,
      value: `${formatUA(profit)} ₴`,
      accentColor: '#F59E0B',
      hero: true,
      delta: margin,
      deltaLabel: t.dashboard.margin ?? 'маржа',
    },
  ];

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

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

  return (
    <div className="page-enter">
      {/* Header + Weather */}
      <div className={s.flex_between_wrap}>
        <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
        <WeatherWidget />
      </div>

      {/* KPI Hero Row */}
      <KpiHeroRow items={kpiItems} />

      {/* Alerts */}
      {(data.underRepairMachines > 0 || data.pendingOperations > 0) && (
        <div className={s.alertsGap}>
          <AlertsPanel
            underRepairMachines={data.underRepairMachines}
            pendingOperations={data.pendingOperations}
          />
        </div>
      )}

      {/* Revenue/Cost Chart */}
      {costTrendData.length > 0 && (
        <RevenueCostChart
          data={costTrendData}
          title={t.dashboard.costTrend}
          costLabel={t.dashboard.costsUAH}
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
