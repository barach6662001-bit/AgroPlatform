import { useState, useEffect } from 'react';
import { Menu } from 'antd';
import {
  LayoutDashboard, Map, Cog, Warehouse, Users,
  Banknote, Settings,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { usePermissions } from '../../hooks/usePermissions';
import { useThemeStore } from '../../stores/themeStore';
import s from './Sidebar.module.css';

const groupKeys = new Set(['settings-group']);

const routeToKey: Array<[string, string]> = [
  ['/fields', '/fields'],
  ['/operations', '/operations'],
  ['/warehouse', '/warehouse'],
  ['/finance', '/finance'],
  ['/team', '/team'],
  ['/settings', 'settings-group'],
  ['/admin', 'settings-group'],
  ['/superadmin', 'settings-group'],
];

function getSelectedKey(pathname: string): string {
  // Exact match for dashboard
  if (pathname === '/dashboard') return '/dashboard';
  for (const [prefix, key] of routeToKey) {
    if (pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?')) {
      return key;
    }
  }
  return '/dashboard';
}

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin, isSuperAdmin } = useRole();
  const { hasPermission } = usePermissions();
  const appTheme = useThemeStore((s) => s.theme);

  const canFields      = hasPermission('Fields.View');
  const canMachinery   = hasPermission('Machinery.View');
  const canWarehouses  = hasPermission('Warehouses.View');
  const canSales       = hasPermission('Sales.View');
  const canEconomics   = hasPermission('Economics.View');
  const canHR          = hasPermission('HR.View');
  const canAdmin       = hasPermission('Admin.Manage');

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const key = getSelectedKey(location.pathname);
    return key === 'settings-group' ? ['settings-group'] : [];
  });

  useEffect(() => {
    const key = getSelectedKey(location.pathname);
    if (key === 'settings-group' && !openKeys.includes('settings-group')) {
      setOpenKeys((prev) => [...prev, 'settings-group']);
    }
  }, [location.pathname]);

  const selectedKey = getSelectedKey(location.pathname);

  const menuItems = [
    {
      key: '/dashboard',
      label: t.nav.dashboard,
      icon: <LayoutDashboard size={16} strokeWidth={1.5} />,
    },
    { type: 'divider' as const },
    ...(canFields ? [{
      key: '/fields',
      label: t.nav.fields,
      icon: <Map size={16} strokeWidth={1.5} />,
    }] : []),
    ...(canMachinery ? [{
      key: '/operations',
      label: t.nav.operationsGroup,
      icon: <Cog size={16} strokeWidth={1.5} />,
    }] : []),
    { type: 'divider' as const },
    ...(canWarehouses ? [{
      key: '/warehouse',
      label: t.nav.warehouse ?? t.nav.storageLogistics,
      icon: <Warehouse size={16} strokeWidth={1.5} />,
    }] : []),
    ...(canHR ? [{
      key: '/team',
      label: t.nav.team ?? t.nav.hr,
      icon: <Users size={16} strokeWidth={1.5} />,
    }] : []),
    { type: 'divider' as const },
    ...((canEconomics || canSales) ? [{
      key: '/finance',
      label: t.nav.finance,
      icon: <Banknote size={16} strokeWidth={1.5} />,
    }] : []),
    ...(canAdmin ? [
      { type: 'divider' as const },
      {
        key: 'settings-group',
        label: t.nav.settings,
        icon: <Settings size={16} strokeWidth={1.5} />,
        children: [
          { key: '/settings/users', label: t.nav.users },
          { key: '/admin/role-permissions', label: t.nav.rolePermissions },
          { key: '/admin/approvals', label: t.nav.approvals },
          { key: '/admin/approval-rules', label: t.nav.approvalRules },
          { key: '/settings/audit', label: t.nav.auditLog },
          { key: '/admin/api-keys', label: t.nav.apiKeys },
          ...(isSuperAdmin ? [{ key: '/superadmin/companies', label: t.nav.companies }] : []),
        ],
      },
    ] : []),
  ];

  return (
    <div className={s.flex_col}>
      <Menu
        theme={appTheme === 'dark' ? 'dark' : 'light'}
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        items={menuItems}
        onClick={({ key }) => {
          if (!groupKeys.has(key)) navigate(key);
        }}
        className={s.bg}
      />
    </div>
  );
}
