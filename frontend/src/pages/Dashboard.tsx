import { useEffect } from 'react';
import { message } from 'antd';
import { KpiSkeleton, ChartSkeleton, TableSkeleton as TableSkeletonNew } from '../components/Skeletons';
import { useNavigate, Navigate } from 'react-router-dom';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import PageHeader from '../components/PageHeader';
import WeatherWidget from '../components/WeatherWidget';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../stores/authStore';
import {
  useDashboardQuery,
  useDashboardFieldsQuery,
  useDashboardOperationsQuery,
} from '../hooks/useDashboardQuery';
import SeasonHealthCard from './Dashboard/components/SeasonHealthCard';
import { HeroSection } from '@/components/dashboard/investor/HeroSection';
import RevenueCostChart from './Dashboard/components/RevenueCostChart';
import FieldStatusCard from './Dashboard/components/FieldStatusCard';
import OperationsTimeline from './Dashboard/components/OperationsTimeline';
import s from './Dashboard.module.css';

function getSeasonDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

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

  // HeroSection renders with mock fallback regardless of backend state
  if (loading) {
    return (
      <div className="page-enter">
        <div className="mb-6"><HeroSection /></div>
        <KpiSkeleton count={4} /><ChartSkeleton /><TableSkeletonNew />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="page-enter">
        <div className="mb-6"><HeroSection /></div>
      </div>
    );
  }

  const expenses = data.totalCosts || data.monthlyExpenses;
  const revenue = data.totalRevenue || data.monthlyRevenue;
  const profit = revenue - expenses;
  const marginNum = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Build contextual action items from real data
  const actionItems: Array<{ id: string; text: string; route: string; severity: 'info' | 'warning' | 'critical' }> = [];
  if (data.underRepairMachines > 0) {
    actionItems.push({
      id: 'machinery',
      text: `${data.underRepairMachines} ${data.underRepairMachines === 1 ? 'одиниця техніки' : 'одиниці техніки'} на ремонті`,
      route: '/operations?tab=machinery',
      severity: 'warning',
    });
  }
  if (data.pendingOperations > 0) {
    actionItems.push({
      id: 'pending',
      text: `${data.pendingOperations} незавершених операцій`,
      route: '/operations?tab=operations',
      severity: 'info',
    });
  }
  if (marginNum < 0) {
    actionItems.push({
      id: 'margin',
      text: "Від\u2019ємна маржинальність — перевірте витрати",
      route: '/finance?tab=analytics&dim=category',
      severity: 'critical',
    });
  }
  if (data.totalFields === 0) {
    actionItems.push({
      id: 'nofields',
      text: 'Додайте поля для повної аналітики',
      route: '/fields',
      severity: 'info',
    });
  }

  // Build chart data: merge cost and revenue by month key
  const revenueTrendMap = new Map(
    (data.revenueTrend ?? []).map((item) => [
      `${item.year}-${String(item.month).padStart(2, '0')}`,
      item.totalAmount,
    ])
  );
  const costTrendData = data.costTrend.map((item) => {
    const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    return {
      name: key,
      cost: item.totalAmount,
      revenue: revenueTrendMap.get(key) ?? 0,
    };
  });

  return (
    <div className="page-enter">
      {/* Wave 1.5 Hero Section */}
      <div className="mb-6">
        <HeroSection />
      </div>

      {/* Header + Weather */}
      <div className={s.flex_between_wrap}>
        <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
        <WeatherWidget />
      </div>

      {/* Season Health Hero */}
      <SeasonHealthCard
        revenue={revenue}
        costs={expenses}
        profit={profit}
        margin={marginNum}
        seasonDayOfYear={getSeasonDayOfYear()}
        seasonYear={new Date().getFullYear()}
        actionItems={actionItems}
      />

      {/* Revenue/Cost Chart */}
      {costTrendData.length > 0 && (
        <RevenueCostChart
          data={costTrendData}
          title={t.dashboard.costTrend}
          costLabel={t.dashboard.costsUAH}
          revenueLabel={t.dashboard.seasonRevenue ?? 'Дохід'}
        />
      )}

      {/* Fields + Operations — below the fold */}
      <div className={s.contentGrid}>
        <FieldStatusCard fields={fields} onAddField={() => navigate('/fields')} />
        <div className={s.timelineCard}>
          <div className={s.timelineHeader}>
            <span className={s.cardTitle}>{t.dashboard.recentOperations}</span>
          </div>
          <OperationsTimeline operations={operations.slice(0, 7)} />
        </div>
      </div>
    </div>
  );
}
