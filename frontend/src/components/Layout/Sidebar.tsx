import { Menu, Typography } from 'antd';
import {
  DashboardOutlined, AimOutlined, InboxOutlined, ToolOutlined, CarOutlined,
  DollarOutlined, LineChartOutlined, BarChartOutlined, ThunderboltOutlined,
  TeamOutlined, SwapOutlined, RiseOutlined, SettingOutlined,
  EnvironmentOutlined, FundOutlined, BankOutlined,
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
    { key: '/warehouses', label: t.nav.warehouses, icon: <BankOutlined />, style: { padding: '4px 8px' } },
    { key: '/warehouses/items', label: t.nav.warehouseItems, icon: <InboxOutlined />, style: { padding: '4px 8px' } },
    { key: '/warehouses/movements', label: t.nav.stockMovements, icon: <SwapOutlined />, style: { padding: '4px 8px' } },
    { key: '/warehouses/grain', label: t.nav.grainStorage, icon: <InboxOutlined />, style: { padding: '4px 8px' } },
  ];

  const economicsChildren = [
    { key: '/economics', label: t.nav.costs, icon: <DollarOutlined />, style: { padding: '4px 8px' } },
    { key: '/economics/pnl', label: t.nav.pnl, icon: <RiseOutlined />, style: { padding: '4px 8px' } },
    { key: '/economics/budget', label: t.nav.budget, icon: <FundOutlined />, style: { padding: '4px 8px' } },
  ];

  const analyticsChildren = [
    { key: '/analytics/resources', label: t.analytics.resourceConsumption, icon: <BarChartOutlined />, style: { padding: '4px 8px' } },
    { key: '/analytics/efficiency', label: t.analytics.fieldEfficiency, icon: <ThunderboltOutlined />, style: { padding: '4px 8px' } },
  ];

  const allLeafItems = [
    { key: '/' },
    { key: '/fields' },
    { key: '/operations' },
    { key: '/machinery' },
    { key: '/fleet' },
    ...warehouseChildren,
    ...economicsChildren,
    ...analyticsChildren,
    ...(isAdmin ? [{ key: '/settings/users' }] : []),
  ];

  const menuItems = [
    { key: '/', label: t.nav.dashboard, icon: <DashboardOutlined />, style: { padding: '4px 8px' } },
    { key: '/fields', label: t.nav.fields, icon: <AimOutlined />, style: { padding: '4px 8px' } },
    { key: '/machinery', label: t.nav.machinery, icon: <CarOutlined />, style: { padding: '4px 8px' } },
    {
      key: 'warehouses-group',
      label: t.nav.warehouses,
      icon: <InboxOutlined />,
      children: warehouseChildren,
    },
    { key: '/operations', label: t.nav.operations, icon: <ToolOutlined />, style: { padding: '4px 8px' } },
    { key: '/fleet', label: t.nav.fleet, icon: <EnvironmentOutlined />, style: { padding: '4px 8px' } },
    {
      key: 'economics-group',
      label: t.nav.economics,
      icon: <DollarOutlined />,
      children: economicsChildren,
    },
    {
      key: 'analytics-group',
      label: t.nav.analytics,
      icon: <LineChartOutlined />,
      children: analyticsChildren,
    },
    ...(isAdmin
      ? [
          {
            key: 'settings-group',
            label: t.nav.settings,
            icon: <SettingOutlined />,
            children: [
              { key: '/settings/users', label: t.nav.users, icon: <TeamOutlined />, style: { padding: '4px 8px' } },
            ],
          },
        ]
      : []),
  ];

  const groupKeys = new Set(['warehouses-group', 'economics-group', 'analytics-group', 'settings-group']);

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
  if (analyticsChildren.some((c) => c.key === selectedKey)) openKeys.push('analytics-group');
  if (isAdmin && selectedKey === '/settings/users') openKeys.push('settings-group');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={({ key }) => {
          if (!groupKeys.has(key)) navigate(key);
        }}
        style={{ borderRight: 0, flex: 1, overflowY: 'auto' }}
      />
      <div style={{ padding: '12px 20px', borderTop: '1px solid #1f2d42' }}>
        <Typography.Text style={{ fontSize: 11, color: '#4B5563', display: 'block' }}>
          AgroPlatform v1.0
        </Typography.Text>
        <Typography.Text style={{ fontSize: 10, color: '#374151' }}>
          {import.meta.env.MODE}
        </Typography.Text>
      </div>
    </div>
  );
}
