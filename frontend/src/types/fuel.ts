export interface FuelTankDto {
  id: string;
  name: string;
  fuelType: number;
  capacityLiters: number;
  currentLiters: number;
  pricePerLiter?: number;
  isActive: boolean;
  fillPercentage: number;
}

export interface FuelTransactionDto {
  id: string;
  fuelTankId: string;
  tankName: string;
  transactionType: 'Supply' | 'Issue';
  quantityLiters: number;
  pricePerLiter?: number;
  totalCost?: number;
  transactionDate: string;
  machineId?: string;
  driverName?: string;
  supplierName?: string;
  invoiceNumber?: string;
  notes?: string;
}
