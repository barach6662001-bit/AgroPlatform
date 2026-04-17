import { useAuthStore } from '../stores/authStore';
import InvestorDashboard from './dashboards/InvestorDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import WorkerDashboard from './dashboards/WorkerDashboard';
import FinanceDashboard from './dashboards/FinanceDashboard';

type Role = 'SuperAdmin' | 'CompanyAdmin' | 'Manager' | 'WarehouseOperator' | 'Accountant' | 'Viewer';

export default function Dashboard() {
  const role = (useAuthStore((s) => s.role) ?? 'CompanyAdmin') as Role;

  if (role === 'Manager') return <ManagerDashboard />;
  if (role === 'WarehouseOperator') return <WorkerDashboard />;
  if (role === 'Accountant') return <FinanceDashboard />;

  return <InvestorDashboard />;
}
