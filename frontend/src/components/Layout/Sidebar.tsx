import { Menu } from 'antd';
import {
  DashboardOutlined,
  AimOutlined,
  InboxOutlined,
  ToolOutlined,
  CarOutlined,
  DollarOutlined,
  LineChartOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import type { AppRole } from '../../hooks/useRole';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { hasRole } = useRole();

  const flatItems = [
    { key: '/', label: t.nav.dashboard, icon: <DashboardOutlined /> },
    { key: '/fields', label: t.nav.fields, icon: <AimOutlined /> },
    { key: '/warehouses', label: t.nav.warehouses, icon: <InboxOutlined /> },
    { key: '/operations', label: t.nav.operations, icon: <ToolOutlined /> },
    { key: '/machinery', label: t.nav.machinery, icon: <CarOutlined /> },
    { key: '/economics', label: t.nav.economics, icon: <DollarOutlined /> },
  ];

  const analyticsChildren = [
    { key: '/analytics/resources', label: t.analytics.resourceConsumption, icon: <BarChartOutlined /> },
    { key: '/analytics/efficiency', label: t.analytics.fieldEfficiency, icon: <ThunderboltOutlined /> },
  ];

  const menuItems = [
    ...flatItems,
    {
      key: '/analytics',
      label: t.nav.analytics,
      icon: <LineChartOutlined />,
      children: analyticsChildren,
    },
  ];

  const selectedKey =
    [...flatItems, ...analyticsChildren]
      .slice()
      .reverse()
      .find((item) => location.pathname === item.key || (item.key !== '/' && location.pathname.startsWith(item.key)))
      ?.key ?? '/';

  const openKeys = analyticsChildren.some((c) => c.key === selectedKey) ? ['/analytics'] : [];

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      defaultOpenKeys={openKeys}
      items={menuItems}
      onClick={({ key }) => {
        if (key !== '/analytics') navigate(key);
      }}
      style={{ borderRight: 0 }}
    />
  );
}
