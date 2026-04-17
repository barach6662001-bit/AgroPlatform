import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useThemeStore } from '@/stores/themeStore'

/**
 * Bridges next-themes (source of truth) with the legacy Zustand themeStore.
 * Render once at app root, inside ThemeProvider but before the router.
 */
export function ThemeBridge() {
  const { resolvedTheme } = useTheme()
  const setTheme = useThemeStore((s) => s.setTheme)

  useEffect(() => {
    if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
      setTheme(resolvedTheme)
      if (import.meta.env.DEV) {
        console.debug('[ThemeBridge]', { resolvedTheme, storedTheme: useThemeStore.getState().theme })
      }
    }
  }, [resolvedTheme, setTheme])

  return null
}
