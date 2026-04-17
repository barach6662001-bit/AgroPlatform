import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { PageTransition } from '../PageTransition';
import { useAuthStore } from '../../stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import CommandPalette from '../CommandPalette';
import { useCommandShortcuts } from '@/hooks/useCommandShortcuts';
import s from './AppLayout.module.css';

export default function AppLayout() {
  useCommandShortcuts()
  usePermissions()

  const { tenantId } = useAuthStore();
  const queryClient = useQueryClient();
  const prevTenantIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (prevTenantIdRef.current !== undefined && prevTenantIdRef.current !== tenantId) {
      queryClient.invalidateQueries();
    }
    prevTenantIdRef.current = tenantId;
  }, [tenantId, queryClient]);

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="page-content">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
