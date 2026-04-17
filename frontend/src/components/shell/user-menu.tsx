import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  User, Settings, Sparkles, Keyboard, BookOpen, MessageSquare, LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DensityToggle } from './density-toggle'
import { LanguageSwitcher } from './language-switcher'
import { WhatsNewDialog, useUnreadChangelog } from './whats-new-dialog'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { revokeRefreshToken } from '@/api/auth'

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const [whatsNewOpen, setWhatsNewOpen] = useState(false)
  const navigate = useNavigate()
  const unread = useUnreadChangelog()

  const email = useAuthStore((s) => s.email)
  const firstName = useAuthStore((s) => s.firstName)
  const lastName = useAuthStore((s) => s.lastName)
  const role = useAuthStore((s) => s.role)
  const tenantId = useAuthStore((s) => s.tenantId)
  const logout = useAuthStore((s) => s.logout)
  const refreshToken = useAuthStore((s) => s.refreshToken)

  const { theme, setTheme } = useTheme()

  if (!email) return null

  const name = [firstName, lastName].filter(Boolean).join(' ') || email
  const initials = name.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    if (refreshToken) {
      revokeRefreshToken({ refreshToken }).catch(() => {})
    }
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  const openShortcuts = () => {
    setOpen(false)
    window.dispatchEvent(new Event('open-keyboard-shortcuts'))
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 pr-1.5 pl-1"
            aria-label="User menu"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-xs">{initials}</span>
            {unread > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent-solid" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="end">
          {/* Header */}
          <div className="border-b border-border-subtle p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{name}</div>
                <div className="truncate text-[10px] text-fg-tertiary">{email}</div>
                {role && tenantId && (
                  <div className="truncate text-[10px] text-fg-tertiary">
                    {role} · {tenantId}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-1">
            <MenuItem icon={User} label="Profile" onClick={() => { setOpen(false); navigate('/profile') }} />
            <MenuItem icon={Settings} label="Preferences" onClick={() => { setOpen(false); navigate('/settings/users') }} />
          </div>

          {/* Inline preferences */}
          <div className="border-t border-border-subtle p-2 space-y-2">
            <div className="px-2">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">Appearance</div>
              <div className="flex items-center gap-1 rounded border border-border-subtle p-0.5">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 rounded-sm px-2 py-0.5 text-[10px] capitalize font-medium transition-colors ${
                      theme === t ? 'bg-accent-solid text-accent-fg' : 'text-fg-secondary hover:text-fg-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-2">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">Density</div>
              <DensityToggle />
            </div>
            <div className="px-2">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">Language</div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Help */}
          <div className="border-t border-border-subtle p-1">
            <MenuItem
              icon={Sparkles}
              label="What's new"
              trailing={unread > 0 ? <Badge variant="outline" className="text-[10px] h-4">{unread}</Badge> : undefined}
              onClick={() => { setOpen(false); setWhatsNewOpen(true) }}
            />
            <MenuItem icon={Keyboard} label="Keyboard shortcuts" shortcut="⌘ /" onClick={openShortcuts} />
            <MenuItem icon={BookOpen} label="Help & docs" onClick={() => { setOpen(false); window.open('https://docs.agroplatform.com', '_blank') }} />
            <MenuItem icon={MessageSquare} label="Contact support" onClick={() => { setOpen(false) }} />
          </div>

          {/* Sign out */}
          <div className="border-t border-border-subtle p-1">
            <MenuItem icon={LogOut} label="Sign out" shortcut="⌘ Q" onClick={handleSignOut} destructive />
          </div>
        </PopoverContent>
      </Popover>

      <WhatsNewDialog open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />
    </>
  )
}

function MenuItem({
  icon: Icon, label, shortcut, trailing, onClick, destructive,
}: {
  icon: React.ElementType
  label: string
  shortcut?: string
  trailing?: React.ReactNode
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
        destructive
          ? 'text-danger hover:bg-danger-subtle'
          : 'text-fg-secondary hover:bg-bg-muted hover:text-fg-primary'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {trailing}
      {shortcut && <span className="font-mono text-[10px] text-fg-tertiary">{shortcut}</span>}
    </button>
  )
}
