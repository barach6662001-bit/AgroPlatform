import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Map, Cog, Package,
  Users, CreditCard, Settings,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  labelKey?: string
  icon: LucideIcon
  href: string
  permission?: string
  shortcut?: string
  children?: NavItem[]
  badge?: () => number | undefined
}

export interface NavGroup {
  id: string
  label: string
  labelKey?: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    labelKey: 'nav.group.overview',
    items: [
      {
        id: 'dashboard', label: 'Dashboard', labelKey: 'nav.dashboard',
        icon: LayoutDashboard, href: '/dashboard', shortcut: 'G D',
      },
      {
        id: 'fields', label: 'Fields', labelKey: 'nav.fields',
        icon: Map, href: '/fields', shortcut: 'G F',
        permission: 'Fields.View',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    labelKey: 'nav.group.operations',
    items: [
      {
        id: 'operations', label: 'Operations', labelKey: 'nav.operationsGroup',
        icon: Cog, href: '/operations', shortcut: 'G O',
        permission: 'Machinery.View',
      },
      {
        id: 'warehouse', label: 'Warehouse', labelKey: 'nav.warehouse',
        icon: Package, href: '/warehouse', shortcut: 'G W',
        permission: 'Warehouses.View',
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    labelKey: 'nav.group.people',
    items: [
      {
        id: 'team', label: 'Team', labelKey: 'nav.team',
        icon: Users, href: '/team', shortcut: 'G E',
        permission: 'HR.View',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    labelKey: 'nav.group.finance',
    items: [
      {
        id: 'finance', label: 'Finance', labelKey: 'nav.finance',
        icon: CreditCard, href: '/finance', shortcut: 'G P',
        permission: 'Economics.View',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    labelKey: 'nav.group.settings',
    items: [
      {
        id: 'settings', label: 'Settings', labelKey: 'nav.settings',
        icon: Settings, href: '/settings/users',
        permission: 'Admin.Manage',
      },
    ],
  },
]
