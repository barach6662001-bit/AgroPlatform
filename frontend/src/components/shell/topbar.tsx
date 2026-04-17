import { Breadcrumbs } from './breadcrumbs'
import { TenantSwitcher } from './tenant-switcher'
import { SearchTrigger } from './search-trigger'
import { NotificationsPopover } from './notifications-popover'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from './user-menu'
import { MobileDrawerTrigger } from './mobile-drawer-trigger'

export function Topbar() {
  return (
    <header className="flex h-11 items-center gap-3 border-b border-border-subtle bg-bg-base px-4">
      <MobileDrawerTrigger />
      <TenantSwitcher />
      <div className="hidden md:block h-5 w-px bg-border-subtle" />
      <div className="hidden md:block">
        <Breadcrumbs />
      </div>
      <div className="flex-1" />
      <SearchTrigger />
      <NotificationsPopover />
      <ThemeToggle />
      <div className="hidden md:block h-5 w-px bg-border-subtle" />
      <UserMenu />
    </header>
  )
}
