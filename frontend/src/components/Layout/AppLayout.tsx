import { Button, Dropdown } from 'antd';
import { LogoutOutlined, MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SunOutlined, MoonOutlined, SearchOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import NotificationBell from './NotificationBell';
import FarmSwitcher from './FarmSwitcher';
import OfflineIndicator from '../OfflineIndicator';
import Logo from '../Logo';
import CommandPalette from '../CommandPalette';
import { useAuthStore } from '../../stores/authStore';
import { revokeRefreshToken } from '../../api/auth';
import { useThemeStore } from '../../stores/themeStore';
import { useTranslation, languages } from '../../i18n';
import s from './AppLayout.module.css';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < TABLET_BREAKPOINT);
  const { email, role, logout, tenantId, refreshToken } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
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
    if (refreshToken) {
      revokeRefreshToken({ refreshToken }).catch(() => {});
    }
    logout();
    navigate('/login');
  };

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const currentLang = languages.find(l => l.code === lang);
  const langMenuItems = languages.map(lang => ({
    key: lang.code,
    label: (
      <div className={s.flex_center}>
        <img src={lang.flag} alt={lang.shortLabel} className={s.bordered} />
        <span>{lang.label}</span>
      </div>
    ),
  }));

  const userInitial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <div className={s.flex}>
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
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}>
            <Logo size={32} variant={sidebarCollapsed ? 'icon' : 'full'} />
          </div>

          {/* Navigation */}
          <div className={s.padded}>
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
            <div className={s.flex_center_centered}>
              {userInitial}
            </div>
            {!sidebarCollapsed && (
              <div className={s.block8}>
                <div className={s.text12}>
                  {email}
                </div>
                <div className={s.text11}>{role}</div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main area */}
      <div className={s.flex_col}>
        {/* Topbar */}
        <header className={s.flex_center_between}>
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined className={s.text18} />}
              onClick={() => setDrawerOpen(true)}
              className={s.padded1}
            />
          ) : (
            <Button
              type="text"
              icon={sidebarCollapsed
                ? <MenuUnfoldOutlined className={s.text16} />
                : <MenuFoldOutlined className={s.text16} />
              }
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className={s.padded1}
            />
          )}

          <div className={s.flex_center}>
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={openSearch}
              className={s.padded2}
            >
              {!isMobile && <span className={s.text13}>{t.search.trigger} <kbd style={{ opacity: 0.5, fontSize: 11 }}>⌘K</kbd></span>}
            </Button>
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
                className={s.padded2}
              >
                <img src={currentLang?.flag} alt={currentLang?.shortLabel} className={s.spaced} />
                <span className={s.text13}>
                  {currentLang?.shortLabel}
                </span>
              </Button>
            </Dropdown>
            <Button
              type="text"
              icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              className={s.padded2}
            />
            <NotificationBell />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className={s.text131}
            >
              {!isMobile && t.auth.logout}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className={s.padded3}>
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
