export type GrainOwnershipType = 0 | 1 | 2 | 3;

export type GrainMovementType =
  | 'Receipt'
  | 'Transfer'
  | 'Split'
  | 'Merge'
  | 'Issue'
  | 'SaleDispatch'
  | 'Adjustment'
  | 'WriteOff';

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
  /** Сміттєва домішка, % (0-100) */
  impurityPercent?: number;
  /** Зернова домішка, % (0-100) */
  grainImpurityPercent?: number;
  /** Протеїн, % (0-100) */
  proteinPercent?: number;
  /** Клейковина, % (0-100) */
  glutenPercent?: number;
  /** Натура, g/L (400-900) */
  naturePerLiter?: number;
  /** Клас 1..6 (ДСТУ) */
  qualityClass?: number;
  notes?: string;
  placements: GrainBatchPlacementDto[];
}

export interface GrainMovementDto {
  id: string;
  grainBatchId: string;
  grainType: string;
  storageName: string;
  movementType: GrainMovementType;
  quantityTons: number;
  movementDate: string;
  operationId?: string;
  sourceBatchId?: string;
  targetBatchId?: string;
  sourceStorageId?: string;
  sourceStorageName?: string;
  targetStorageId?: string;
  targetStorageName?: string;
  reason?: string;
  notes?: string;
  pricePerTon?: number;
  totalRevenue?: number;
  buyerName?: string;
  createdBy?: string;
  createdAtUtc: string;
}

export interface CreateMovementRequest {
  movementType: GrainMovementType;
  quantityTons: number;
  movementDate: string;
  reason?: string;
  notes?: string;
  pricePerTon?: number;
  buyerName?: string;
}

export interface TransferGrainRequest {
  sourceBatchId: string;
  targetBatchId: string;
  quantityTons: number;
  movementDate?: string;
  notes?: string;
}

export interface SplitGrainBatchRequest {
  sourceBatchId: string;
  splitQuantityTons: number;
  targetStorageId?: string;
  notes?: string;
  movementDate?: string;
}

export interface AdjustGrainBatchRequest {
  adjustmentTons: number;
  reason?: string;
  notes?: string;
  movementDate?: string;
}

export interface WriteOffGrainBatchRequest {
  quantityTons: number;
  reason?: string;
  notes?: string;
  movementDate?: string;
}

export interface GrainBatchPlacementDto {
  id: string;
  grainStorageId: string;
  grainStorageName: string;
  grainStorageUnitId?: string;
  quantityTons: number;
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

export interface GrainTransferDto {
  id: string;
  sourceBatchId: string;
  sourceGrainType: string;
  sourceStorageName: string;
  targetBatchId: string;
  targetGrainType: string;
  targetStorageName: string;
  quantityTons: number;
  transferDate: string;
  notes?: string;
}

export interface GrainStorageOverviewDto {
  id: string;
  name: string;
  code?: string;
  location?: string;
  storageType?: string;
  capacityTons?: number;
  isActive: boolean;
  notes?: string;
  occupiedTons: number;
  freeTons?: number;
  occupancyPercent?: number;
  batchCount: number;
  grainTypes: string[];
  batches: GrainBatchSummaryDto[];
  warnings: string[];
}

export interface GrainBatchSummaryDto {
  id: string;
  grainStorageId: string;
  grainType: string;
  quantityTons: number;
  initialQuantityTons: number;
  ownershipType: GrainOwnershipType;
  ownerName?: string;
  receivedDate: string;
  moisturePercent?: number;
  impurityPercent?: number;
  grainImpurityPercent?: number;
  proteinPercent?: number;
  glutenPercent?: number;
  naturePerLiter?: number;
  qualityClass?: number;
  sourceFieldName?: string;
  contractNumber?: string;
}

