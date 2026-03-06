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
  itemName: string;
  plannedQuantity: number;
  actualQuantity?: number;
  unit: string;
}

export interface AgroOperationMachineryDto {
  id: string;
  machineId: string;
  machineName: string;
  hoursPlanned?: number;
  hoursActual?: number;
}

export interface AgroOperationDetailDto extends AgroOperationDto {
  resources: AgroOperationResourceDto[];
  machineryUsed: AgroOperationMachineryDto[];
}
