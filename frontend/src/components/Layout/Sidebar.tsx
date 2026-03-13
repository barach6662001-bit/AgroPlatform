import { Menu } from 'antd';
import {
  DashboardOutlined, AimOutlined, InboxOutlined, ToolOutlined, CarOutlined,
  DollarOutlined, LineChartOutlined, BarChartOutlined, ThunderboltOutlined,
  TeamOutlined, UserOutlined, SwapOutlined, RiseOutlined, SettingOutlined,
  EnvironmentOutlined, FundOutlined, BellOutlined, BankOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin } = useRole();

  const warehouseChildren = [
    { key: '/warehouses', label: t.nav.warehouses, icon: <BankOutlined /> },
    { key: '/warehouses/items', label: t.nav.warehouseItems, icon: <InboxOutlined /> },
    { key: '/warehouses/movements', label: t.nav.stockMovements, icon: <SwapOutlined /> },
    { key: '/warehouses/grain', label: t.nav.grainStorage, icon: <InboxOutlined /> },
  ];

  const economicsChildren = [
    { key: '/economics', label: t.nav.costs, icon: <DollarOutlined /> },
    { key: '/economics/pnl', label: t.nav.pnl, icon: <RiseOutlined /> },
    { key: '/economics/budget', label: t.nav.budget, icon: <FundOutlined /> },
  ];

  const analyticsChildren = [
    { key: '/analytics/resources', label: t.analytics.resourceConsumption, icon: <BarChartOutlined /> },
    { key: '/analytics/efficiency', label: t.analytics.fieldEfficiency, icon: <ThunderboltOutlined /> },
  ];

  const allLeafItems = [
    { key: '/' },
    { key: '/fields' },
    { key: '/operations' },
    { key: '/machinery' },
    { key: '/fleet' },
    { key: '/notifications' },
    { key: '/profile' },
    ...warehouseChildren,
    ...economicsChildren,
    ...analyticsChildren,
    ...(isAdmin ? [{ key: '/settings/users' }] : []),
  ];

  const menuItems = [
    { key: '/', label: t.nav.dashboard, icon: <DashboardOutlined /> },
    { key: '/fields', label: t.nav.fields, icon: <AimOutlined /> },
    {
      key: 'warehouses-group',
      label: t.nav.warehouses,
      icon: <InboxOutlined />,
      children: warehouseChildren,
    },
    { key: '/operations', label: t.nav.operations, icon: <ToolOutlined /> },
    { key: '/machinery', label: t.nav.machinery, icon: <CarOutlined /> },
    { key: '/fleet', label: t.nav.fleet, icon: <EnvironmentOutlined /> },
    { key: '/notifications', label: t.notifications.title, icon: <BellOutlined /> },
    {
      key: 'economics-group',
      label: t.nav.economics,
      icon: <DollarOutlined />,
      children: economicsChildren,
    },
    {
      key: '/analytics',
      label: t.nav.analytics,
      icon: <LineChartOutlined />,
      children: analyticsChildren,
    },
    { key: '/profile', label: t.nav.profile, icon: <UserOutlined /> },
    ...(isAdmin
      ? [
          {
            key: 'settings-group',
            label: t.nav.settings,
            icon: <SettingOutlined />,
            children: [
              { key: '/settings/users', label: t.nav.users, icon: <TeamOutlined /> },
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

  const openKeys: string[] = [];
  if (warehouseChildren.some((c) => c.key === selectedKey)) openKeys.push('warehouses-group');
  if (economicsChildren.some((c) => c.key === selectedKey)) openKeys.push('economics-group');
  if (analyticsChildren.some((c) => c.key === selectedKey)) openKeys.push('/analytics');
  if (isAdmin && selectedKey === '/settings/users') openKeys.push('settings-group');

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      defaultOpenKeys={openKeys}
      items={menuItems}
      onClick={({ key }) => {
        if (!key.endsWith('-group') && key !== '/analytics') navigate(key);
      }}
      style={{ borderRight: 0 }}
    />
  );
}
