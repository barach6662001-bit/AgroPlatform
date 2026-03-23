import apiClient from './axios';

export interface BudgetDto {
  id: string;
  year: number;
  category: string;
  plannedAmount: number;
  note?: string;
}

export interface BudgetCategoryRowDto {
  category: string;
  planned: number;
  actual: number;
  variance: number;
  executionPercent: number;
}

export interface BudgetPlanVsFactDto {
  totalPlanned: number;
  totalActual: number;
  totalVariance: number;
  overallExecutionPercent: number;
  rows: BudgetCategoryRowDto[];
}

export const getBudgets = (year: number) =>
  apiClient.get<BudgetDto[]>('/api/economics/budgets', { params: { year } }).then((r) => r.data);

export const getBudgetPlanVsFact = (year: number) =>
  apiClient.get<BudgetPlanVsFactDto>('/api/economics/budgets/plan-vs-fact', { params: { year } }).then((r) => r.data);

export const upsertBudget = (data: { year: number; category: string; plannedAmount: number; note?: string }) =>
  apiClient.put<{ id: string }>('/api/economics/budgets', data).then((r) => r.data);

export const exportBudgets = (year: number) =>
  apiClient.get('/api/economics/budgets/export', { params: { year }, responseType: 'blob' });
