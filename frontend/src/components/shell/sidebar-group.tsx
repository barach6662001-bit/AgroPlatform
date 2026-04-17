import { useLocation } from 'react-router-dom'
import { SidebarItem } from './sidebar-item'
import type { NavGroup } from '@/lib/navigation'

export function SidebarGroup({
  group, collapsed, canSee,
}: {
  group: NavGroup
  collapsed: boolean
  canSee: (permission?: string) => boolean
}) {
  const { pathname } = useLocation()
  const visible = group.items.filter((it) => canSee(it.permission))
  if (visible.length === 0) return null

  return (
    <div className="mt-4 first:mt-0">
      {!collapsed && (
        <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
          {group.label}
        </div>
      )}
      {collapsed && <div className="mx-auto my-2 h-px w-6 bg-border-subtle" />}
      <nav aria-label={group.label} className="flex flex-col gap-0.5">
        {visible.map((item) => {
          const parentActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <div key={item.id} className="relative">
              <SidebarItem item={item} collapsed={collapsed} />
              {!collapsed && item.children && parentActive && (
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {item.children
                    .filter((c) => canSee(c.permission))
                    .map((child) => (
                      <SidebarItem
                        key={child.id}
                        item={child}
                        collapsed={false}
                        nested
                      />
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
