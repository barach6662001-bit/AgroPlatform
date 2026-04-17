import { useQuery } from '@tanstack/react-query';

interface FinanceDashboardData {
  quarter: string;
  kpis: {
    cashIn: number; cashInDelta: number;
    cashOut: number; cashOutDelta: number;
    netMargin: number; netMarginDelta: number;
    overdueReceivables: number; overdueCount: number; oldestDays: number;
  };
  cashflow: Array<{ month: string; inflow: number; outflow: number }>;
  payables: Array<{ id: string; contractor: string; amount: number; dueDays: number; currency: string }>;
  marginalityByField: Array<{
    fieldId: string; fieldName: string; culture: string; cultureKey: string;
    area: number; costPerHa: number; revenue: number; profit: number; marginPct: number;
  }>;
  costCategories: Array<{ category: string; amount: number; percent: number; color: string }>;
  upcomingPayments: Array<{ group: string; items: Array<{ id: string; label: string; amount: number }> }>;
}

// deterministic mock values to avoid hydration issues
const CASHFLOW = [
  { month: 'Тра', inflow: 420_000, outflow: 310_000 },
  { month: 'Чер', inflow: 530_000, outflow: 390_000 },
  { month: 'Лип', inflow: 610_000, outflow: 430_000 },
  { month: 'Сер', inflow: 680_000, outflow: 470_000 },
  { month: 'Вер', inflow: 790_000, outflow: 510_000 },
  { month: 'Жов', inflow: 870_000, outflow: 550_000 },
  { month: 'Лис', inflow: 960_000, outflow: 590_000 },
  { month: 'Гру', inflow: 1_040_000, outflow: 620_000 },
  { month: 'Січ', inflow: 1_110_000, outflow: 650_000 },
  { month: 'Лют', inflow: 1_180_000, outflow: 690_000 },
  { month: 'Бер', inflow: 1_250_000, outflow: 720_000 },
  { month: 'Кві', inflow: 1_340_000, outflow: 760_000 },
];

const CULTURES = [
  { k: 'sunflower', n: 'Соняшник' }, { k: 'wheat', n: 'Пшениця' },
  { k: 'corn', n: 'Кукурудза' }, { k: 'rapeseed', n: 'Ріпак' }, { k: 'soy', n: 'Соя' },
];

const FIELD_SEEDS = [
  { area: 96, costPerHa: 2100, revPerHa: 4800 },
  { area: 83, costPerHa: 1950, revPerHa: 5200 },
  { area: 181, costPerHa: 2400, revPerHa: 6100 },
  { area: 112, costPerHa: 1800, revPerHa: 4200 },
  { area: 74, costPerHa: 2200, revPerHa: 4600 },
  { area: 134, costPerHa: 1700, revPerHa: 5800 },
  { area: 60, costPerHa: 2050, revPerHa: 4400 },
  { area: 145, costPerHa: 1900, revPerHa: 5600 },
  { area: 89, costPerHa: 2350, revPerHa: 6400 },
  { area: 120, costPerHa: 1850, revPerHa: 4100 },
  { area: 200, costPerHa: 2600, revPerHa: 7200 },
  { area: 55, costPerHa: 1750, revPerHa: 4900 },
  { area: 178, costPerHa: 2150, revPerHa: 5300 },
  { area: 93, costPerHa: 1980, revPerHa: 4700 },
  { area: 67, costPerHa: 2250, revPerHa: 5900 },
];

const MOCK_FIELDS = FIELD_SEEDS.map((s, i) => {
  const c = CULTURES[i % CULTURES.length];
  const revenue = s.area * s.revPerHa;
  const cost = s.area * s.costPerHa;
  const profit = revenue - cost;
  return {
    fieldId: `F${i}`, fieldName: `${c.n.slice(0, 3).toUpperCase()}-${100 + i}`,
    culture: c.n, cultureKey: c.k,
    area: s.area, costPerHa: s.costPerHa, revenue, profit,
    marginPct: (profit / revenue) * 100,
  };
});

export function useFinanceDashboard() {
  return useQuery<FinanceDashboardData>({
    queryKey: ['finance-dashboard'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/finance-view', { credentials: 'include' });
        if (!res.ok) throw new Error('not ready');
        return await res.json();
      } catch {
        return {
          quarter: 'Q2 2026',
          kpis: {
            cashIn: 8_420_000, cashInDelta: 2.1,
            cashOut: 5_610_000, cashOutDelta: -5.6,
            netMargin: 33.4, netMarginDelta: 3.2,
            overdueReceivables: 342_000, overdueCount: 3, oldestDays: 12,
          },
          cashflow: CASHFLOW,
          payables: [
            { id: 'p1', contractor: 'Syngenta', amount: 120_000, dueDays: 3, currency: '₴' },
            { id: 'p2', contractor: 'Ukrnafta', amount: 85_000, dueDays: 7, currency: '₴' },
            { id: 'p3', contractor: 'BASF', amount: 62_000, dueDays: 14, currency: '₴' },
            { id: 'p4', contractor: 'Нібулон', amount: 340_000, dueDays: -2, currency: '₴' },
            { id: 'p5', contractor: 'Добродія', amount: 48_000, dueDays: 21, currency: '₴' },
          ],
          marginalityByField: MOCK_FIELDS,
          costCategories: [
            { category: 'Паливо', amount: 1_640_000, percent: 29.2, color: 'var(--accent-emerald-500)' },
            { category: 'Зарплата', amount: 1_184_000, percent: 21.1, color: 'var(--accent-purple-500)' },
            { category: 'Добрива', amount: 1_038_000, percent: 18.5, color: 'var(--accent-blue-500)' },
            { category: 'Насіння', amount: 802_000, percent: 14.3, color: 'var(--culture-wheat, #D97706)' },
            { category: 'Хімікати', amount: 550_000, percent: 9.8, color: 'var(--accent-amber-500)' },
            { category: 'Інше', amount: 398_000, percent: 7.1, color: '#6B7280' },
          ],
          upcomingPayments: [
            { group: 'Завтра', items: [{ id: 'up1', label: 'Зарплати', amount: 42_000 }] },
            { group: '20 квітня', items: [{ id: 'up2', label: 'Кредит', amount: 120_000 }] },
            { group: '23 квітня', items: [{ id: 'up3', label: 'Паливо', amount: 85_000 }] },
            { group: '1 травня', items: [{ id: 'up4', label: 'Оренда землі', amount: 280_000 }] },
          ],
        };
      }
    },
  });
}
