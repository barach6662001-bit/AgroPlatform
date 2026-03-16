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
