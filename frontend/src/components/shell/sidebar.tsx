import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { navigation } from '@/lib/navigation'
import { SidebarGroup } from './sidebar-group'
import { SidebarSyncStatus } from './sidebar-sync-status'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { usePermissionsStore } from '@/stores/permissionsStore'
import { useHotkeys } from 'react-hotkeys-hook'

export function Sidebar() {
  const collapsed = usePreferencesStore((s) => s.sidebarCollapsed)
  const toggle = usePreferencesStore((s) => s.toggleSidebar)
  const hasPermission = usePermissionsStore((s) => s.hasPermission)

  const canSee = (perm?: string) => !perm || hasPermission(perm)

  useHotkeys('[', () => toggle(), { preventDefault: true })

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border-subtle bg-bg-subtle',
        'transition-[width] duration-200 ease-out overflow-hidden',
        collapsed ? 'w-12' : 'w-60',
      )}
    >
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {navigation.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            canSee={canSee}
          />
        ))}
      </div>

      <div className="border-t border-border-subtle">
        <SidebarSyncStatus collapsed={collapsed} />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn(
            'w-full justify-center rounded-none h-8 text-fg-tertiary',
            !collapsed && 'justify-start px-3 gap-2',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? '[ — expand' : '[ — collapse'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
