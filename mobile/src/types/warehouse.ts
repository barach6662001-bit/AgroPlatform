export interface WarehouseDto {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
  type: number;
}

export interface ItemCategoryDto {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
}

export interface InventorySessionDto {
  id: string;
  warehouseId: string;
  warehouseName: string;
  status: number;
  notes?: string;
  createdAtUtc: string;
  completedAtUtc?: string;
  totalLines: number;
  countedLines: number;
}

export interface InventorySessionLineDto {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  batchId?: string;
  expectedQuantityBase: number;
  actualQuantityBase?: number;
  baseUnit: string;
  isCountRecorded: boolean;
  note?: string;
}

export interface InventorySessionDetailDto extends InventorySessionDto {
  lines: InventorySessionLineDto[];
}

export interface WarehouseItemDto {
  id: string;
  name: string;
  code: string;
  category: string;
  baseUnit: string;
  description?: string;
  purchasePrice?: number;
}

export interface StockMoveDto {
  id: string;
  type: string;
  warehouseId: string;
  warehouseName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitCode: string;
  date: string;
  note?: string;
  createdAt: string;
  totalCost?: number;
  fieldName?: string;
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
