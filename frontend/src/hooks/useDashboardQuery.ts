import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/analytics';
import { getNotifications } from '../api/notifications';
import { getFields } from '../api/fields';
import { getOperations } from '../api/operations';
import { useAuthStore } from '../stores/authStore';

export const DASHBOARD_QUERY_KEY = (tenantId?: string | null) =>
  ['dashboard', tenantId] as const;
export const DASHBOARD_NOTIFICATIONS_QUERY_KEY = (tenantId?: string | null) =>
  ['dashboard', tenantId, 'notifications'] as const;
export const DASHBOARD_FIELDS_QUERY_KEY = (tenantId?: string | null) =>
  ['dashboard', tenantId, 'fields'] as const;

export function useDashboardQuery() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY(tenantId),
    queryFn: ({ signal }) => getDashboard(signal),
    staleTime: 60_000,
  });
}

export function useDashboardNotificationsQuery() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: DASHBOARD_NOTIFICATIONS_QUERY_KEY(tenantId),
    queryFn: ({ signal }) => getNotifications({ pageSize: 8 }, signal),
    staleTime: 30_000,
  });
}

export function useDashboardFieldsQuery() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: DASHBOARD_FIELDS_QUERY_KEY(tenantId),
    queryFn: ({ signal }) => getFields({ pageSize: 8 }, signal),
    staleTime: 120_000,
  });
}

export const DASHBOARD_OPERATIONS_QUERY_KEY = (tenantId?: string | null) =>
  ['dashboard', tenantId, 'operations'] as const;

export function useDashboardOperationsQuery() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: DASHBOARD_OPERATIONS_QUERY_KEY(tenantId),
    queryFn: ({ signal }) => getOperations({ pageSize: 8 }),
    staleTime: 60_000,
  });
}
