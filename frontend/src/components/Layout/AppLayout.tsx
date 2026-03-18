import { Button, Dropdown } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import NotificationBell from './NotificationBell';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../i18n';

const MOBILE_BREAKPOINT = 768;

export default function AppLayout() {
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

  const userInitial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-app)',
      overflow: 'hidden',
    }}>
      {/* Sidebar — desktop only */}
      {!isMobile && (
        <aside style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Logo */}
          <div style={{
            padding: '0 16px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{
              width: 30,
              height: 30,
              background: 'var(--accent)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-glow)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: '-0.3px',
            }}>
              АгроТех
            </span>
          </div>

          {/* Navigation */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
            <Sidebar />
          </div>

          {/* User info at bottom */}
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
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {email}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{role}</div>
            </div>
          </div>
        </aside>
      )}

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
                style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12, height: 32, padding: '0 10px' }}
              >
                {lang === 'uk' ? '🇺🇦 UA' : '🇬🇧 EN'}
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
