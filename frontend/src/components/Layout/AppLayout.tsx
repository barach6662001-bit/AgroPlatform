import { Layout, Button, Space, Typography, Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import NotificationBell from './NotificationBell';
import Logo from '../Logo';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../i18n';

const { Header, Sider, Content } = Layout;

const MOBILE_BREAKPOINT = 768;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const { email, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const langMenuItems = [
    { key: 'uk', label: '🇺🇦 Українська' },
    { key: 'en', label: '🇬🇧 English' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0f0d' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="dark"
          style={{
            background: 'linear-gradient(180deg, #0d1510 0%, #0a0f0d 100%)',
            borderRight: '1px solid #1f2d24',
          }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '0 26px' : '0 20px',
              borderBottom: '1px solid #1f2d24',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #16a34a, #4ade80)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(22,163,74,0.4)',
              flexShrink: 0,
            }}>
              <Logo size={18} />
            </div>
            {!collapsed && (
              <Typography.Text
                strong
                style={{
                  color: '#f0fdf4',
                  fontSize: 16,
                  letterSpacing: '-0.3px',
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                }}
              >
                АгроТех
              </Typography.Text>
            )}
          </div>
          <Sidebar />
        </Sider>
      )}
      <Layout>
        <Header
          style={{
            background: '#0a0f0d',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1f2d24',
            height: 64,
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: '#E5E7EB' }} />}
              onClick={() => setDrawerOpen(true)}
              style={{ padding: '4px 8px' }}
            />
          )}
          {!isMobile && <div />}
          <Space size={4}>
            <Dropdown
              menu={{
                items: langMenuItems,
                selectedKeys: [lang],
                onClick: ({ key }) => setLang(key as 'uk' | 'en'),
              }}
            >
              <Button
                type="text"
                style={{ fontWeight: 600, color: '#86efac', fontSize: 13 }}
              >
                {lang === 'uk' ? '🇺🇦 UA' : '🇬🇧 EN'}
              </Button>
            </Dropdown>
            <NotificationBell />
            <Avatar
              icon={<UserOutlined />}
              size={32}
              style={{ backgroundColor: '#16a34a', cursor: 'pointer', boxShadow: '0 0 10px rgba(22,163,74,0.3)' }}
            />
            {!isMobile && (
              <>
                <Typography.Text strong style={{ color: '#f0fdf4', fontSize: 13 }}>{email}</Typography.Text>
                {role && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    ({role})
                  </Typography.Text>
                )}
              </>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
              style={{ fontSize: 13 }}
            >
              {!isMobile && t.auth.logout}
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '0', padding: '24px 28px', background: 'transparent', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Layout>
  );
}
