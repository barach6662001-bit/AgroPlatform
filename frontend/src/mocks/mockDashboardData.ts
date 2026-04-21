import type { DashboardDto } from '../types/analytics';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import type { PaginatedResult } from '../types/common';
import type { NotificationDto } from '../api/notifications';

/**
 * Realistic Ukrainian agri mock data for the Dashboard page.
 * Consumed only when `isBypassEnabled === true` (dev + VITE_BYPASS_AUTH=true).
 */

export const mockDashboard: DashboardDto = {
  totalFields: 6,
  totalAreaHectares: 842.5,
  areaByCrop: {
    Wheat: 310.0,
    Sunflower: 220.5,
    Corn: 180.0,
    Soybean: 92.0,
    Rapeseed: 40.0,
  },
  totalWarehouses: 3,
  totalWarehouseItems: 47,
  topStockItems: [
    { itemId: 'mock-item-1', itemName: 'Аміачна селітра', category: 'Fertilizer', totalBalance: 12400, baseUnit: 'кг' },
    { itemId: 'mock-item-2', itemName: 'Дизельне паливо', category: 'Fuel', totalBalance: 8600, baseUnit: 'л' },
    { itemId: 'mock-item-3', itemName: 'Насіння соняшнику НК Неома', category: 'Seed', totalBalance: 1850, baseUnit: 'кг' },
    { itemId: 'mock-item-4', itemName: 'Гербіцид Раундап', category: 'Protection', totalBalance: 340, baseUnit: 'л' },
    { itemId: 'mock-item-5', itemName: 'КАС-32', category: 'Fertilizer', totalBalance: 7200, baseUnit: 'л' },
  ],
  totalOperations: 38,
  completedOperations: 24,
  pendingOperations: 14,
  operationsByType: {
    Sowing: 8,
    Fertilizing: 10,
    PlantProtection: 9,
    SoilTillage: 7,
    Harvesting: 4,
  },
  totalMachines: 12,
  activeMachines: 9,
  underRepairMachines: 3,
  totalHoursWorked: 1840,
  totalFuelConsumed: 14250,
  totalCosts: 3_420_000,
  totalRevenue: 5_180_000,
  monthlyExpenses: 520_000,
  monthlyRevenue: 860_000,
  monthlyProfit: 340_000,
  costsByCategory: {
    Fuel: 820_000,
    Fertilizer: 1_150_000,
    Protection: 480_000,
    Salary: 620_000,
    Machinery: 350_000,
  },
  costTrend: [
    { year: 2025, month: 11, totalAmount: 410_000 },
    { year: 2025, month: 12, totalAmount: 380_000 },
    { year: 2026, month: 1, totalAmount: 295_000 },
    { year: 2026, month: 2, totalAmount: 340_000 },
    { year: 2026, month: 3, totalAmount: 475_000 },
    { year: 2026, month: 4, totalAmount: 520_000 },
  ],
};

export const mockDashboardFields: PaginatedResult<FieldDto> = {
  items: [
    { id: 'mock-field-1', name: 'Поле №1 — Північне', areaHectares: 152.4, currentCrop: 'Wheat', currentCropYear: 2026, ownershipType: 0, soilType: 'Чорнозем' },
    { id: 'mock-field-2', name: 'Поле №2 — Долина', areaHectares: 220.5, currentCrop: 'Sunflower', currentCropYear: 2026, ownershipType: 0, soilType: 'Чорнозем' },
    { id: 'mock-field-3', name: 'Поле №3 — Схід', areaHectares: 180.0, currentCrop: 'Corn', currentCropYear: 2026, ownershipType: 1, soilType: 'Сірозем' },
    { id: 'mock-field-4', name: 'Поле №4 — Лісове', areaHectares: 92.0, currentCrop: 'Soybean', currentCropYear: 2026, ownershipType: 1, soilType: 'Чорнозем' },
    { id: 'mock-field-5', name: 'Поле №5 — Південне', areaHectares: 157.6, currentCrop: 'Wheat', currentCropYear: 2026, ownershipType: 0, soilType: 'Чорнозем' },
    { id: 'mock-field-6', name: 'Поле №6 — Запасне', areaHectares: 40.0, currentCrop: 'Rapeseed', currentCropYear: 2026, ownershipType: 0, soilType: 'Чорнозем' },
  ],
  page: 1,
  pageSize: 8,
  totalCount: 6,
  totalPages: 1,
};

export const mockDashboardOperations: PaginatedResult<AgroOperationDto> = {
  items: [
    { id: 'mock-op-1', fieldId: 'mock-field-2', fieldName: 'Поле №2 — Долина', operationType: 'Sowing', plannedDate: '2026-04-12', completedDate: '2026-04-14', isCompleted: true, description: 'Сівба соняшнику НК Неома', areaProcessed: 220.5 },
    { id: 'mock-op-2', fieldId: 'mock-field-3', fieldName: 'Поле №3 — Схід', operationType: 'SoilTillage', plannedDate: '2026-04-10', completedDate: '2026-04-11', isCompleted: true, description: 'Культивація перед сівбою', areaProcessed: 180.0 },
    { id: 'mock-op-3', fieldId: 'mock-field-1', fieldName: 'Поле №1 — Північне', operationType: 'Fertilizing', plannedDate: '2026-04-16', isCompleted: false, description: 'Підживлення КАС-32, 120 л/га', areaProcessed: 152.4 },
    { id: 'mock-op-4', fieldId: 'mock-field-5', fieldName: 'Поле №5 — Південне', operationType: 'PlantProtection', plannedDate: '2026-04-18', isCompleted: false, description: 'Обприскування фунгіцидом' },
    { id: 'mock-op-5', fieldId: 'mock-field-4', fieldName: 'Поле №4 — Лісове', operationType: 'Sowing', plannedDate: '2026-04-20', isCompleted: false, description: 'Планова сівба сої' },
    { id: 'mock-op-6', fieldId: 'mock-field-6', fieldName: 'Поле №6 — Запасне', operationType: 'Fertilizing', plannedDate: '2026-04-22', isCompleted: false, description: 'Підживлення ріпаку' },
    { id: 'mock-op-7', fieldId: 'mock-field-3', fieldName: 'Поле №3 — Схід', operationType: 'Sowing', plannedDate: '2026-04-25', isCompleted: false, description: 'Сівба кукурудзи' },
  ],
  page: 1,
  pageSize: 8,
  totalCount: 7,
  totalPages: 1,
};

export const mockDashboardNotifications: NotificationDto[] = [
  { id: 'mock-notif-1', type: 'warning', title: 'Техніка на ремонті', body: 'Трактор John Deere 6135M потребує обслуговування', isRead: false, createdAtUtc: '2026-04-20T08:15:00Z' },
  { id: 'mock-notif-2', type: 'info', title: 'Завершено операцію', body: 'Сівба соняшнику на Полі №2 — Долина завершена', isRead: false, createdAtUtc: '2026-04-14T16:42:00Z' },
  { id: 'mock-notif-3', type: 'info', title: 'Низький залишок', body: 'Аміачна селітра: залишилось 12% від норми', isRead: true, createdAtUtc: '2026-04-12T10:05:00Z' },
];
