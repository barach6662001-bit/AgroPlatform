export type CropType = 'Wheat' | 'Barley' | 'Corn' | 'Sunflower' | 'Soybean' | 'Rapeseed' | 'SugarBeet' | 'Potato' | 'Fallow' | 'Other';
export type PaymentStatus = 'Pending' | 'Paid' | 'PartiallyPaid' | 'Cancelled';

export interface SaleDto {
  id: string;
  buyerName: string;
  contractNumber?: string;
  cropType: CropType;
  quantityTons: number;
  pricePerTon: number;
  totalAmount: number;
  saleDate: string;
  paymentStatus: PaymentStatus;
  grainBatchId?: string;
}

export interface SaleKpiDto {
  totalRevenue: number;
  averagePricePerTon: number;
  topBuyer?: string;
  topBuyerRevenue: number;
  totalSalesCount: number;
  totalQuantityTons: number;
}
