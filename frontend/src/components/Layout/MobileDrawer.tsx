import { Drawer, Button } from 'antd';
import { User, Settings, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { revokeRefreshToken } from '../../api/auth';
import { useTranslation } from '../../i18n';
import s from './MobileDrawer.module.css';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Secondary mobile navigation — Profile / Notifications / Settings / Logout.
 * Primary nav lives in MobileBottomTabs; this drawer opens from the "More"
 * bottom tab. Every item also closes the drawer.
 */
export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { email, role, logout, refreshToken } = useAuthStore();

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    if (refreshToken) revokeRefreshToken({ refreshToken }).catch(() => {});
    logout();
    onClose();
    navigate('/login');
  };

  const userInitial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <Drawer
      title={t.app.brandName}
      placement="right"
      open={open}
      onClose={onClose}
      width={260}
      styles={{
        header: { background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' },
        body:   { background: 'var(--bg-surface)', padding: 0 },
        mask:   { background: 'rgba(0,0,0,0.6)' },
      }}
      closeIcon={<span className={s.colored}>✕</span>}
    >
      <div className={s.userCard}>
        <div className={s.avatar}>{userInitial}</div>
        <div className={s.userMeta}>
          <div className={s.userName}>{email}</div>
          <div className={s.userRole}>{role}</div>
        </div>
      </div>
      <nav className={s.menu}>
        <Button type="text" icon={<User size={16} />} onClick={() => go('/profile')} className={s.item}>
          {t.nav.profile}
        </Button>
        <Button type="text" icon={<Bell size={16} />} onClick={() => go('/notifications')} className={s.item}>
          {t.notifications?.title ?? t.nav.profile}
        </Button>
        <Button type="text" icon={<Settings size={16} />} onClick={() => go('/settings')} className={s.item}>
          {t.nav.settings}
        </Button>
        <div className={s.divider} />
        <Button type="text" icon={<LogOut size={16} />} onClick={handleLogout} className={`${s.item} ${s.danger}`}>
          {t.auth.logout}
        </Button>
      </nav>
    </Drawer>
  );
}
