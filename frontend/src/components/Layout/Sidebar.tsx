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

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { key: '/', label: t.nav.dashboard, icon: <DashboardOutlined /> },
    { key: '/fields', label: t.nav.fields, icon: <AimOutlined /> },
    { key: '/warehouses', label: t.nav.warehouses, icon: <InboxOutlined /> },
    { key: '/operations', label: t.nav.operations, icon: <ToolOutlined /> },
    { key: '/machinery', label: t.nav.machinery, icon: <CarOutlined /> },
    { key: '/economics', label: t.nav.economics, icon: <DollarOutlined /> },
  ];

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
