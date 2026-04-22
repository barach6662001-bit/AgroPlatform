import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, ClipboardList, Warehouse, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '../../i18n';
import s from './MobileBottomTabs.module.css';

interface Props {
  onMoreClick: () => void;
}

/**
 * Primary mobile navigation — 5 fixed bottom tabs. Visible only on
 * screens narrower than 768px. The "More" tab opens the existing
 * MobileDrawer for secondary destinations (Settings, Profile, Logout, …).
 *
 * All route hrefs correspond to routes registered in App.tsx.
 */
export default function MobileBottomTabs({ onMoreClick }: Props) {
  const { t } = useTranslation();
  const n = t.nav;

  return (
    <nav className={s.tabs} aria-label={t.app.brandName}>
      <NavLink to="/dashboard" className={({ isActive }) => `${s.tab} ${isActive ? s.active : ''}`}>
        <LayoutDashboard size={20} strokeWidth={1.6} />
        <span className={s.label}>{n.dashboard}</span>
      </NavLink>
      <NavLink to="/fields" className={({ isActive }) => `${s.tab} ${isActive ? s.active : ''}`}>
        <Map size={20} strokeWidth={1.6} />
        <span className={s.label}>{n.fields}</span>
      </NavLink>
      <NavLink to="/operations" className={({ isActive }) => `${s.tab} ${isActive ? s.active : ''}`}>
        <ClipboardList size={20} strokeWidth={1.6} />
        <span className={s.label}>{n.operations}</span>
      </NavLink>
      <NavLink to="/storage" className={({ isActive }) => `${s.tab} ${isActive ? s.active : ''}`}>
        <Warehouse size={20} strokeWidth={1.6} />
        <span className={s.label}>{n.storage}</span>
      </NavLink>
      <button type="button" onClick={onMoreClick} className={s.tab}>
        <MoreHorizontal size={20} strokeWidth={1.6} />
        <span className={s.label}>{n.more}</span>
      </button>
    </nav>
  );
}
