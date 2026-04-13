import { useState, useEffect } from 'react';
import { Menu } from 'antd';
import {
  LayoutDashboard, Map, Factory, Warehouse, Users,
  Banknote, BarChart3, Settings,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { usePermissions } from '../../hooks/usePermissions';
import { useThemeStore } from '../../stores/themeStore';
import s from './Sidebar.module.css';

const groupKeys = new Set([
  'fields-group', 'operations-group', 'storage-group',
  'hr-group', 'finance-group', 'analytics-group',
  'settings-group',
]);

const routeToGroup: Array<[string, string]> = [
  ['/fields/rotation-advisor', 'fields-group'],
  ['/fields/leases', 'finance-group'],
  ['/fields', 'fields-group'],
  ['/operations', 'operations-group'],
  ['/machinery', 'operations-group'],
  ['/fleet', 'operations-group'],
  ['/warehouses', 'storage-group'],
  ['/storage', 'storage-group'],
  ['/fuel', 'storage-group'],
  ['/economics', 'finance-group'],
  ['/sales', 'finance-group'],
  ['/hr', 'hr-group'],
  ['/analytics', 'analytics-group'],
  ['/settings', 'settings-group'],
  ['/admin', 'settings-group'],
  ['/superadmin', 'settings-group'],
];

function getGroupForPath(pathname: string): string | null {
  for (const [prefix, group] of routeToGroup) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return group;
    }
  }
  return null;
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
  const canGrain       = hasPermission('GrainStorage.View');
  const canFuel        = hasPermission('Fuel.View');
  const canSales       = hasPermission('Sales.View');
  const canEconomics   = hasPermission('Economics.View');
  const canHR          = hasPermission('HR.View');
  const canAnalytics   = hasPermission('Analytics.View');
  const canAdmin       = hasPermission('Admin.Manage');

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const group = getGroupForPath(location.pathname);
    return group ? [group] : [];
  });

  useEffect(() => {
    const group = getGroupForPath(location.pathname);
    if (group && !openKeys.includes(group)) {
      setOpenKeys((prev) => [...prev, group]);
    }
  }, [location.pathname]);

  const fieldsChildren = [
    { key: '/fields', label: t.nav.fields },
    { key: '/fields/rotation-advisor', label: t.nav.cropRotationAdvisor },
  ];

  const operationsChildren = [
    { key: '/operations', label: t.nav.operations },
    { key: '/machinery', label: t.nav.machinery },
    { key: '/fleet', label: t.nav.fleet },
  ];

  const storageChildren = [
    { key: '/warehouses', label: t.nav.warehouses },
    { key: '/warehouses/items', label: t.nav.materials },
    { key: '/storage', label: t.nav.grainModule },
    { key: '/fuel', label: t.nav.fuelStation },
  ];

  const hrChildren = [
    { key: '/hr/employees', label: t.nav.employees },
    { key: '/hr/worklogs', label: t.nav.workLogs },
    { key: '/hr/salary', label: t.nav.salary },
  ];

  const financeChildren = [
    { key: '/economics', label: t.nav.costs },
    { key: '/economics/pnl', label: t.nav.pnl },
    { key: '/economics/budget', label: t.nav.budget },
    { key: '/fields/leases', label: t.nav.leases },
    { key: '/sales', label: t.nav.sales },
  ];

  const analyticsChildren = [
    { key: '/analytics/efficiency', label: t.nav.efficiency },
    { key: '/analytics/resources', label: t.nav.resources },
    { key: '/analytics/marginality', label: t.nav.marginality },
    { key: '/economics/analytics', label: t.nav.costAnalytics },
    { key: '/economics/marginality', label: t.nav.marginality },
    { key: '/economics/season-comparison', label: t.nav.seasonComparison },
    { key: '/economics/break-even', label: t.nav.breakEven },
    { key: '/sales/analytics', label: t.nav.revenueAnalytics },
    { key: '/analytics/salary-fuel', label: t.nav.salaryFuelAnalytics },
  ];

  const allLeafItems = [
    { key: '/' },
    ...fieldsChildren,
    ...operationsChildren,
    ...storageChildren,
    ...financeChildren,
    ...hrChildren,
    ...analyticsChildren,
    ...(isAdmin
      ? [
          { key: '/settings/users' },
          { key: '/admin/role-permissions' },
          { key: '/admin/approvals' },
          { key: '/admin/approval-rules' },
          { key: '/settings/audit' },
          { key: '/admin/api-keys' },
        ]
      : []),
    ...(isSuperAdmin
      ? [{ key: '/superadmin/companies' }]
      : []),
  ];

  const menuItems = [
    { key: '/', label: t.nav.dashboard, icon: <LayoutDashboard size={16} strokeWidth={1.5} /> },
    { type: 'divider' as const },
    ...(canFields ? [{
      key: 'fields-group',
      label: t.nav.fields,
      icon: <Map size={16} strokeWidth={1.5} />,
      children: fieldsChildren,
    }] : []),
    ...(canMachinery ? [{
      key: 'operations-group',
      label: t.nav.operationsGroup,
      icon: <Factory size={16} strokeWidth={1.5} />,
      children: operationsChildren,
    }] : []),
    { type: 'divider' as const },
    ...(canWarehouses ? [{
      key: 'storage-group',
      label: t.nav.storageLogistics,
      icon: <Warehouse size={16} strokeWidth={1.5} />,
      children: storageChildren,
    }] : []),
    ...(canHR ? [{
      key: 'hr-group',
      label: t.nav.hr,
      icon: <Users size={16} strokeWidth={1.5} />,
      children: hrChildren,
    }] : []),
    { type: 'divider' as const },
    ...(canEconomics ? [{
      key: 'finance-group',
      label: t.nav.finance,
      icon: <Banknote size={16} strokeWidth={1.5} />,
      children: financeChildren,
    }] : []),
    ...(canAnalytics ? [{
      key: 'analytics-group',
      label: t.nav.analytics,
      icon: <BarChart3 size={16} strokeWidth={1.5} />,
      children: analyticsChildren,
    }] : []),
    ...(canAdmin
      ? [
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
              ...(isSuperAdmin
                ? [{ key: '/superadmin/companies', label: t.nav.companies }]
                : []),
            ],
          },
        ]
      : []),
  ];

  const selectedKey =
    allLeafItems
      .slice()
      .reverse()
      .find(
        (item) =>
          location.pathname === item.key ||
          (item.key !== '/' && location.pathname.startsWith(item.key))
      )?.key ?? '/';

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
