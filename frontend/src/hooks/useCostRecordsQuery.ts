import { useQuery } from '@tanstack/react-query';
import { getCostRecords, getCostSummary } from '../api/economics';
import { getBudgets } from '../api/budgets';

export const COST_RECORDS_QUERY_KEY = (params?: {
  fieldId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) => ['costRecords', params] as const;

export const COST_SUMMARY_QUERY_KEY = (params?: {
  fieldId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}) => ['costSummary', params] as const;

export const BUDGETS_QUERY_KEY = (year?: number) => ['budgets', year] as const;

export function useCostRecordsQuery(params?: {
  fieldId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: COST_RECORDS_QUERY_KEY(params),
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
  return useQuery({
    queryKey: COST_SUMMARY_QUERY_KEY(params),
    queryFn: ({ signal }) => getCostSummary(params, signal),
    staleTime: 60_000,
  });
}

export function useBudgetsQuery(year: number) {
  return useQuery({
    queryKey: BUDGETS_QUERY_KEY(year),
    queryFn: () => getBudgets(year),
    staleTime: 300_000,
  });
}
