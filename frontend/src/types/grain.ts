export type GrainOwnershipType = 0 | 1 | 2 | 3;

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
}
