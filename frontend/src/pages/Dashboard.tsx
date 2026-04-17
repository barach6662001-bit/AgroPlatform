import { lazy, Suspense } from 'react';
import { useAuthStore } from '../stores/authStore';
import InvestorDashboard from './dashboards/InvestorDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';

const WorkerDashboard = lazy(() => import('./dashboards/WorkerDashboard'));
const FinanceDashboard = lazy(() => import('./dashboards/FinanceDashboard'));

type Role = 'SuperAdmin' | 'CompanyAdmin' | 'Manager' | 'WarehouseOperator' | 'Accountant' | 'Viewer';

export default function Dashboard() {
  const role = (useAuthStore((s) => s.role) ?? 'CompanyAdmin') as Role;

  if (role === 'Manager') return <ManagerDashboard />;
  if (role === 'WarehouseOperator') return <Suspense fallback={<DashboardShimmer />}><WorkerDashboard /></Suspense>;
  if (role === 'Accountant') return <Suspense fallback={<DashboardShimmer />}><FinanceDashboard /></Suspense>;

  return <InvestorDashboard />;
}

function DashboardShimmer() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4">
      <div className="skeleton-shimmer h-24 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="skeleton-shimmer h-96 rounded-xl lg:col-span-2" />
        <div className="skeleton-shimmer h-96 rounded-xl" />
      </div>
    </div>
  );
}
