import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Package, Wheat, Fuel, Users, Wallet,
  FileText, Receipt, CreditCard, Plus, Upload, Moon,
  Maximize2, Keyboard, BookOpen, LogOut, Building2,
} from 'lucide-react'

export type CommandCategory =
  | 'contextual' | 'recent' | 'navigate' | 'action'
  | 'switch' | 'help'

export interface Command {
  id: string
  label: string
  category: CommandCategory
  icon?: LucideIcon
  shortcut?: string
  routeMatch?: (pathname: string) => boolean
  permission?: string
  run: (ctx: CommandContext) => void | Promise<void>
}

export interface CommandContext {
  navigate: (to: string) => void
  setTheme: (t: 'light' | 'dark' | 'system') => void
  setDensity: (d: 'compact' | 'comfortable') => void
  currentTheme?: string
  currentDensity?: string
  logout: () => Promise<void>
  openShortcutsModal: () => void
  openTenantSwitcher: () => void
  toast: (msg: string) => void
}

export const commands: Command[] = [
  // NAVIGATE
  { id: 'nav.dashboard', label: 'Go to Dashboard', category: 'navigate',
    icon: LayoutDashboard, shortcut: 'G D',
    run: (c) => c.navigate('/dashboard') },
  { id: 'nav.warehouses', label: 'Go to Warehouses', category: 'navigate',
    icon: Package, shortcut: 'G W', permission: 'Warehouses.View',
    run: (c) => c.navigate('/warehouse') },
  { id: 'nav.grain', label: 'Go to Grain Storage', category: 'navigate',
    icon: Wheat, shortcut: 'G R',
    run: (c) => c.navigate('/warehouse?tab=grain') },
  { id: 'nav.fuel', label: 'Go to Fuel', category: 'navigate',
    icon: Fuel,
    run: (c) => c.navigate('/operations?tab=fuel') },
  { id: 'nav.employees', label: 'Go to Employees', category: 'navigate',
    icon: Users, shortcut: 'G E', permission: 'HR.View',
    run: (c) => c.navigate('/team') },
  { id: 'nav.finance', label: 'Go to Finance', category: 'navigate',
    icon: CreditCard, shortcut: 'G P', permission: 'Economics.View',
    run: (c) => c.navigate('/finance') },
  { id: 'nav.fields', label: 'Go to Fields', category: 'navigate',
    icon: FileText, permission: 'Fields.View',
    run: (c) => c.navigate('/fields') },

  // ACTIONS
  { id: 'action.new-grain-batch', label: 'New grain batch',
    category: 'action', icon: Plus, shortcut: 'N B',
    permission: 'Warehouses.View',
    routeMatch: (p) => p.startsWith('/warehouse'),
    run: (c) => c.navigate('/warehouse?tab=grain') },
  { id: 'action.new-employee', label: 'Add employee',
    category: 'action', icon: Plus, shortcut: 'N E',
    permission: 'HR.View',
    run: (c) => c.navigate('/team') },
  { id: 'action.import-csv', label: 'Import CSV',
    category: 'action', icon: Upload,
    routeMatch: (p) => p.startsWith('/warehouse'),
    permission: 'Warehouses.View',
    run: (c) => c.toast('CSV import coming in Wave 3') },

  // SWITCH
  { id: 'switch.tenant', label: 'Switch company', category: 'switch',
    icon: Building2,
    run: (c) => c.openTenantSwitcher() },
  { id: 'switch.theme', label: 'Toggle theme',
    category: 'switch', icon: Moon, shortcut: '⇧ L',
    run: (c) => c.setTheme(c.currentTheme === 'dark' ? 'light' : 'dark') },
  { id: 'switch.density', label: 'Toggle density',
    category: 'switch', icon: Maximize2, shortcut: '⇧ D',
    run: (c) => c.setDensity(c.currentDensity === 'compact' ? 'comfortable' : 'compact') },

  // HELP
  { id: 'help.shortcuts', label: 'Keyboard shortcuts',
    category: 'help', icon: Keyboard, shortcut: '⌘ /',
    run: (c) => c.openShortcutsModal() },
  { id: 'help.docs', label: 'Documentation',
    category: 'help', icon: BookOpen,
    run: () => { window.open('https://docs.agroplatform.com', '_blank') } },
  { id: 'help.logout', label: 'Sign out',
    category: 'help', icon: LogOut, shortcut: '⌘ Q',
    run: (c) => c.logout() },
]

export function getContextualCommands(pathname: string): Command[] {
  return commands.filter(
    (c) => c.category === 'action' && c.routeMatch?.(pathname)
  )
}

export function getRecentCommands(ids: string[]): Command[] {
  return ids
    .map((id) => commands.find((c) => c.id === id))
    .filter((c): c is Command => !!c)
    .slice(0, 5)
}

export function getRecentIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem('command-palette-recent') ?? '[]')
  } catch {
    return []
  }
}

export function pushRecent(id: string): void {
  const current = getRecentIds()
  const next = [id, ...current.filter((x) => x !== id)].slice(0, 10)
  localStorage.setItem('command-palette-recent', JSON.stringify(next))
}
