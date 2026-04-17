import { useQuery } from '@tanstack/react-query';

export interface DashboardSummary {
  dayOfSeason: number;
  status: 'good' | 'warning' | 'critical';
  revenue: number;
  revenueDelta: number;
  revenueSparkline: number[];
  margin: number;
  marginDelta: number;
  marginSparkline: number[];
  activeFields: number;
  totalHectares: number;
  activeFieldsDelta: number;
  activeFieldsSparkline: number[];
  ndviAvg: number;
  ndviDelta: number;
  ndviSparkline: number[];
}

const MOCK: DashboardSummary = {
  dayOfSeason: 107,
  status: 'good',
  revenue: 12840000,
  revenueDelta: 18.4,
  revenueSparkline: [4, 6, 5, 8, 7, 9, 11, 10, 13, 12, 14, 17],
  margin: 34.2,
  marginDelta: 4.1,
  marginSparkline: [28, 30, 29, 31, 30, 32, 31, 33, 33, 34, 34, 34],
  activeFields: 47,
  totalHectares: 2340,
  activeFieldsDelta: 2.1,
  activeFieldsSparkline: [40, 42, 43, 44, 44, 45, 45, 46, 46, 47, 47, 47],
  ndviAvg: 0.73,
  ndviDelta: -2.3,
  ndviSparkline: [0.68, 0.71, 0.70, 0.74, 0.75, 0.76, 0.77, 0.76, 0.74, 0.73, 0.72, 0.73],
};

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard/summary', { credentials: 'include' });
        if (!res.ok) throw new Error('not ready');
        return await res.json();
      } catch {
        return MOCK;
      }
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
