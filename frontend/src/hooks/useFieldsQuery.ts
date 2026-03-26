import { useQuery } from '@tanstack/react-query';
import { getFields } from '../api/fields';

export const FIELDS_QUERY_KEY = (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  ownershipType?: number[];
}) => ['fields', params] as const;

export function useFieldsQuery(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  ownershipType?: number[];
}) {
  return useQuery({
    queryKey: FIELDS_QUERY_KEY(params),
    queryFn: ({ signal }) => getFields(params, signal),
    staleTime: 120_000,
    placeholderData: (prev) => prev,
  });
}
