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

const menuItems = [
  { key: '/', label: 'Главная', icon: <DashboardOutlined /> },
  { key: '/fields', label: 'Поля', icon: <AimOutlined /> },
  { key: '/warehouses', label: 'Склад', icon: <InboxOutlined /> },
  { key: '/operations', label: 'Операции', icon: <ToolOutlined /> },
  { key: '/machinery', label: 'Техника', icon: <CarOutlined /> },
  { key: '/economics', label: 'Экономика', icon: <DollarOutlined /> },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
