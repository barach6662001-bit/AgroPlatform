import { isPublicDemoMode } from '../utils/publicDemo';
import { useTranslation } from '../i18n';

/**
 * Amber banner shown at the top of the app when the site is running in
 * public demo mode (everyone sees the app as the demo user, no login
 * required). Renders `null` when demo mode is off.
 */
export default function PublicDemoBanner() {
  const { t } = useTranslation();
  if (!isPublicDemoMode) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: '#b45309', // amber-700
        color: '#ffffff',
        padding: '6px 16px',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 0.3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {t.publicDemo?.banner ?? 'Demo mode — login is temporarily disabled'}
    </div>
  );
}
