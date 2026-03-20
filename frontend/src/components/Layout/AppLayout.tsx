import { Button, Dropdown } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import NotificationBell from './NotificationBell';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation, languages } from '../../i18n';

const MOBILE_BREAKPOINT = 768;

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const { logout } = useAuthStore();
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

  const currentLang = languages.find(l => l.code === lang);
  const langMenuItems = languages.map(lang => ({
    key: lang.code,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{lang.flag}</span>
        <span>{lang.label}</span>
      </div>
    ),
  }));

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-app)',
      overflow: 'hidden',
    }}>
      {/* Sidebar — desktop/tablet only */}
      {!isMobile && <Sidebar />}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 56,
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: 12,
        }}>
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 18, color: 'var(--text-secondary)' }} />}
              onClick={() => setDrawerOpen(true)}
              style={{ padding: '4px 8px', height: 'auto' }}
            />
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dropdown
              menu={{
                items: langMenuItems,
                selectedKeys: [lang],
                onClick: ({ key }) => setLang(key as 'uk' | 'en'),
              }}
            >
              <Button
                type="text"
                style={{ color: '#8b949e', padding: '4px 8px', height: 32 }}
              >
                <span style={{ fontSize: 16, marginRight: 4 }}>
                  {currentLang?.flag}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {currentLang?.shortLabel}
                </span>
              </Button>
            </Dropdown>
            <NotificationBell />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: 'var(--text-secondary)', fontSize: 13, height: 32 }}
            >
              {!isMobile && t.auth.logout}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px 28px',
        }}>
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
