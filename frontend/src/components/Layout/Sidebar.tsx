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

  const storageChildren = [
    { key: '/warehouses/items', label: t.nav.materials, style: { padding: '4px 8px' } },
    { key: '/warehouses/movements', label: t.nav.movements, style: { padding: '4px 8px' } },
  ];

  const financeChildren = [
    { key: '/economics', label: t.nav.costs, style: { padding: '4px 8px' } },
    { key: '/economics/pnl', label: t.nav.pnl, style: { padding: '4px 8px' } },
    { key: '/economics/marginality', label: t.nav.marginality, style: { padding: '4px 8px' } },
    { key: '/economics/budget', label: t.nav.budget, style: { padding: '4px 8px' } },
    { key: '/fields/leases', label: t.nav.leases, style: { padding: '4px 8px' } },
  ];

  const hrChildren = [
    { key: '/hr/employees', label: t.nav.employees, style: { padding: '4px 8px' } },
    { key: '/hr/worklogs', label: t.nav.workLogs, style: { padding: '4px 8px' } },
    { key: '/hr/salary', label: t.nav.salary, style: { padding: '4px 8px' } },
  ];

  const allLeafItems = [
    { key: '/' },
    { key: '/fields' },
    { key: '/operations' },
    { key: '/machinery' },
    { key: '/fleet' },
    { key: '/fuel' },
    { key: '/grain' },
    { key: '/sales' },
    { key: '/analytics/efficiency' },
    ...storageChildren,
    ...financeChildren,
    ...hrChildren,
    ...(isAdmin ? [{ key: '/settings/users' }] : []),
  ];

  const menuItems = [
    { key: '/', label: t.nav.dashboard, icon: <DashboardOutlined />, style: { padding: '4px 8px' } },
    { type: 'divider' as const },
    { key: '/fields', label: t.nav.fields, icon: <AimOutlined />, style: { padding: '4px 8px' } },
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
    { key: '/grain', label: t.nav.grainStorage, icon: <BankOutlined />, style: { padding: '4px 8px' } },
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
    { key: '/analytics/efficiency', label: t.nav.analytics, icon: <LineChartOutlined />, style: { padding: '4px 8px' } },
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
            ],
          },
        ]
      : []),
  ];

  const groupKeys = new Set(['storage-group', 'finance-group', 'hr-group', 'settings-group']);

  const selectedKey =
    allLeafItems
      .slice()
      .reverse()
      .find(
        (item) =>
          location.pathname === item.key ||
          (item.key !== '/' && location.pathname.startsWith(item.key))
      )?.key ?? '/';

  const openKeys = ['storage-group', 'finance-group', 'hr-group', ...(isAdmin ? ['settings-group'] : [])];

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
