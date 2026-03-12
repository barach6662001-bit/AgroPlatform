export type MachineryType =
  | 'Tractor' | 'Combine' | 'Sprayer' | 'Seeder' | 'Cultivator' | 'Truck' | 'Other';

export type MachineryStatus = 'Active' | 'UnderRepair' | 'Decommissioned';

export type FuelType = 'Diesel' | 'Gasoline' | 'Electric' | 'Gas';

export interface MachineDto {
  id: string;
  name: string;
  inventoryNumber: string;
  type: MachineryType;
  brand?: string;
  model?: string;
  year?: number;
  status: MachineryStatus;
  fuelType: FuelType;
  fuelConsumptionPerHour?: number;
}

export interface WorkLogDto {
  id: string;
  date: string;
  hoursWorked: number;
  fieldId?: string;
  fieldName?: string;
  notes?: string;
}

export interface FuelLogDto {
  id: string;
  date: string;
  liters: number;
  pricePerLiter?: number;
  totalCost?: number;
  notes?: string;
}

export interface MachineDetailDto extends MachineDto {
  recentWorkLogs: WorkLogDto[];
  recentFuelLogs: FuelLogDto[];
  totalHoursWorked: number;
  totalFuelConsumed: number;
  nextMaintenanceDate?: string | null;
  lastMaintenanceDate?: string | null;
}
