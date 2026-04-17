import { useQuery } from '@tanstack/react-query';

export type ActivityKind =
  | 'harvest_completed' | 'harvest_started'
  | 'field_sprayed' | 'field_fertilized'
  | 'gps_synced' | 'device_alert'
  | 'invoice_paid' | 'invoice_overdue'
  | 'shift_started' | 'shift_ended'
  | 'batch_received' | 'batch_transferred';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle?: string;
  timestamp: string;
  actor?: { name: string; initials: string; avatarUrl?: string };
  link?: string;
  severity?: 'info' | 'success' | 'warning' | 'danger';
}

export function useActivityFeed(limit = 10) {
  return useQuery<ActivityItem[]>({
    queryKey: ['activity-feed', limit],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/dashboard/activity?limit=${limit}`, { credentials: 'include' });
        if (!res.ok) throw new Error('not ready');
        return await res.json();
      } catch {
        const now = Date.now();
        return [
          {
            id: 'a1', kind: 'harvest_completed',
            title: 'Збір врожаю завершено',
            subtitle: 'Поле XRI-BOT-001 · 96.06 га',
            timestamp: new Date(now - 2 * 60_000).toISOString(),
            actor: { name: 'Podolyanuk V.', initials: 'PV' },
            link: '/fields/XRI-BOT-001', severity: 'success',
          },
          {
            id: 'a2', kind: 'gps_synced',
            title: 'GPS синхронізовано',
            subtitle: 'CASE 310 · позиція оновлена',
            timestamp: new Date(now - 15 * 60_000).toISOString(),
            actor: { name: 'System', initials: 'SY' },
            severity: 'info',
          },
          {
            id: 'a3', kind: 'invoice_paid',
            title: 'Оплачено рахунок',
            subtitle: '₴186,450 · ТОВ "Хіллс Трейд ЛТД"',
            timestamp: new Date(now - 60 * 60_000).toISOString(),
            actor: { name: 'Finance bot', initials: 'FI' },
            severity: 'success',
          },
          {
            id: 'a4', kind: 'field_fertilized',
            title: 'Внесено добрива',
            subtitle: 'Поле HRY-PEN-008 · 83.23 га · Azoter',
            timestamp: new Date(now - 3 * 60 * 60_000).toISOString(),
            actor: { name: 'Migov V.', initials: 'MV' },
            link: '/fields/HRY-PEN-008', severity: 'info',
          },
          {
            id: 'a5', kind: 'device_alert',
            title: 'Паливо низьке',
            subtitle: 'WH-Silo-2 · залишок 15%',
            timestamp: new Date(now - 5 * 60 * 60_000).toISOString(),
            actor: { name: 'Sensor', initials: 'SN' },
            severity: 'warning',
          },
          {
            id: 'a6', kind: 'batch_received',
            title: 'Прийнято партію',
            subtitle: 'B-042 · 12.5 т · Кукурудза',
            timestamp: new Date(now - 8 * 60 * 60_000).toISOString(),
            actor: { name: 'Lyzko Yu.', initials: 'LY' },
            severity: 'info',
          },
          {
            id: 'a7', kind: 'shift_started',
            title: 'Зміна почалась',
            subtitle: '5 працівників у полі',
            timestamp: new Date(now - 10 * 60 * 60_000).toISOString(),
            actor: { name: 'Morgunok A.', initials: 'MA' },
            severity: 'info',
          },
        ] as ActivityItem[];
      }
    },
    refetchInterval: 30_000,
  });
}
