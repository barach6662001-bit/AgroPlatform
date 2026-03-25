import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/analytics';
import { getNotifications } from '../api/notifications';
import { getFields } from '../api/fields';

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const;
export const DASHBOARD_NOTIFICATIONS_QUERY_KEY = ['dashboard', 'notifications'] as const;
export const DASHBOARD_FIELDS_QUERY_KEY = ['dashboard', 'fields'] as const;

export function useDashboardQuery() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: ({ signal }) => getDashboard(signal),
    staleTime: 60_000,
  });
}

export function useDashboardNotificationsQuery() {
  return useQuery({
    queryKey: DASHBOARD_NOTIFICATIONS_QUERY_KEY,
    queryFn: ({ signal }) => getNotifications({ pageSize: 8 }, signal),
    staleTime: 30_000,
  });
}

export function useDashboardFieldsQuery() {
  return useQuery({
    queryKey: DASHBOARD_FIELDS_QUERY_KEY,
    queryFn: ({ signal }) => getFields({ pageSize: 8 }, signal),
    staleTime: 120_000,
  });
}
