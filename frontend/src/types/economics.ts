export interface FieldPnlDto {
  fieldId: string;
  fieldName: string;
  areaHectares: number;
  currentCrop?: string;
  totalCosts: number;
  costsByCategory: Record<string, number>;
  costPerHectare: number;
  actualYieldPerHectare?: number;
  actualYieldTons?: number;
  /** Direct revenue from Sales table (preferred). */
  actualSalesRevenue: number;
  /** Revenue from CostRecords with negative Amount (legacy). */
  actualCostRecordRevenue: number;
  /** Best available revenue: Sales > CostRecords > Estimated. */
  estimatedRevenue?: number;
  netProfit?: number;
  revenuePerHectare?: number;
  /** "Sales" | "CostRecords" | "Estimated" | "None" */
  revenueSource: string;
}

export interface BreakEvenDto {
  fieldId: string;
  fieldName: string;
  areaHectares: number;
  currentCrop?: string;
  totalCosts: number;
  pricePerTonne: number;
  breakEvenYield?: number;
}

export type CostCategory = 'Fuel' | 'Seeds' | 'Fertilizer' | 'Pesticide' | 'Machinery' | 'Labor' | 'Lease' | 'Other';

export interface CostRecordDto {
  id: string;
  category: CostCategory;
  amount: number;
  currency: string;
  date: string;
  fieldId?: string;
  agroOperationId?: string;
  description?: string;
}

/** Identifies one of the six material KPI card types. */
export type MaterialKpiKey = 'Fertilizers' | 'Seeds' | 'Pesticides' | 'Fuel' | 'Lease' | 'Harvest' | 'Total';

/** View-model for a single material KPI card. */
export interface MaterialKpiItem {
  /** Stable identifier used as React key and for styling (e.g. "Total" gets the blue variant). */
  key: MaterialKpiKey;
  /** Translated display label. */
  label: string;
  /** Monetary amount in UAH. */
  amount: number;
  /** Icon element to display inside the card. */
  icon: React.ReactNode;
  /** When true, renders the "total" blue-highlight variant. */
  isTotal?: boolean;
}

export interface MarginalityRowDto {
  label: string;
  revenue: number;
  costs: number;
  margin: number;
  marginPercent?: number;
}

export interface MarginalitySummaryDto {
  totalRevenue: number;
  totalCosts: number;
  margin: number;
  marginPercent?: number;
  byProduct: MarginalityRowDto[];
  byField: MarginalityRowDto[];
}

export interface SeasonComparisonDto {
  year: number;
  totalRevenue: number;
  totalCosts: number;
  margin: number;
  marginPercent?: number;
  areaHa?: number;
  costPerHa?: number;
  revenuePerHa?: number;
}

// ---------------------------------------------------------------------------
// Unified economics types shared across analytics modules (032–035)
// ---------------------------------------------------------------------------

/** Unified breakdown of a single category (costs or revenue). */
export interface EconomicsByCategoryDto {
  category: string;
  amount: number;
  count: number;
}

/** Unified monthly breakdown used in cost/revenue trend charts. */
export interface EconomicsMonthlyDto {
  month: number;
  costs: number;
  revenue: number;
}

/** Unified high-level economics summary for a period. */
export interface EconomicsSummaryDto {
  totalRevenue: number;
  totalCosts: number;
  margin: number;
  marginPercent?: number;
}

/** Unified per-year economics summary used in season comparison. */
export type EconomicsByYearDto = SeasonComparisonDto;

/** Cost analytics response combining summary, category breakdown, and monthly trend. */
export interface CostAnalyticsDto {
  year: number;
  totalCosts: number;
  totalRevenue: number;
  byCategory: EconomicsByCategoryDto[];
  byMonth: EconomicsMonthlyDto[];
}

/** Cost summary response (filtered aggregation by category). */
export interface CostSummaryDto {
  totalAmount: number;
  byCategory: EconomicsByCategoryDto[];
}

/** Budget plan-vs-fact comparison row. */
export interface BudgetPlanVsFactDto {
  category: string;
  plannedAmount: number;
  factAmount: number;
  variance: number;
  executionPercent: number;
}
