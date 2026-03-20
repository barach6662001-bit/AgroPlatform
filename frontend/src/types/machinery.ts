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
  assignedDriverId?: string;
  assignedDriverName?: string;
  nextMaintenanceDate?: string | null;
}

export interface WorkLogDto {
  id: string;
  machineId: string;
  date: string;
  hoursWorked: number;
  agroOperationId?: string;
  description?: string;
}

export interface FuelLogDto {
  id: string;
  machineId: string;
  date: string;
  quantity: number;
  fuelType: string;
  note?: string;
}

export interface MachineDetailDto extends MachineDto {
  recentWorkLogs: WorkLogDto[];
  recentFuelLogs: FuelLogDto[];
  totalHoursWorked: number;
  totalFuelConsumed: number;
  nextMaintenanceDate?: string | null;
  lastMaintenanceDate?: string | null;
}
