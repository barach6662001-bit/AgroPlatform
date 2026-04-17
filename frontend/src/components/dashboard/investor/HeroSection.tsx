import { useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart2, MapPin, Activity } from 'lucide-react';
import { SeasonBanner } from './SeasonBanner';
import { KPICard } from './KPICard';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';

export function HeroSection() {
  const navigate = useNavigate();
  const { data } = useDashboardSummary();

  const d = data ?? {
    dayOfSeason: 107,
    status: 'good' as const,
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

  return (
    <div className="relative space-y-4">
      {/* Gradient mesh background */}
      <div className="pointer-events-none absolute -inset-8 -z-10 gradient-mesh-default rounded-3xl overflow-hidden opacity-60">
        <div className="noise-overlay" />
      </div>

      <SeasonBanner
        season="Сезон 2026"
        day={d.dayOfSeason}
        totalDays={365}
        status={d.status}
        onAction={() => navigate('/fields')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Загальний дохід"
          value={d.revenue}
          format="currency"
          delta={d.revenueDelta}
          deltaLabel="vs сезон"
          icon={<TrendingUp className="h-4 w-4" />}
          sparkline={d.revenueSparkline}
          accentColor="var(--accent-emerald-500)"
          glowColor="var(--accent-emerald-glow)"
          index={0}
        />
        <KPICard
          label="Маржинальність"
          value={d.margin}
          format="percent"
          delta={d.marginDelta}
          deltaLabel="vs план"
          icon={<BarChart2 className="h-4 w-4" />}
          sparkline={d.marginSparkline}
          accentColor="var(--accent-blue-500)"
          glowColor="var(--accent-blue-glow)"
          index={1}
        />
        <KPICard
          label="Активні поля"
          value={d.activeFields}
          format="number"
          delta={d.activeFieldsDelta}
          deltaLabel={`${d.totalHectares} га`}
          icon={<MapPin className="h-4 w-4" />}
          sparkline={d.activeFieldsSparkline}
          accentColor="var(--accent-purple-500)"
          glowColor="var(--accent-purple-glow)"
          index={2}
        />
        <KPICard
          label="Середній NDVI"
          value={d.ndviAvg}
          format="decimal"
          delta={d.ndviDelta}
          deltaLabel="хмарність"
          icon={<Activity className="h-4 w-4" />}
          sparkline={d.ndviSparkline}
          accentColor="var(--accent-amber-500)"
          glowColor="var(--accent-amber-glow)"
          index={3}
        />
      </div>
    </div>
  );
}
