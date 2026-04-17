import { ManagerHeader } from '@/components/dashboard/manager/ManagerHeader';
import { ManagerKPIGrid } from '@/components/dashboard/manager/ManagerKPIGrid';
import { ActiveOperations } from '@/components/dashboard/manager/ActiveOperations';
import { AlertsPanel } from '@/components/dashboard/manager/AlertsPanel';
import { FieldStatusGrid } from '@/components/dashboard/manager/FieldStatusGrid';
import { TeamPerformance } from '@/components/dashboard/manager/TeamPerformance';
import { TasksToApprove } from '@/components/dashboard/manager/TasksToApprove';

export default function ManagerDashboard() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 gradient-mesh-default -z-10">
        <div className="noise-overlay" />
      </div>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6 relative">
        <ManagerHeader />
        <ManagerKPIGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ActiveOperations />
          </div>
          <AlertsPanel />
        </div>

        <FieldStatusGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TeamPerformance />
          <TasksToApprove />
        </div>
      </div>
    </div>
  );
}
