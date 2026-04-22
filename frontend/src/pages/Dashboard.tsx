import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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
import DashboardV2 from './DashboardV2/DashboardV2';

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

  const { data, isLoading: dashLoading, isError: dashError } = useDashboardQuery();
  const { data: fieldsData, isLoading: fieldsLoading } = useDashboardFieldsQuery();
  const { data: operationsData, isLoading: opsLoading } = useDashboardOperationsQuery();

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

  return <DashboardV2 data={data} fields={fields} operations={operations} />;
}
