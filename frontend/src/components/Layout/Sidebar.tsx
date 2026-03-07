import { Menu } from 'antd';
import {
  DashboardOutlined,
  AimOutlined,
  InboxOutlined,
  ToolOutlined,
  CarOutlined,
  DollarOutlined,
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

  const allMenuItems = [
    { key: '/', label: t.nav.dashboard, icon: <DashboardOutlined />, roles: null },
    { key: '/fields', label: t.nav.fields, icon: <AimOutlined />, roles: null },
    { key: '/operations', label: t.nav.operations, icon: <ToolOutlined />, roles: ['Administrator', 'Manager', 'Agronomist', 'Director'] as AppRole[] },
    { key: '/machinery', label: t.nav.machinery, icon: <CarOutlined />, roles: ['Administrator', 'Manager', 'Agronomist', 'Director'] as AppRole[] },
    { key: '/warehouses', label: t.nav.warehouses, icon: <InboxOutlined />, roles: null },
    { key: '/economics', label: t.nav.economics, icon: <DollarOutlined />, roles: ['Administrator', 'Manager', 'Director'] as AppRole[] },
  ];

  const menuItems = allMenuItems
    .filter((item) => item.roles === null || hasRole(item.roles))
    .map(({ key, label, icon }) => ({ key, label, icon }));

  const selectedKey =
    menuItems
      .slice()
      .reverse()
      .find((item) => location.pathname.startsWith(item.key) || location.pathname === item.key)
      ?.key ?? '/';

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      style={{ borderRight: 0 }}
    />
  );
}
