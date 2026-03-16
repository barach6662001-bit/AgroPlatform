export interface MonthlyCostTrendDto {
  year: number;
  month: number;
  totalAmount: number;
}

export interface TopStockItemDto {
  itemId: string;
  itemName: string;
  category: string;
  totalBalance: number;
  baseUnit: string;
}

export interface ResourceConsumptionDto {
  itemId: string;
  itemName: string;
  category: string;
  totalConsumed: number;
  unitCode: string;
}

export interface FieldEfficiencyDto {
  fieldId: string;
  fieldName: string;
  areaHectares: number;
  currentCrop: string | null;
  operationsCount: number;
  totalCosts: number;
  costPerHectare: number;
  yieldPerHectare: number | null;
}

export interface DashboardDto {
  totalFields: number;
  totalAreaHectares: number;
  areaByCrop: Record<string, number>;
  totalWarehouses: number;
  totalWarehouseItems: number;
  topStockItems: TopStockItemDto[];
  totalOperations: number;
  completedOperations: number;
  pendingOperations: number;
  operationsByType: Record<string, number>;
  totalMachines: number;
  activeMachines: number;
  underRepairMachines: number;
  totalHoursWorked: number;
  totalFuelConsumed: number;
  totalCosts: number;
  costsByCategory: Record<string, number>;
  costTrend: MonthlyCostTrendDto[];
}
