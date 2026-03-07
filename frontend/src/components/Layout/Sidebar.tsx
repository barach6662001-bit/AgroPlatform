import { Menu } from 'antd';
import {
  DashboardOutlined,
  AimOutlined,
  InboxOutlined,
  ToolOutlined,
  CarOutlined,
  DollarOutlined,
  BarChartOutlined,
  FireOutlined,
  FundOutlined,
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
    {
      key: '/analytics',
      label: t.nav.analytics,
      icon: <BarChartOutlined />,
      children: [
        { key: '/analytics/resources', label: t.nav.resourceConsumption, icon: <FireOutlined /> },
        { key: '/analytics/fields', label: t.nav.fieldEfficiency, icon: <FundOutlined /> },
      ],
    },
  ];

  const flatKeys = [
    '/',
    '/fields',
    '/warehouses',
    '/operations',
    '/machinery',
    '/economics',
    '/analytics/resources',
    '/analytics/fields',
  ];

  const selectedKey =
    flatKeys
      .slice()
      .reverse()
      .find((key) => location.pathname === key || (key !== '/' && location.pathname.startsWith(key))) ?? '/';

  const openKeys = location.pathname.startsWith('/analytics') ? ['/analytics'] : [];

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
