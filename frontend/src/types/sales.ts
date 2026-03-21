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
