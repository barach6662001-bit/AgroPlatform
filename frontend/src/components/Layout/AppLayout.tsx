import { Layout, Button, Space, Typography, Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import NotificationBell from './NotificationBell';
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
    <Layout style={{ minHeight: '100vh', background: '#0D1117' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="dark"
          style={{ background: '#0D1117' }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
            }}
          >
            {!collapsed && (
              <Typography.Text
                strong
                style={{ color: '#2DD4BF', fontSize: 18, whiteSpace: 'nowrap' }}
              >
                {t.app.name}
              </Typography.Text>
            )}
            {collapsed && (
              <Typography.Text style={{ color: '#2DD4BF', fontSize: 20 }}>
                🌾
              </Typography.Text>
            )}
          </div>
          <Sidebar />
        </Sider>
      )}
      <Layout>
        <Header
          style={{
            background: '#161B22',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #30363D',
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: '#E6EDF3' }} />}
              onClick={() => setDrawerOpen(true)}
              style={{ padding: '4px 8px' }}
            />
          )}
          {!isMobile && <div />}
          <Space>
            <Dropdown
              menu={{
                items: langMenuItems,
                selectedKeys: [lang],
                onClick: ({ key }) => setLang(key as 'uk' | 'en'),
              }}
            >
              <Button type="text" style={{ fontWeight: 600 }}>
                {lang === 'uk' ? '🇺🇦 UA' : '🇬🇧 EN'}
              </Button>
            </Dropdown>
            <NotificationBell />
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#238636' }} />
            {!isMobile && (
              <>
                <Typography.Text strong style={{ color: '#E6EDF3' }}>{email}</Typography.Text>
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
            >
              {!isMobile && t.auth.logout}
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px', background: '#161B22', padding: 24, borderRadius: 8, minHeight: 280, boxShadow: 'none' }}>
          <Outlet />
        </Content>
      </Layout>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Layout>
  );
}
