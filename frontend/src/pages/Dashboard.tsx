import { useCallback, useEffect, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../stores/authStore';
import {
  useDashboardQuery,
  useDashboardFieldsQuery,
  useDashboardOperationsQuery,
} from '../hooks/useDashboardQuery';
import { KpiSkeleton, ChartSkeleton, TableSkeleton as TableSkeletonNew } from '../components/Skeletons';
import DashboardV2, { type DashboardPeriod } from './DashboardV2/DashboardV2';
import { periodToRange } from '../utils/periodToRange';

const VALID_PERIODS: DashboardPeriod[] = ['day', 'week', 'month', 'season'];

/**
 * Real /dashboard route — thin container around the pure presentational
 * {@link DashboardV2}.  Handles role-based redirects, onboarding guard,
 * data fetching and loading / error states; everything visual lives in
 * {@link DashboardV2}.
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  // Period is persisted in the URL so refresh/share/back-button all work.
  // Invalid / missing values fall back to "season" (all-time).
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPeriod = searchParams.get('period');
  const period: DashboardPeriod = (VALID_PERIODS as string[]).includes(rawPeriod ?? '')
    ? (rawPeriod as DashboardPeriod)
    : 'season';
  const setPeriod = useCallback((p: DashboardPeriod) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (p === 'season') next.delete('period');
      else next.set('period', p);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const range = useMemo(() => periodToRange(period), [period]);

  const { data, isLoading: dashLoading, isError: dashError } = useDashboardQuery(range);
  const { data: fieldsData, isLoading: fieldsLoading } = useDashboardFieldsQuery();
  const { data: operationsData, isLoading: opsLoading } = useDashboardOperationsQuery();

  useEffect(() => {
    if (dashError) {
      message.error(t.dashboard.loadError);
    }
  }, [dashError, t.dashboard.loadError]);

  if (role === 'SuperAdmin') {
    return <Navigate to="/superadmin" replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  const loading = dashLoading || fieldsLoading || opsLoading;
  if (loading) {
    return (
      <>
        <KpiSkeleton count={4} />
        <ChartSkeleton />
        <TableSkeletonNew />
      </>
    );
  }
  if (!data) return null;

  const fields: FieldDto[] = fieldsData?.items ?? [];
  const operations: AgroOperationDto[] = operationsData?.items ?? [];

  return (
    <DashboardV2
      data={data}
      fields={fields}
      operations={operations}
      period={period}
      onPeriodChange={setPeriod}
    />
  );
}
