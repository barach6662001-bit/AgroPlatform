import { useQuery } from '@tanstack/react-query';
import { getSeasons, getTenantDataBoundaries } from '../api/tenants';
import { useAuthStore } from '../stores/authStore';

export const TENANT_DATA_BOUNDARIES_QUERY_KEY = (tenantId?: string | null) =>
  ['tenant', tenantId, 'data-boundaries'] as const;

export const TENANT_SEASONS_QUERY_KEY = (tenantId?: string | null) =>
  ['tenant', tenantId, 'seasons'] as const;

export function useTenantDataBoundaries() {
  const { tenantId } = useAuthStore();

  return useQuery({
    queryKey: TENANT_DATA_BOUNDARIES_QUERY_KEY(tenantId),
    queryFn: () => getTenantDataBoundaries(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useTenantSeasons() {
  const { tenantId } = useAuthStore();

  return useQuery({
    queryKey: TENANT_SEASONS_QUERY_KEY(tenantId),
    queryFn: () => getSeasons(),
    staleTime: 60 * 60 * 1000,
  });
}
