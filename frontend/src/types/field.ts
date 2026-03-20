export type CropType =
  | 'Wheat' | 'Barley' | 'Corn' | 'Sunflower' | 'Soybean'
  | 'Rapeseed' | 'SugarBeet' | 'Potato' | 'Fallow' | 'Other';

export interface FieldDto {
  id: string;
  name: string;
  cadastralNumber?: string;
  areaHectares: number;
  currentCrop?: CropType;
  currentCropYear?: number;
  soilType?: string;
  notes?: string;
  ownershipType: number;
  cadastralArea?: number;
  cadastralPurpose?: string;
  cadastralOwnership?: string;
  cadastralFetchedAt?: string;
}

export interface CropHistoryDto {
  id: string;
  cropType: CropType;
  year: number;
  yieldTonnesPerHa?: number;
  notes?: string;
}

export interface CropRotationPlanDto {
  id: string;
  plannedCrop: CropType;
  plannedYear: number;
  notes?: string;
}

export interface FieldDetailDto extends FieldDto {
  geoJson?: string;
  cropHistory: CropHistoryDto[];
  rotationPlans: CropRotationPlanDto[];
}

export interface FieldGeometryPayload {
  geoJson: string;
}

export interface FieldSeedingDto {
  id: string;
  year: number;
  cropName: string;
  variety?: string;
  seedingRateKgPerHa?: number;
  totalSeedKg?: number;
  seedingDate?: string;
  notes?: string;
}

export interface FieldFertilizerDto {
  id: string;
  year: number;
  fertilizerName: string;
  applicationType?: string;
  rateKgPerHa?: number;
  totalKg?: number;
  costPerKg?: number;
  totalCost?: number;
  applicationDate: string;
  notes?: string;
}

export interface FieldProtectionDto {
  id: string;
  year: number;
  productName: string;
  protectionType?: string;
  rateLPerHa?: number;
  totalLiters?: number;
  costPerLiter?: number;
  totalCost?: number;
  applicationDate: string;
  notes?: string;
}

export interface FieldHarvestDto {
  id: string;
  year: number;
  cropName: string;
  totalTons: number;
  yieldTonsPerHa?: number;
  moisturePercent?: number;
  pricePerTon?: number;
  totalRevenue?: number;
  harvestDate: string;
  notes?: string;
  syncedFromGrainStorage: boolean;
  grainBatchId?: string;
}

export interface VraZoneDto {
  id: string;
  zoneIndex: number;
  zoneName: string;
  ndviValue?: number;
  soilOrganicMatter?: number;
  soilNitrogen?: number;
  soilPhosphorus?: number;
  soilPotassium?: number;
  areaHectares: number;
  rateKgPerHa: number;
  color: string;
}

export interface VraMapDto {
  id: string;
  fieldId: string;
  name: string;
  fertilizerName: string;
  year: number;
  notes?: string;
  createdAtUtc: string;
  zones: VraZoneDto[];
}
