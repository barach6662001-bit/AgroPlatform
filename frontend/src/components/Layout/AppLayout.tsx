import { Button, Dropdown } from 'antd';
import { LogoutOutlined, MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import NotificationBell from './NotificationBell';
import FarmSwitcher from './FarmSwitcher';
import OfflineIndicator from '../OfflineIndicator';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation, languages } from '../../i18n';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < TABLET_BREAKPOINT);
  const { email, role, logout, tenantId } = useAuthStore();
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();
  const queryClient = useQueryClient();
  // Tracks whether the component has mounted; initial value is undefined so we skip
  // invalidation on the first render and only react to real farm-switch events.
  const prevTenantIdRef = useRef<string | null | undefined>(undefined);

  // Invalidate all cached queries when the active farm (tenant) changes so that
  // stale data from the previous farm is never shown to the user.
  useEffect(() => {
    if (prevTenantIdRef.current !== undefined && prevTenantIdRef.current !== tenantId) {
      queryClient.invalidateQueries();
    }
    prevTenantIdRef.current = tenantId;
  }, [tenantId, queryClient]);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const h = () => setSidebarCollapsed(window.innerWidth < TABLET_BREAKPOINT);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
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

  const userInitial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-app)',
      overflow: 'hidden',
    }}>
      {/* Sidebar — desktop and tablet */}
      {!isMobile && (
        <aside style={{
          width: sidebarCollapsed ? 64 : 220,
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.2s ease',
        }}>
          {/* Logo */}
          <div style={{
            padding: sidebarCollapsed ? '16px 0' : '16px 20px',
            borderBottom: '1px solid #21262d',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
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
            {!sidebarCollapsed && (
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
            <Sidebar collapsed={sidebarCollapsed} />
          </div>

          {/* User info at bottom */}
          <div style={{
            padding: sidebarCollapsed ? '12px 0' : '12px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
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
            {!sidebarCollapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {email}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{role}</div>
              </div>
            )}
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
            <Button
              type="text"
              icon={sidebarCollapsed
                ? <MenuUnfoldOutlined style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
                : <MenuFoldOutlined style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
              }
              onClick={() => setSidebarCollapsed(prev => !prev)}
              style={{ padding: '4px 8px', height: 'auto' }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FarmSwitcher />
            <OfflineIndicator />
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
