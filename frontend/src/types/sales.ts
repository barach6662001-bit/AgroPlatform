export interface SaleDto {
  id: string;
  date: string;
  buyerName: string;
  product: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  currency: string;
  fieldId?: string;
  notes?: string;
}

export interface ProductRevenueDto {
  product: string;
  totalAmount: number;
  totalQuantity: number;
}

export interface BuyerRevenueDto {
  buyerName: string;
  totalAmount: number;
  salesCount: number;
}

export interface MonthlyRevenueDto {
  year: number;
  month: number;
  totalAmount: number;
  salesCount: number;
}

export interface SalesAnalyticsDto {
  totalRevenue: number;
  totalSalesCount: number;
  byProduct: ProductRevenueDto[];
  byBuyer: BuyerRevenueDto[];
  byMonth: MonthlyRevenueDto[];
}
