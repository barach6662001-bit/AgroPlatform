import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/analytics';

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard(),
    staleTime: 30_000,
  });
}
