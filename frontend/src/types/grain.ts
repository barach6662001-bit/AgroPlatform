export type GrainOwnershipType = 0 | 1 | 2 | 3;

export interface GrainStorageDto {
  id: string;
  name: string;
  code?: string;
  location?: string;
  storageType?: string;
  capacityTons?: number;
  isActive: boolean;
  notes?: string;
  batchCount: number;
  totalTons: number;
}

export interface GrainBatchDto {
  id: string;
  grainStorageId: string;
  grainType: string;
  quantityTons: number;
  initialQuantityTons: number;
  ownershipType: GrainOwnershipType;
  ownerName?: string;
  contractNumber?: string;
  pricePerTon?: number;
  receivedDate: string;
  sourceFieldId?: string;
  sourceFieldName?: string;
  moisturePercent?: number;
  notes?: string;
}

export interface GrainMovementDto {
  id: string;
  grainBatchId: string;
  movementType: 'In' | 'Out';
  quantityTons: number;
  movementDate: string;
  reason?: string;
  notes?: string;
  pricePerTon?: number;
  totalRevenue?: number;
  buyerName?: string;
}

export interface SplitResultItem {
  newBatchId: string;
  targetStorageId: string;
  targetStorageName: string;
  quantityTons: number;
}

export interface SplitGrainBatchResultDto {
  sourceBatchId: string;
  remainingQuantityTons: number;
  createdBatches: SplitResultItem[];
}
