import { Button, Dropdown } from 'antd';
import { Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Sun, Moon, Search, LogOut } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import MobileBottomTabs from './MobileBottomTabs';
import NotificationBell from './NotificationBell';
import FarmSwitcher from './FarmSwitcher';
import Breadcrumbs from './Breadcrumbs';
import OfflineIndicator from '../OfflineIndicator';
import Logo from '../Logo';
import CommandPalette from '../CommandPalette';
import { PageTransition } from '../PageTransition';
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
      <div className={s.toolbarItem}>
        <img src={lang.flag} alt={lang.shortLabel} className={s.flagIcon} />
        <span>{lang.label}</span>
      </div>
    ),
  }));

  const userInitial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <div className={s.appShell}>
      {/* Sidebar — desktop and tablet */}
      {!isMobile && (
        <aside className={`${s.sidebar} ${sidebarCollapsed ? s.sidebarCollapsed : ''}`}>
          {/* Logo */}
          <div className={`${s.logoWrap} ${sidebarCollapsed ? s.logoWrapCollapsed : ''}`}>
            <Logo size={32} variant={sidebarCollapsed ? 'icon' : 'full'} />
          </div>

          {/* Navigation */}
          <div className={s.sidebarNav}>
            <Sidebar collapsed={sidebarCollapsed} />
          </div>

          {/* User info at bottom */}
          <div className={`${s.userSection} ${sidebarCollapsed ? s.userSectionCollapsed : ''}`}>
            <div className={s.userAvatar}>
              {userInitial}
            </div>
            {!sidebarCollapsed && (
              <div className={s.userMeta}>
                <div className={s.userName}>
                  {email}
                </div>
                <div className={s.userRole}>{role}</div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main area */}
      <div className={s.mainArea}>
        {/* Topbar */}
        <header className={s.topbar}>
          <div className={s.topbarLeft}>
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuIcon size={18} />}
                onClick={() => setDrawerOpen(true)}
                className={s.topbarBtn}
              />
            ) : (
              <Button
                type="text"
                icon={sidebarCollapsed
                  ? <PanelLeftOpen size={16} />
                  : <PanelLeftClose size={16} />
                }
                onClick={() => setSidebarCollapsed(prev => !prev)}
                className={s.topbarBtn}
              />
            )}
            <Breadcrumbs />
          </div>

          <div className={s.toolbarItem}>
            {!isMobile && (
              <button type="button" onClick={openSearch} className={s.searchTrigger}>
                <Search size={14} aria-hidden="true" />
                <span className={s.searchTriggerLabel}>{t.search.trigger}</span>
                <kbd className={s.kbdHint}>⌘K</kbd>
              </button>
            )}
            {isMobile && (
              <Button
                type="text"
                icon={<Search size={16} />}
                onClick={openSearch}
                className={s.topbarAction}
              />
            )}
            <FarmSwitcher />
            <OfflineIndicator />
            <div className={s.toolbarDivider} />
            <Dropdown
              menu={{
                items: langMenuItems,
                selectedKeys: [lang],
                onClick: ({ key }) => setLang(key as 'uk' | 'en'),
              }}
            >
              <Button
                type="text"
                className={s.topbarAction}
              >
                <img src={currentLang?.flag} alt={currentLang?.shortLabel} className={s.langFlag} />
                <span className={s.topbarLabel}>
                  {currentLang?.shortLabel}
                </span>
              </Button>
            </Dropdown>
            <Button
              type="text"
              icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              onClick={toggleTheme}
              className={s.topbarAction}
            />
            <NotificationBell />
            <div className={s.toolbarDivider} />
            <Button
              type="text"
              icon={<LogOut size={16} />}
              onClick={handleLogout}
              className={s.logoutBtn}
            >
              {!isMobile && t.auth.logout}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className={s.pageArea}>
          <div className="page-content">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {isMobile && <MobileBottomTabs onMoreClick={() => setDrawerOpen(true)} />}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
