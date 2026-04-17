import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  CommandDialog, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command'
import { useCommandPaletteStore } from '@/stores/commandPaletteStore'
import {
  commands, getContextualCommands, getRecentCommands, getRecentIds, pushRecent,
  type Command,
} from '@/lib/command-registry'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useAuthStore } from '@/stores/authStore'
import { usePermissionsStore } from '@/stores/permissionsStore'
import { toast } from 'sonner'

export function CommandPalette() {
  const { isOpen, open, close } = useCommandPaletteStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme, setTheme } = useTheme()
  const density = usePreferencesStore((s) => s.density)
  const setDensity = usePreferencesStore((s) => s.setDensity)
  const hasPermission = usePermissionsStore((s) => s.hasPermission)
  const permRole = usePermissionsStore((s) => s.role)
  const logout = useAuthStore((s) => s.logout)

  useHotkeys('meta+k,ctrl+k', (e) => {
    e.preventDefault()
    useCommandPaletteStore.getState().toggle()
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] })

  const ctx = useMemo(() => ({
    navigate,
    setTheme: (t: 'light' | 'dark' | 'system') => setTheme(t),
    setDensity,
    currentTheme: theme,
    currentDensity: density,
    logout: async () => { logout(); navigate('/login') },
    openShortcutsModal: () => window.dispatchEvent(new Event('open-keyboard-shortcuts')),
    openTenantSwitcher: () => window.dispatchEvent(new Event('open-tenant-switcher')),
    toast: (msg: string) => toast.message(msg),
  }), [navigate, setTheme, setDensity, theme, density, logout])

  const visible = useMemo(
    () => commands.filter((c) => !c.permission || hasPermission(c.permission)),
    [hasPermission, permRole]
  )

  const contextualIds = useMemo(
    () => new Set(getContextualCommands(pathname).map((c) => c.id)),
    [pathname]
  )
  const recentIds = getRecentIds()
  const recent = getRecentCommands(recentIds).filter(
    (c) => visible.some((v) => v.id === c.id) && !contextualIds.has(c.id)
  )

  const execute = async (cmd: Command) => {
    close()
    pushRecent(cmd.id)
    try {
      await cmd.run(ctx)
    } catch (err) {
      console.error(err)
      toast.error('Command failed')
    }
  }

  const byCategory = (cat: Command['category']) =>
    visible.filter((c) => c.category === cat && !contextualIds.has(c.id))

  const contextual = visible.filter((c) => contextualIds.has(c.id))

  return (
    <CommandDialog open={isOpen} onOpenChange={(v) => v ? open() : close()}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        {contextual.length > 0 && (
          <>
            <CommandGroup heading="Contextual">
              {contextual.map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {recent.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recent.map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigate">
          {byCategory('navigate').map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
        </CommandGroup>

        <CommandGroup heading="Actions">
          {byCategory('action').map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
        </CommandGroup>

        <CommandGroup heading="Switch">
          {byCategory('switch').map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
        </CommandGroup>

        <CommandGroup heading="Help">
          {byCategory('help').map((c) => <Item key={c.id} command={c} onSelect={execute} />)}
        </CommandGroup>
      </CommandList>
      <div className="flex items-center gap-3 border-t border-border-subtle px-3 py-2 text-[10px] text-fg-tertiary">
        <span><kbd className="font-mono">↑↓</kbd> navigate</span>
        <span><kbd className="font-mono">⏎</kbd> select</span>
        <span><kbd className="font-mono">ESC</kbd> close</span>
      </div>
    </CommandDialog>
  )
}

export default CommandPalette

function Item({
  command, onSelect,
}: { command: Command; onSelect: (c: Command) => void }) {
  const Icon = command.icon
  return (
    <CommandItem onSelect={() => onSelect(command)}>
      {Icon && <Icon className="mr-2 h-4 w-4 shrink-0" />}
      <span>{command.label}</span>
      {command.shortcut && (
        <span className="ml-auto font-mono text-[10px] text-fg-tertiary">
          {command.shortcut}
        </span>
      )}
    </CommandItem>
  )
}
