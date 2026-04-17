import { useQuery } from '@tanstack/react-query';

export interface FinanceData {
  cashflow: Array<{ month: string; value: number }>;
  costs: Array<{ name: string; plan: number; fact: number; color: string }>;
  upcomingPayments: Array<{ id: string; name: string; amount: number; dueDate: string; daysLeft: number }>;
}

export function useFinanceData() {
  return useQuery<FinanceData>({
    queryKey: ['finance-data'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/finance', { credentials: 'include' });
        if (!res.ok) throw new Error('not ready');
        return await res.json();
      } catch {
        return {
          cashflow: [
            { month: 'Тра', value: 4_200_000 },
            { month: 'Чер', value: 5_100_000 },
            { month: 'Лип', value: 5_800_000 },
            { month: 'Сер', value: 6_400_000 },
            { month: 'Вер', value: 7_200_000 },
            { month: 'Жов', value: 8_100_000 },
            { month: 'Лис', value: 9_300_000 },
            { month: 'Гру', value: 10_400_000 },
            { month: 'Січ', value: 11_100_000 },
            { month: 'Лют', value: 11_600_000 },
            { month: 'Бер', value: 12_200_000 },
            { month: 'Кві', value: 12_840_000 },
          ],
          costs: [
            { name: 'Паливо', plan: 2_000_000, fact: 1_640_000, color: 'var(--accent-blue-500)' },
            { name: 'Добрива', plan: 1_800_000, fact: 1_320_000, color: 'var(--accent-emerald-500)' },
            { name: 'Насіння', plan: 1_200_000, fact: 720_000, color: 'var(--culture-wheat, #D97706)' },
            { name: 'Зарплата', plan: 1_000_000, fact: 998_000, color: 'var(--accent-purple-500)' },
            { name: 'Хімікати', plan: 600_000, fact: 430_000, color: 'var(--accent-amber-500)' },
          ],
          upcomingPayments: [
            { id: 'p1', name: 'Зарплати · квітень', amount: 420_000, dueDate: '2026-04-20', daysLeft: 3 },
            { id: 'p2', name: 'Кредит банк "Аваль"', amount: 850_000, dueDate: '2026-04-23', daysLeft: 6 },
            { id: 'p3', name: 'Syngenta · хімікати', amount: 120_000, dueDate: '2026-04-25', daysLeft: 8 },
            { id: 'p4', name: 'Оренда землі · Q2', amount: 280_000, dueDate: '2026-05-01', daysLeft: 14 },
          ],
        };
      }
    },
  });
}
