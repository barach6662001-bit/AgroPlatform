import { Menu } from 'antd';
import {
  DashboardOutlined, AimOutlined, InboxOutlined, ToolOutlined, CarOutlined,
  DollarOutlined, LineChartOutlined, TeamOutlined, SettingOutlined,
  EnvironmentOutlined, BankOutlined, FireOutlined, ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin } = useRole();

  const fieldsChildren = [
    { key: '/fields', label: t.nav.fields, style: { padding: '4px 8px' } },
    { key: '/fields/rotation-advisor', label: t.nav.cropRotationAdvisor, style: { padding: '4px 8px' } },
  ];

  const storageChildren = [
    { key: '/warehouses', label: t.nav.warehouses, style: { padding: '4px 8px' } },
    { key: '/warehouses/items', label: t.nav.materials, style: { padding: '4px 8px' } },
    { key: '/warehouses/movements', label: t.nav.movements, style: { padding: '4px 8px' } },
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
  ];

  const hrChildren = [
    { key: '/hr/employees', label: t.nav.employees, style: { padding: '4px 8px' } },
    { key: '/hr/worklogs', label: t.nav.workLogs, style: { padding: '4px 8px' } },
    { key: '/hr/salary', label: t.nav.salary, style: { padding: '4px 8px' } },
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
    { key: '/fields' },
    { key: '/fields/rotation-advisor' },
    { key: '/operations' },
    { key: '/machinery' },
    { key: '/fleet' },
    { key: '/fuel' },
    { key: '/storage' },
    { key: '/sales' },
    { key: '/sales/analytics' },
    { key: '/warehouses' },
    ...analyticsChildren,
    ...storageChildren,
    ...financeChildren,
    ...hrChildren,
    ...(isAdmin
      ? [
          { key: '/settings/users' },
          { key: '/settings/audit' },
          { key: '/admin/permissions' },
          { key: '/admin/audit' },
          { key: '/admin/api-keys' },
        ]
      : []),
  ];

  const menuItems = [
    { key: '/', label: t.nav.dashboard, icon: <DashboardOutlined />, style: { padding: '4px 8px' } },
    { type: 'divider' as const },
    {
      key: 'fields-group',
      label: t.nav.fields,
      icon: <AimOutlined />,
      style: { padding: '4px 8px' },
      children: fieldsChildren,
    },
    { key: '/operations', label: t.nav.operations, icon: <ToolOutlined />, style: { padding: '4px 8px' } },
    { key: '/machinery', label: t.nav.machinery, icon: <CarOutlined />, style: { padding: '4px 8px' } },
    { type: 'divider' as const },
    {
      key: 'storage-group',
      label: t.nav.storage,
      icon: <InboxOutlined />,
      style: { padding: '4px 8px' },
      children: storageChildren,
    },
    { key: '/storage', label: t.nav.grainModule, icon: <BankOutlined />, style: { padding: '4px 8px' } },
    { key: '/fuel', label: t.nav.fuelStation, icon: <FireOutlined />, style: { padding: '4px 8px' } },
    { key: '/sales', label: t.nav.sales, icon: <ShoppingOutlined />, style: { padding: '4px 8px' } },
    { type: 'divider' as const },
    {
      key: 'finance-group',
      label: t.nav.finance,
      icon: <DollarOutlined />,
      style: { padding: '4px 8px' },
      children: financeChildren,
    },
    {
      key: 'hr-group',
      label: t.nav.hr,
      icon: <TeamOutlined />,
      style: { padding: '4px 8px' },
      children: hrChildren,
    },
    { type: 'divider' as const },
    {
      key: 'analytics-group',
      label: t.nav.analytics,
      icon: <LineChartOutlined />,
      style: { padding: '4px 8px' },
      children: analyticsChildren,
    },
    { key: '/fleet', label: t.nav.fleet, icon: <EnvironmentOutlined />, style: { padding: '4px 8px' } },
    ...(isAdmin
      ? [
          {
            key: 'settings-group',
            label: t.nav.settings,
            icon: <SettingOutlined />,
            style: { padding: '4px 8px' },
            children: [
              { key: '/settings/users', label: t.nav.users, style: { padding: '4px 8px' } },
              { key: '/settings/audit', label: t.nav.auditLog, style: { padding: '4px 8px' } },
              { key: '/admin/permissions', label: 'Permissions', style: { padding: '4px 8px' } },
              { key: '/admin/audit', label: 'Audit Log', style: { padding: '4px 8px' } },
              { key: '/admin/api-keys', label: 'API Keys', style: { padding: '4px 8px' } },
            ],
          },
        ]
      : []),
  ];

  const groupKeys = new Set(['fields-group', 'storage-group', 'finance-group', 'hr-group', 'analytics-group', 'settings-group']);

  const selectedKey =
    allLeafItems
      .slice()
      .reverse()
      .find(
        (item) =>
          location.pathname === item.key ||
          (item.key !== '/' && location.pathname.startsWith(item.key))
      )?.key ?? '/';

  const openKeys = ['fields-group', 'storage-group', 'finance-group', 'hr-group', 'analytics-group', ...(isAdmin ? ['settings-group'] : [])];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={({ key }) => {
          if (!groupKeys.has(key)) navigate(key);
        }}
        style={{ borderRight: 0, flex: 1, overflowY: 'auto', background: 'transparent' }}
      />
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-disabled)', display: 'block' }}>
            v1.0.0 · Agrotech Platform
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>
            {import.meta.env.MODE}
          </span>
        </div>
      )}
    </div>
  );
}
