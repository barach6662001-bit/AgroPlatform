import { useTranslation } from '../i18n';
import { isBypassEnabled } from '../mocks/isBypassEnabled';

/**
 * Red strip shown at the top of the app when the dev auth bypass is active.
 * Renders `null` in production and whenever `VITE_BYPASS_AUTH` is not `true`,
 * so it has zero visual/perf impact on normal builds.
 */
export default function DevBypassBanner() {
  const { t } = useTranslation();
  if (!isBypassEnabled) return null;

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
        background: '#b91c1c',
        color: '#ffffff',
        padding: '6px 16px',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 0.3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      🔧 {t.devBypass.banner}
    </div>
  );
}
