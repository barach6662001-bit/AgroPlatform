export interface FieldPnlDto {
  fieldId: string;
  fieldName: string;
  areaHectares: number;
  currentCrop?: string;
  totalCosts: number;
  costsByCategory: Record<string, number>;
  costPerHectare: number;
  actualYieldPerHectare?: number;
  estimatedRevenue?: number;
  netProfit?: number;
  revenuePerHectare?: number;
}

export interface CostRecordDto {
  id: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  fieldId?: string;
  agroOperationId?: string;
  description?: string;
}

/** Marginality metrics for a single crop */
export interface MarginalityItemDto {
  cropName: string;
  areaHa: number;
  /** Actual: actual revenue from harvests */
  actualRevenue: number;
  /** Actual: actual costs from cost records */
  actualCosts: number;
  /** Actual margin = actualRevenue − actualCosts */
  actualMargin: number;
  /** Planned: proportional share of total budget */
  plannedCosts: number;
  /** Planned margin (negative of planned costs when no planned revenue) */
  plannedMargin: number;
  /** Projected revenue based on area × avg yield × price per tonne */
  projectedRevenue?: number;
  /** Projected margin = projectedRevenue − plannedCosts */
  projectedMargin?: number;
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
