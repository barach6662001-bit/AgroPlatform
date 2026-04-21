export interface MonthlyCostTrendDto {
  year: number;
  month: number;
  totalAmount: number;
  revenueAmount?: number;
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
  totalHarvestTons: number | null;
  revenueTotal: number | null;
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
  totalRevenue: number;
  monthlyExpenses: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  costsByCategory: Record<string, number>;
  costTrend: MonthlyCostTrendDto[];
}

export interface MonthlyValueDto {
  month: number;
  value: number;
}

export interface FuelByMachineDto {
  machineId: string;
  machineName: string;
  totalLiters: number;
}

export interface SalaryByEmployeeDto {
  employeeId: string;
  employeeFullName: string;
  position: string | null;
  totalAmount: number;
}

export interface SalaryFuelAnalyticsDto {
  year: number;
  totalSalary: number;
  totalFuelLiters: number;
  litersPerHectare: number | null;
  hectaresPerLaborHour: number | null;
  salaryByMonth: MonthlyValueDto[];
  fuelByMonth: MonthlyValueDto[];
  fuelByMachine: FuelByMachineDto[];
  salaryByEmployee: SalaryByEmployeeDto[];
}
