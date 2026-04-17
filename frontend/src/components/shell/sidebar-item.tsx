import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function SidebarItem({
  item, collapsed, nested = false,
}: { item: NavItem; collapsed: boolean; nested?: boolean }) {
  const { pathname } = useLocation()
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  const handleAuxClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button === 1) {
      e.preventDefault()
      window.open(item.href, '_blank')
    }
  }

  const content = (
    <NavLink
      to={item.href}
      onAuxClick={handleAuxClick}
      className={cn(
        'relative flex items-center gap-2 rounded text-sm transition-colors',
        'h-8 px-3',
        nested && !collapsed && 'ml-4',
        collapsed && 'justify-center',
        active
          ? 'bg-accent-subtle text-fg-primary font-medium'
          : 'text-fg-secondary hover:bg-bg-muted hover:text-fg-primary',
      )}
    >
      {active && !collapsed && (
        <span className="absolute left-0 h-6 w-0.5 rounded-r bg-accent-solid" aria-hidden />
      )}
      <Icon className={cn(
        'shrink-0',
        collapsed ? 'h-5 w-5' : 'h-4 w-4',
        active ? 'text-accent-solid' : '',
      )} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.shortcut && (
        <span className="ml-auto font-mono text-[10px] text-fg-tertiary">{item.shortcut}</span>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.shortcut && (
            <span className="font-mono text-[10px] text-fg-tertiary">{item.shortcut}</span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
