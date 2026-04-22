/**
 * Mock dataset for the /preview/dashboard-v2 standalone preview route.
 *
 * Lives in src/data/ (per the v2 brief) and is intentionally separate from
 * src/mocks/mockDashboardData.ts (which is used by the global axios mock
 * layer when VITE_BYPASS_AUTH is on).  The preview route consumes this
 * file directly via props — no axios, no React Query, no auth.
 *
 * IMPORTANT: every numeric field below feeds into KPI deltas computed by
 * computeTrend() — values were chosen so that revenue and expenses have
 * realistic > 0.5 % period-over-period swings (so the delta chips actually
 * render in the preview), and so that the profit hero card lands on a
 * meaningful margin.
 */

import type { DashboardDto } from '../types/analytics';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';

export const mockDashboardV2: DashboardDto = {
  totalFields: 6,
  totalAreaHectares: 842.5,
  areaByCrop: {
    Wheat: 320,
    Sunflower: 210,
    Corn: 180,
    Soybean: 90,
    Fallow: 42.5,
  },
  totalWarehouses: 3,
  totalWarehouseItems: 47,
  topStockItems: [
    { itemId: 'i1', itemName: 'Карбамід 46%',          category: 'Fertilizer', totalBalance: 12_400, baseUnit: 'кг' },
    { itemId: 'i2', itemName: 'Дизельне пальне',        category: 'Fuel',       totalBalance:  8_650, baseUnit: 'л'  },
    { itemId: 'i3', itemName: 'Раундап 480',            category: 'Pesticide',  totalBalance:    420, baseUnit: 'л'  },
    { itemId: 'i4', itemName: 'Насіння соняшнику NK',   category: 'Seeds',      totalBalance:  1_120, baseUnit: 'кг' },
    { itemId: 'i5', itemName: 'Аміачна селітра',        category: 'Fertilizer', totalBalance:    180, baseUnit: 'кг' },
  ],
  totalOperations: 142,
  completedOperations: 118,
  pendingOperations: 14,
  operationsByType: {
    Sowing: 24, Fertilizing: 38, PlantProtection: 31, SoilTillage: 27, Harvesting: 22,
  },
  totalMachines: 18,
  activeMachines: 15,
  underRepairMachines: 3,
  totalHoursWorked: 4_280,
  totalFuelConsumed: 21_400,
  totalCosts:   3_380_000,
  totalRevenue: 5_120_000,
  monthlyExpenses: 520_000,
  monthlyRevenue:  860_000,
  monthlyProfit:   340_000,
  costsByCategory: {
    Seeds:       620_000,
    Fertilizer:  890_000,
    Fuel:        540_000,
    Salaries:    480_000,
    Pesticides:  300_000,
    Machinery:   550_000,
  },
  costTrend: [
    { year: 2025, month: 11, totalAmount: 410_000, revenueAmount: 540_000 },
    { year: 2025, month: 12, totalAmount: 380_000, revenueAmount: 610_000 },
    { year: 2026, month:  1, totalAmount: 295_000, revenueAmount: 720_000 },
    { year: 2026, month:  2, totalAmount: 340_000, revenueAmount: 780_000 },
    { year: 2026, month:  3, totalAmount: 475_000, revenueAmount: 830_000 },
    { year: 2026, month:  4, totalAmount: 520_000, revenueAmount: 860_000 },
  ],
};

export const mockFieldsV2: FieldDto[] = [
  { id: 'f1', name: 'Поле №1 «Південне»',  areaHectares: 180.4, currentCrop: 'Wheat',     ownershipType: 0 },
  { id: 'f2', name: 'Поле №2 «Степове»',   areaHectares: 142.7, currentCrop: 'Sunflower', ownershipType: 1 },
  { id: 'f3', name: 'Поле №3 «За яром»',   areaHectares: 218.3, currentCrop: 'Corn',      ownershipType: 0 },
  { id: 'f4', name: 'Поле №4 «Балка»',     areaHectares:  87.1, currentCrop: 'Soybean',   ownershipType: 1 },
  { id: 'f5', name: 'Поле №5 «Лісосмуга»', areaHectares: 171.5, currentCrop: 'Wheat',     ownershipType: 0 },
  { id: 'f6', name: 'Поле №6 «Парове»',    areaHectares:  42.5, currentCrop: 'Fallow',    ownershipType: 1 },
];

const today = new Date();
const iso = (offsetDays: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const mockOperationsV2: AgroOperationDto[] = [
  { id: 'o1', fieldId: 'f1', fieldName: 'Поле №1 «Південне»',  operationType: 'Fertilizing',     plannedDate: iso(-2), completedDate: iso(-1), isCompleted: true,  areaProcessed: 180 },
  { id: 'o2', fieldId: 'f3', fieldName: 'Поле №3 «За яром»',   operationType: 'PlantProtection', plannedDate: iso(-1), completedDate: iso(-1), isCompleted: true,  areaProcessed: 218 },
  { id: 'o3', fieldId: 'f4', fieldName: 'Поле №4 «Балка»',     operationType: 'SoilTillage',     plannedDate: iso(-3), isCompleted: false, areaProcessed: 87 },
  { id: 'o4', fieldId: 'f2', fieldName: 'Поле №2 «Степове»',   operationType: 'Sowing',          plannedDate: iso( 1), isCompleted: false },
  { id: 'o5', fieldId: 'f5', fieldName: 'Поле №5 «Лісосмуга»', operationType: 'Fertilizing',     plannedDate: iso( 2), isCompleted: false },
  { id: 'o6', fieldId: 'f1', fieldName: 'Поле №1 «Південне»',  operationType: 'PlantProtection', plannedDate: iso( 3), isCompleted: false },
  { id: 'o7', fieldId: 'f6', fieldName: 'Поле №6 «Парове»',    operationType: 'SoilTillage',     plannedDate: iso( 5), isCompleted: false },
  { id: 'o8', fieldId: 'f3', fieldName: 'Поле №3 «За яром»',   operationType: 'Harvesting',      plannedDate: iso( 7), isCompleted: false },
];
