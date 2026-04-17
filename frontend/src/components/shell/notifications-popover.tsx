import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function NotificationsPopover() {
  const unread = 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          <button className="text-xs text-fg-tertiary hover:text-fg-secondary">
            Mark all read
          </button>
        </div>
        <div className="flex h-48 items-center justify-center text-sm text-fg-tertiary">
          No notifications yet
        </div>
      </PopoverContent>
    </Popover>
  )
}
