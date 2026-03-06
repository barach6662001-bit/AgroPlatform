export interface MonthlyCostTrendDto {
  year: number;
  month: number;
  totalCost: number;
}

export interface TopStockItemDto {
  itemName: string;
  itemCode: string;
  totalBalance: number;
  unit: string;
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
