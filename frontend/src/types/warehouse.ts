export interface WarehouseDto {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export interface WarehouseItemDto {
  id: string;
  name: string;
  code: string;
  category: string;
  baseUnit: string;
  description?: string;
}

export interface BalanceDto {
  warehouseId: string;
  warehouseName: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  batchId?: string;
  batchCode?: string;
  balanceBase: number;
  baseUnit: string;
  lastUpdatedUtc: string;
}
