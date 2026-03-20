import { Menu, Layout } from 'antd';
import { useState, useEffect } from 'react';
import {
  DashboardOutlined, AimOutlined, InboxOutlined, ToolOutlined, CarOutlined,
  DollarOutlined, LineChartOutlined, TeamOutlined, SettingOutlined,
  EnvironmentOutlined, BankOutlined, FireOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { useAuthStore } from '../../stores/authStore';

const { Sider } = Layout;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handler = () => setCollapsed(window.innerWidth < 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin } = useRole();
  const { email, role } = useAuthStore();
  const userInitial = email ? email.charAt(0).toUpperCase() : '?';

  const storageChildren = [
    { key: '/warehouses/items', label: t.nav.materials, style: { padding: '4px 8px' } },
    { key: '/warehouses/movements', label: t.nav.movements, style: { padding: '4px 8px' } },
  ];

  const financeChildren = [
    { key: '/economics', label: t.nav.costs, style: { padding: '4px 8px' } },
    { key: '/economics/pnl', label: t.nav.pnl, style: { padding: '4px 8px' } },
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
    <Sider
      collapsed={collapsed}
      width={220}
      collapsedWidth={64}
      trigger={null}
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #21262d',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(35,134,54,0.3)',
          }}>
            <span style={{ fontSize: 16 }}>🌿</span>
          </div>
          {!collapsed && (
            <div>
              <div style={{
                color: '#e6edf3',
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '-0.3px',
                lineHeight: 1.1,
              }}>
                Agro<span style={{ color: '#2ea043' }}>Tech</span>
              </div>
              <div style={{
                color: '#484f58',
                fontSize: 10,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                Farm Management
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={openKeys}
            items={menuItems}
            onClick={({ key }) => {
              if (!groupKeys.has(key)) navigate(key);
            }}
            style={{ borderRight: 0, flex: 1, overflowY: 'auto', background: 'transparent' }}
          />
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-disabled)', display: 'block' }}>
              {collapsed ? 'v1' : 'v1.0.0 · Agrotech Platform'}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>
              {import.meta.env.MODE}
            </span>
          </div>
        </div>

        {/* User info */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 28,
            height: 28,
            background: 'var(--accent-muted)',
            border: '1px solid var(--accent-border)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: 'var(--accent)',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {userInitial}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {email}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{role}</div>
            </div>
          )}
        </div>
      </div>
    </Sider>
  );
}
