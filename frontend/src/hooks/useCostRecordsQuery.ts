import { useQuery } from '@tanstack/react-query';
import { getCostRecords, getCostSummary } from '../api/economics';
import { getBudgets } from '../api/budgets';
import { useAuthStore } from '../stores/authStore';

export const COST_RECORDS_QUERY_KEY = (
  tenantId?: string | null,
  params?: {
    fieldId?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }
) => ['costRecords', tenantId, params] as const;

export const COST_SUMMARY_QUERY_KEY = (
  tenantId?: string | null,
  params?: {
    fieldId?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }
) => ['costSummary', tenantId, params] as const;

export const BUDGETS_QUERY_KEY = (tenantId?: string | null, year?: number) =>
  ['budgets', tenantId, year] as const;

export function useCostRecordsQuery(params?: {
  fieldId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: COST_RECORDS_QUERY_KEY(tenantId, params),
    queryFn: ({ signal }) => getCostRecords(params, signal),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useCostSummaryQuery(params?: {
  fieldId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: COST_SUMMARY_QUERY_KEY(tenantId, params),
    queryFn: ({ signal }) => getCostSummary(params, signal),
    staleTime: 60_000,
  });
}

export function useBudgetsQuery(year: number) {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: BUDGETS_QUERY_KEY(tenantId, year),
    queryFn: () => getBudgets(year),
    staleTime: 300_000,
  });
}
