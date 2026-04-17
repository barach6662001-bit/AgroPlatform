import { useQuery } from '@tanstack/react-query';

export interface FieldStatus {
  id: string;
  name: string;
  culture: string;
  cultureKey: string;
  area: number;
  ndvi: number;
  polygon: [number, number][];
}

const MOCK: FieldStatus[] = [
  {
    id: 'XRI-BOT-001', name: 'ХРИ-БОТ-001', culture: 'Соняшник', cultureKey: 'sunflower',
    area: 96.06, ndvi: 0.74,
    polygon: [[50.42, 30.50], [50.43, 30.50], [50.43, 30.52], [50.42, 30.52]],
  },
  {
    id: 'XRI-PEN-008', name: 'ХРИ-ПЕН-008', culture: 'Пшениця', cultureKey: 'wheat',
    area: 83.23, ndvi: 0.68,
    polygon: [[50.44, 30.52], [50.45, 30.52], [50.45, 30.54], [50.44, 30.54]],
  },
  {
    id: 'HOL-KRU-004', name: 'ГОЛ-КРУ-004', culture: 'Кукурудза', cultureKey: 'corn',
    area: 181.50, ndvi: 0.81,
    polygon: [[50.46, 30.48], [50.48, 30.48], [50.48, 30.51], [50.46, 30.51]],
  },
  {
    id: 'HRY-GRU-001', name: 'ГОЛ-ГРУ-001', culture: 'Ріпак', cultureKey: 'rapeseed',
    area: 112.56, ndvi: 0.62,
    polygon: [[50.44, 30.55], [50.46, 30.55], [50.46, 30.58], [50.44, 30.58]],
  },
  {
    id: 'HOL-SOY-002', name: 'ГОЛ-СОЯ-002', culture: 'Соя', cultureKey: 'soy',
    area: 74.30, ndvi: 0.58,
    polygon: [[50.48, 30.52], [50.49, 30.52], [50.49, 30.54], [50.48, 30.54]],
  },
  {
    id: 'UMN-ZER-003', name: 'УМН-ЗЕР-003', culture: 'Пшениця', cultureKey: 'wheat',
    area: 134.85, ndvi: 0.45,
    polygon: [[50.40, 30.54], [50.42, 30.54], [50.42, 30.57], [50.40, 30.57]],
  },
];

export function useFieldsStatus() {
  return useQuery<FieldStatus[]>({
    queryKey: ['fields-status'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/fields-status', { credentials: 'include' });
        if (!res.ok) throw new Error('not ready');
        return await res.json();
      } catch {
        return MOCK;
      }
    },
    staleTime: 300_000,
  });
}
