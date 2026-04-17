import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { PageTransition } from '../PageTransition';
import { useAuthStore } from '../../stores/authStore';
import { revokeRefreshToken } from '../../api/auth';
import CommandPalette from '../CommandPalette';
import { useCommandPaletteStore } from '@/stores/commandPaletteStore';
import s from './AppLayout.module.css';

export default function AppLayout() {
  const searchOpen = useCommandPaletteStore((s) => s.isOpen);
  const closeSearch = useCommandPaletteStore((s) => s.close);

  const { logout, tenantId, refreshToken } = useAuthStore();
  const navigate = useNavigate();
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
      {/* Sidebar — hidden on mobile, visible md+ */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main area */}
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

      {/* Legacy command palette — replaced in task-06 */}
      <CommandPalette open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
