import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardV2 from './DashboardV2';
import { mockDashboardV2, mockFieldsV2, mockOperationsV2 } from '../../data/mockDashboard';
import s from './DashboardV2.module.css';

/**
 * Standalone DEV-only preview route for the v2 dashboard.
 *
 * Mounted at /preview/dashboard-v2.  Bypasses auth and the AppLayout
 * shell so the design can be reviewed in isolation, exactly as it will
 * eventually look inside the real /dashboard route.  In a production
 * build (`import.meta.env.DEV === false`) the route 404s back to /.
 */
export default function DashboardV2PreviewPage() {
  // Honour ?scrollTo=<px> for screenshot capture at specific Y offsets.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const y = Number(params.get('scrollTo'));
    if (Number.isFinite(y) && y > 0) {
      // Wait one frame so framer-motion has populated the DOM.
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
    }
  }, []);

  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <div className={s.previewBanner}>
        ⚠ Preview v2 — DEV only, not wired to /dashboard
      </div>
      <DashboardV2
        data={mockDashboardV2}
        fields={mockFieldsV2}
        operations={mockOperationsV2}
        weather={{ tempC: 18, condition: 'clear', location: 'Київ' }}
      />
    </>
  );
}
