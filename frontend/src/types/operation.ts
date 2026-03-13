export type AgroOperationType =
  | 'Sowing' | 'Fertilizing' | 'PlantProtection' | 'SoilTillage' | 'Harvesting';

export interface AgroOperationDto {
  id: string;
  fieldId: string;
  fieldName: string;
  operationType: AgroOperationType;
  plannedDate: string;
  completedDate?: string;
  isCompleted: boolean;
  description?: string;
  areaProcessed?: number;
}

export interface AgroOperationResourceDto {
  id: string;
  warehouseItemId: string;
  warehouseItemName: string;
  warehouseId: string;
  plannedQuantity: number;
  actualQuantity?: number;
  unitCode: string;
}

export interface AgroOperationMachineryDto {
  id: string;
  machineId: string;
  machineName: string;
  hoursWorked?: number;
  fuelUsed?: number;
  operatorName?: string;
}

export interface AgroOperationDetailDto extends AgroOperationDto {
  resources: AgroOperationResourceDto[];
  machineryUsed: AgroOperationMachineryDto[];
}
