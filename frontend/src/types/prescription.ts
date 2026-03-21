export interface PrescriptionZoneDto {
  zoneId: string;
  sampleDate?: string;
  ph?: number;
  n?: number;
  p?: number;
  k?: number;
  humus?: number;
  notes?: string;
  recommendedNKgPerHa: number;
  recommendedPKgPerHa: number;
  recommendedKKgPerHa: number;
  applicationZone: 'Low' | 'Medium' | 'High';
}

export interface PrescriptionMapDto {
  fieldId: string;
  fieldName: string;
  areaHectares: number;
  ndviConfigured: boolean;
  generatedAt: string;
  zones: PrescriptionZoneDto[];
}
