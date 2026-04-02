import { useState, useEffect } from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined, AimOutlined, InboxOutlined, ToolOutlined,
  DollarOutlined, LineChartOutlined, TeamOutlined, SettingOutlined,
} from '@ant-design/icons';
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
    { key: '/fields', label: t.nav.fields, style: { padding: '4px 8px' } },
    { key: '/fields/rotation-advisor', label: t.nav.cropRotationAdvisor, style: { padding: '4px 8px' } },
  ];

  const operationsChildren = [
    { key: '/operations', label: t.nav.operations, style: { padding: '4px 8px' } },
    { key: '/machinery', label: t.nav.machinery, style: { padding: '4px 8px' } },
    { key: '/fleet', label: t.nav.fleet, style: { padding: '4px 8px' } },
  ];

  const storageChildren = [
    { key: '/warehouses', label: t.nav.warehouses, style: { padding: '4px 8px' } },
    { key: '/warehouses/items', label: t.nav.materials, style: { padding: '4px 8px' } },
    { key: '/warehouses/movements', label: t.nav.movements, style: { padding: '4px 8px' } },
    { key: '/warehouses/inventory', label: t.nav.inventory, style: { padding: '4px 8px' } },
    { key: '/warehouses/import', label: t.nav.import, style: { padding: '4px 8px' } },
    { key: '/storage', label: t.nav.grainModule, style: { padding: '4px 8px' } },
    { key: '/fuel', label: t.nav.fuelStation, style: { padding: '4px 8px' } },
  ];

  const hrChildren = [
    { key: '/hr/employees', label: t.nav.employees, style: { padding: '4px 8px' } },
    { key: '/hr/worklogs', label: t.nav.workLogs, style: { padding: '4px 8px' } },
    { key: '/hr/salary', label: t.nav.salary, style: { padding: '4px 8px' } },
  ];

  const financeChildren = [
    { key: '/economics', label: t.nav.costs, style: { padding: '4px 8px' } },
    { key: '/economics/analytics', label: t.nav.costAnalytics, style: { padding: '4px 8px' } },
    { key: '/economics/pnl', label: t.nav.pnl, style: { padding: '4px 8px' } },
    { key: '/economics/budget', label: t.nav.budget, style: { padding: '4px 8px' } },
    { key: '/economics/marginality', label: t.nav.marginality, style: { padding: '4px 8px' } },
    { key: '/economics/season-comparison', label: t.nav.seasonComparison, style: { padding: '4px 8px' } },
    { key: '/economics/break-even', label: t.nav.breakEven, style: { padding: '4px 8px' } },
    { key: '/fields/leases', label: t.nav.leases, style: { padding: '4px 8px' } },
    { key: '/sales', label: t.nav.sales, style: { padding: '4px 8px' } },
  ];

  const analyticsChildren = [
    { key: '/analytics/efficiency', label: t.nav.efficiency, style: { padding: '4px 8px' } },
    { key: '/analytics/resources', label: t.nav.resources, style: { padding: '4px 8px' } },
    { key: '/analytics/marginality', label: t.nav.marginality, style: { padding: '4px 8px' } },
    { key: '/sales/analytics', label: t.nav.revenueAnalytics, style: { padding: '4px 8px' } },
    { key: '/analytics/salary-fuel', label: t.nav.salaryFuelAnalytics, style: { padding: '4px 8px' } },
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
    { key: '/', label: t.nav.dashboard, icon: <DashboardOutlined />, style: { padding: '4px 8px' } },
    { type: 'divider' as const },
    ...(canFields ? [{
      key: 'fields-group',
      label: t.nav.fields,
      icon: <AimOutlined />,
      style: { padding: '4px 8px' },
      children: fieldsChildren,
    }] : []),
    ...(canMachinery ? [{
      key: 'operations-group',
      label: t.nav.operationsGroup,
      icon: <ToolOutlined />,
      style: { padding: '4px 8px' },
      children: operationsChildren,
    }] : []),
    { type: 'divider' as const },
    ...(canWarehouses ? [{
      key: 'storage-group',
      label: t.nav.storageLogistics,
      icon: <InboxOutlined />,
      style: { padding: '4px 8px' },
      children: storageChildren,
    }] : []),
    ...(canHR ? [{
      key: 'hr-group',
      label: t.nav.hr,
      icon: <TeamOutlined />,
      style: { padding: '4px 8px' },
      children: hrChildren,
    }] : []),
    { type: 'divider' as const },
    ...(canEconomics ? [{
      key: 'finance-group',
      label: t.nav.finance,
      icon: <DollarOutlined />,
      style: { padding: '4px 8px' },
      children: financeChildren,
    }] : []),
    ...(canAnalytics ? [{
      key: 'analytics-group',
      label: t.nav.analytics,
      icon: <LineChartOutlined />,
      style: { padding: '4px 8px' },
      children: analyticsChildren,
    }] : []),
    ...(canAdmin
      ? [
          { type: 'divider' as const },
          {
            key: 'settings-group',
            label: t.nav.settings,
            icon: <SettingOutlined />,
            style: { padding: '4px 8px' },
            children: [
              { key: '/settings/users', label: t.nav.users, style: { padding: '4px 8px' } },
              { key: '/admin/role-permissions', label: t.nav.rolePermissions, style: { padding: '4px 8px' } },
              { key: '/admin/approvals', label: t.nav.approvals, style: { padding: '4px 8px' } },
              { key: '/admin/approval-rules', label: t.nav.approvalRules, style: { padding: '4px 8px' } },
              { key: '/settings/audit', label: t.nav.auditLog, style: { padding: '4px 8px' } },
              { key: '/admin/api-keys', label: t.nav.apiKeys, style: { padding: '4px 8px' } },
              ...(isSuperAdmin
                ? [{ key: '/superadmin/companies', label: t.nav.companies, style: { padding: '4px 8px' } }]
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
      {!collapsed && (
        <div className={s.padded}>
          <span className={s.text11}>
            v1.0.0 · Agrotech Platform
          </span>
          <span className={s.text10}>
            {import.meta.env.MODE}
          </span>
        </div>
      )}
    </div>
  );
}
