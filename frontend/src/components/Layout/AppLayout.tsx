import { Layout, Button, Space, Typography, Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../i18n';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { email, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const langMenuItems = [
    { key: 'uk', label: '🇺🇦 Українська' },
    { key: 'en', label: '🇬🇧 English' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{ background: '#0F172A' }}
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
      <Layout>
        <Header
          style={{
            background: '#FFFFFF',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
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
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0D9488' }} />
            <Typography.Text strong>{email}</Typography.Text>
            {role && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                ({role})
              </Typography.Text>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
            >
              {t.auth.logout}
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px', background: '#FFFFFF', padding: 24, borderRadius: 8, minHeight: 280, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
