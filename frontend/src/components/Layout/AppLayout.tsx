import { Button, Dropdown } from 'antd';
import { Menu as MenuIcon, Sun, Moon, Search, LogOut } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/shell/sidebar';
import MobileDrawer from './MobileDrawer';
import NotificationBell from './NotificationBell';
import FarmSwitcher from './FarmSwitcher';
import OfflineIndicator from '../OfflineIndicator';
import CommandPalette from '../CommandPalette';
import { PageTransition } from '../PageTransition';
import { useAuthStore } from '../../stores/authStore';
import { revokeRefreshToken } from '../../api/auth';
import { useThemeStore } from '../../stores/themeStore';
import { useTranslation, languages } from '../../i18n';
import s from './AppLayout.module.css';

const MOBILE_BREAKPOINT = 640;

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const { logout, tenantId, refreshToken } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();
  const queryClient = useQueryClient();
  const prevTenantIdRef = useRef<string | null | undefined>(undefined);

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

  return (
    <div className={s.appShell}>
      {/* Sidebar — desktop and tablet, new shadcn version */}
      {!isMobile && (
        <div className="hidden md:flex">
          <Sidebar />
        </div>
      )}

      {/* Main area */}
      <div className={s.mainArea}>
        {/* Topbar */}
        <header className={s.topbar}>
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuIcon size={18} />}
              onClick={() => setDrawerOpen(true)}
              className={s.topbarBtn}
            />
          ) : null}

          <div className={s.toolbarItem}>
            <Button
              type="text"
              icon={<Search size={16} />}
              onClick={openSearch}
              className={s.topbarAction}
              style={{ width: 'auto' }}
            >
              {!isMobile && <span className={s.topbarLabel}>{t.search.trigger} <kbd className={s.kbdHint}>⌘K</kbd></span>}
            </Button>
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
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
