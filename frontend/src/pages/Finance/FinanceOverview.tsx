import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../api/analytics';
import { useTranslation } from '../../i18n';
import { formatUA } from '../../utils/numberFormat';
import KpiCard from '../../components/ui/KpiCard';
import RevenueCostChart from '../Dashboard/components/RevenueCostChart';
import { KpiSkeleton, ChartSkeleton } from '../../components/Skeletons';

export default function FinanceOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['finance-overview'],
    queryFn: ({ signal }) => getDashboard(signal),
    staleTime: 60_000,
  });

  if (isLoading) return <><KpiSkeleton count={4} /><ChartSkeleton /></>;
  if (!data) return null;

  const revenue = data.totalRevenue ?? 0;
  const costs = data.totalCosts ?? 0;
  const profit = revenue - costs;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';

  const revenueTrendMap = new Map(
    (data.revenueTrend ?? []).map((item) => [
      `${item.year}-${String(item.month).padStart(2, '0')}`,
      item.totalAmount,
    ])
  );
  const trendData = (data.costTrend ?? []).map((item) => {
    const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    return {
      name: key,
      cost: item.totalAmount,
      revenue: revenueTrendMap.get(key) ?? 0,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <KpiCard
          label={t.dashboard.seasonRevenue ?? 'Дохід (сезон)'}
          value={`${formatUA(revenue)} ₴`}
          onClick={() => navigate('/finance?tab=sales')}
        />
        <KpiCard
          label={t.dashboard.seasonExpenses ?? 'Витрати (сезон)'}
          value={`${formatUA(costs)} ₴`}
          onClick={() => navigate('/finance?tab=costs')}
        />
        <KpiCard
          label={t.dashboard.seasonProfit ?? 'Прибуток'}
          value={`${formatUA(profit)} ₴`}
        />
        <KpiCard
          label={t.dashboard.margin ?? 'Маржа'}
          value={`${margin}%`}
          onClick={() => navigate('/finance?tab=analytics')}
        />
      </div>

      {/* Revenue vs Cost chart */}
      {trendData.length > 0 && (
        <RevenueCostChart
          data={trendData}
          title={t.dashboard.costTrend ?? 'Динаміка витрат та доходів'}
          costLabel={t.dashboard.costsUAH ?? 'Витрати'}
          revenueLabel={t.dashboard.revenueUAH ?? t.dashboard.seasonRevenue ?? 'Дохід'}
        />
      )}
    </div>
  );
}
