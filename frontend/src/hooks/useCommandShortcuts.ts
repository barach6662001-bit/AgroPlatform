import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { keySequenceMatcher, installKeySequences } from '@/lib/key-sequences'
import { commands, pushRecent } from '@/lib/command-registry'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useAuthStore } from '@/stores/authStore'
import { usePermissionsStore } from '@/stores/permissionsStore'
import { toast } from 'sonner'

export function useCommandShortcuts() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const density = usePreferencesStore((s) => s.density)
  const setDensity = usePreferencesStore((s) => s.setDensity)
  const logout = useAuthStore((s) => s.logout)
  const hasPermission = usePermissionsStore((s) => s.hasPermission)

  useEffect(() => {
    const ctx = {
      navigate,
      setTheme: (t: 'light' | 'dark' | 'system') => setTheme(t),
      setDensity,
      currentTheme: theme,
      currentDensity: density,
      logout: async () => { logout(); navigate('/login') },
      openShortcutsModal: () => window.dispatchEvent(new Event('open-keyboard-shortcuts')),
      openTenantSwitcher: () => window.dispatchEvent(new Event('open-tenant-switcher')),
      toast: (msg: string) => toast.message(msg),
    }

    commands.forEach((c) => {
      if (!c.shortcut) return
      if (c.shortcut.replace(/\s+/g, '').length < 2) return
      if (c.permission && !hasPermission(c.permission)) return
      keySequenceMatcher.register(c.shortcut, () => {
        pushRecent(c.id)
        c.run(ctx)
        toast.message(c.label, { duration: 1200 })
      })
    })

    return installKeySequences()
  }, [navigate, setTheme, setDensity, theme, density, logout, hasPermission])
}
