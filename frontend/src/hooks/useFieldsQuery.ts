import { useQuery } from '@tanstack/react-query';
import { getFields } from '../api/fields';
import { useAuthStore } from '../stores/authStore';

export const FIELDS_QUERY_KEY = (
  tenantId?: string | null,
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    ownershipType?: number[];
  }
) => ['fields', tenantId, params] as const;

export function useFieldsQuery(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  ownershipType?: number[];
}) {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: FIELDS_QUERY_KEY(tenantId, params),
    queryFn: ({ signal }) => getFields(params, signal),
    staleTime: 120_000,
    placeholderData: (prev) => prev,
  });
}
