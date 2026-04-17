import { useQuery } from '@tanstack/react-query';

interface WorkerDashboardData {
  tasks: { receive: number; transfer: number; writeoff: number; nextInventory: string };
  warehouse: { id: string; name: string };
  batches: Array<{
    id: string; name: string; culture: string; cultureKey: string;
    qty: number; unit: string; status: string; lastAction: string; lastActionTime: string;
  }>;
  myActivity: Array<{
    id: string; action: string; details: string; timestamp: string;
  }>;
}

export function useWorkerDashboard() {
  return useQuery<WorkerDashboardData>({
    queryKey: ['worker-dashboard'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/worker', { credentials: 'include' });
        if (!res.ok) throw new Error('not ready');
        return await res.json();
      } catch {
        return {
          tasks: { receive: 3, transfer: 1, writeoff: 0, nextInventory: 'п\'ятниця' },
          warehouse: { id: 'WH-SILO-2', name: 'WH-Silo-2' },
          batches: Array.from({ length: 15 }, (_, i) => ({
            id: `B-${(i + 1).toString().padStart(3, '0')}`,
            name: `B-${(i + 1).toString().padStart(3, '0')}`,
            culture: ['Соняшник', 'Пшениця', 'Кукурудза', 'Ріпак'][i % 4],
            cultureKey: ['sunflower', 'wheat', 'corn', 'rapeseed'][i % 4],
            qty: parseFloat((200 + (i * 87.3) % 1200).toFixed(1)),
            unit: 'т',
            status: ['Активна', 'Зарезервована', 'Активна'][i % 3],
            lastAction: ['Приймання', 'Переміщення', 'Резервування'][i % 3],
            lastActionTime: ['Вчора', '2 дні тому', 'Тиждень тому'][i % 3],
          })),
          myActivity: [
            { id: 'm1', action: 'Прийнято 12.5т Кукурудза', details: 'до B-042', timestamp: '2m' },
            { id: 'm2', action: 'Переміщено 8.0т Пшениця', details: 'B-001 → B-015', timestamp: '15m' },
            { id: 'm3', action: 'Зарезервовано 340т Соняшник', details: 'B-003', timestamp: '1h' },
            { id: 'm4', action: 'Зміна почалась', details: '', timestamp: '3h' },
          ],
        };
      }
    },
  });
}
