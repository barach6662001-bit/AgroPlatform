import { WorkerHeader } from '@/components/dashboard/worker/WorkerHeader';
import { QuickTasksRow } from '@/components/dashboard/worker/QuickTasksRow';
import { WarehouseStateTable } from '@/components/dashboard/worker/WarehouseStateTable';
import { MyRecentActivity } from '@/components/dashboard/worker/MyRecentActivity';
import { QuickActionsPanel } from '@/components/dashboard/worker/QuickActionsPanel';

export default function WorkerDashboard() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="p-6 max-w-[1400px] mx-auto space-y-4">
        <WorkerHeader />
        <QuickTasksRow />
        <WarehouseStateTable />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MyRecentActivity />
          </div>
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  );
}
