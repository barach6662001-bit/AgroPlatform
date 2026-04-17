import { FinanceHeader } from '@/components/dashboard/finance/FinanceHeader';
import { FinanceKPIGrid } from '@/components/dashboard/finance/FinanceKPIGrid';
import { CashflowTrendCard } from '@/components/dashboard/finance/CashflowTrendCard';
import { AccountsPayableCard } from '@/components/dashboard/finance/AccountsPayableCard';
import { MarginalityByFieldTable } from '@/components/dashboard/finance/MarginalityByFieldTable';
import { CostCategoriesPie } from '@/components/dashboard/finance/CostCategoriesPie';
import { UpcomingPaymentsCalendar } from '@/components/dashboard/finance/UpcomingPaymentsCalendar';

export default function FinanceDashboard() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 gradient-mesh-finance -z-10">
        <div className="noise-overlay" />
      </div>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6 relative">
        <FinanceHeader />
        <FinanceKPIGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CashflowTrendCard />
          <AccountsPayableCard />
        </div>

        <MarginalityByFieldTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CostCategoriesPie />
          <UpcomingPaymentsCalendar />
        </div>
      </div>
    </div>
  );
}
