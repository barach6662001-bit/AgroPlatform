import { useQuery } from '@tanstack/react-query';

interface ManagerDashboardData {
  greeting: { dateText: string; timeText: string; userName: string };
  kpis: {
    operationsToday: number; operationsCritical: number;
    activeTeam: number; totalTeam: number; absent: string[];
    equipmentOnline: number; equipmentTotal: number; equipmentService: number;
    weather: { temp: number; condition: string; rainDaysWeek: number };
  };
  activeOperations: Array<{
    id: string; status: 'ok' | 'warning' | 'critical';
    type: string; worker: string; equipment: string; field: string;
    progress: number; speed: string;
  }>;
  alerts: Array<{
    id: string; severity: 'info' | 'warning' | 'danger';
    title: string; description: string;
    action?: { label: string; href?: string };
  }>;
  fields: Array<{
    id: string; name: string; culture: string; cultureKey: string;
    ndvi: number; status: 'active' | 'fallow' | 'harvested';
  }>;
  team: Array<{ name: string; initials: string; metric: string; rating: number }>;
  approvals: { operations: number; timesheets: number; purchases: number };
}

export function useManagerDashboard() {
  return useQuery<ManagerDashboardData>({
    queryKey: ['manager-dashboard'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/manager', { credentials: 'include' });
        if (!res.ok) throw new Error('not ready');
        return await res.json();
      } catch {
        return {
          greeting: {
            dateText: new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }),
            timeText: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
            userName: 'Влас',
          },
          kpis: {
            operationsToday: 12, operationsCritical: 3,
            activeTeam: 8, totalTeam: 10, absent: ['Hryhorovych'],
            equipmentOnline: 23, equipmentTotal: 25, equipmentService: 2,
            weather: { temp: 18, condition: 'Суха', rainDaysWeek: 2 },
          },
          activeOperations: [
            { id: 'o1', status: 'ok', type: 'Збір врожаю', worker: 'Morgunok A.', equipment: 'CASE 310', field: 'XRI-BOT-001', progress: 67, speed: '12.3 t/h' },
            { id: 'o2', status: 'warning', type: 'Внесення добрив', worker: 'Podolyanuk V.', equipment: 'Amazone', field: 'HRY-PEN-008', progress: 34, speed: '8.4 t/h' },
            { id: 'o3', status: 'ok', type: 'Обприскування', worker: 'Lyzko Yu.', equipment: 'Challenger', field: 'HOL-KRU-004', progress: 91, speed: '4.2 ha/h' },
            { id: 'o4', status: 'critical', type: 'Оранка', worker: 'Migov V.', equipment: 'John Deere 8R', field: 'GOL-LUC-007', progress: 12, speed: 'зупинено' },
          ],
          alerts: [
            { id: 'a1', severity: 'danger', title: 'Паливо низьке', description: 'WH-Silo-2 · 15% залишилось', action: { label: 'Замовити зараз', href: '/warehouses/fuel' } },
            { id: 'a2', severity: 'warning', title: 'Контракт закінчується', description: 'Grain Trader LLC · 12 днів', action: { label: 'Переглянути', href: '/contracts' } },
            { id: 'a3', severity: 'info', title: 'ТО техніки', description: 'CASE 310 · 50 год до обслуговування' },
          ],
          fields: Array.from({ length: 18 }, (_, i) => {
            const cultures = [
              { k: 'sunflower', n: 'Соняшник' },
              { k: 'wheat', n: 'Пшениця' },
              { k: 'corn', n: 'Кукурудза' },
              { k: 'rapeseed', n: 'Ріпак' },
              { k: 'soy', n: 'Соя' },
              { k: 'peas', n: 'Люцерна' },
            ];
            const c = cultures[i % cultures.length];
            return {
              id: `F-${100 + i}`, name: `ХРИ-${100 + i}`,
              culture: c.n, cultureKey: c.k,
              ndvi: parseFloat((0.55 + (i * 0.037) % 0.35).toFixed(2)),
              status: (i % 7 === 0 ? 'fallow' : 'active') as 'active' | 'fallow',
            };
          }),
          team: [
            { name: 'Podolyanuk V.', initials: 'PV', metric: '12.3 t/h', rating: 5 },
            { name: 'Migov V.', initials: 'MV', metric: '8.4 t/h', rating: 4 },
            { name: 'Morgunok A.', initials: 'MA', metric: '7.6 t/h', rating: 4 },
            { name: 'Lyzko Yu.', initials: 'LY', metric: '5.1 t/h', rating: 3 },
            { name: 'Без водія', initials: '??', metric: '3.2 t/h', rating: 0 },
          ],
          approvals: { operations: 3, timesheets: 2, purchases: 1 },
        };
      }
    },
    refetchInterval: 60_000,
  });
}
