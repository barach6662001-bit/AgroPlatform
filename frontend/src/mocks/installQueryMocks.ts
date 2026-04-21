import type { QueryClient } from '@tanstack/react-query';
import {
  DASHBOARD_QUERY_KEY,
  DASHBOARD_FIELDS_QUERY_KEY,
  DASHBOARD_OPERATIONS_QUERY_KEY,
  DASHBOARD_NOTIFICATIONS_QUERY_KEY,
} from '../hooks/useDashboardQuery';
import { mockTenantId } from './mockTenant';
import {
  mockDashboard,
  mockDashboardFields,
  mockDashboardOperations,
  mockDashboardNotifications,
} from './mockDashboardData';

/**
 * Pre-seed the React Query cache for the Dashboard hooks when the auth bypass
 * is enabled. Called from [main.tsx](../main.tsx) before the app renders.
 *
 * A very long staleTime default keeps the mock data fresh so the queries do not
 * immediately refetch (which would hit an offline backend and fail).
 */
export function installQueryMocks(queryClient: QueryClient): void {
  queryClient.setDefaultOptions({
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      retry: false,
    },
  });

  queryClient.setQueryData(DASHBOARD_QUERY_KEY(mockTenantId), mockDashboard);
  queryClient.setQueryData(DASHBOARD_FIELDS_QUERY_KEY(mockTenantId), mockDashboardFields);
  queryClient.setQueryData(DASHBOARD_OPERATIONS_QUERY_KEY(mockTenantId), mockDashboardOperations);
  queryClient.setQueryData(DASHBOARD_NOTIFICATIONS_QUERY_KEY(mockTenantId), mockDashboardNotifications);
}
