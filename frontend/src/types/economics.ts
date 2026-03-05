export interface CostRecordDto {
  id: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  fieldId?: string;
  agroOperationId?: string;
  description?: string;
}
