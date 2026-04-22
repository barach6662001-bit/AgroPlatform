import { useEffect, useRef, useState } from 'react';
import { login as loginApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import {
  isPublicDemoMode,
  publicDemoEmail,
  publicDemoPassword,
} from '../utils/publicDemo';

/**
 * Auto-logs the visitor in as the demo user when {@link isPublicDemoMode}
 * is enabled and there is no existing session. Runs exactly once per
 * page load.
 *
 * Exposes `ready` so the surrounding router can hold off on rendering
 * protected routes until the token is in place — this avoids a
 * half-second flash of `/login` on first visit.
 */
export function usePublicDemoAutoLogin(): { ready: boolean; failed: boolean } {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const didRun = useRef(false);

  const [ready, setReady] = useState(!isPublicDemoMode || isAuthenticated);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isPublicDemoMode) return;
    if (isAuthenticated) { setReady(true); return; }
    // If the visitor explicitly lands on /login or /landing, let them see
    // those pages instead of silently auto-logging them in as demo. This
    // keeps the real login flow reachable even when public demo mode is on.
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/login' || p === '/landing') { setReady(true); return; }
    }
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        const data = await loginApi({
          email: publicDemoEmail,
          password: publicDemoPassword,
        });
        setAuth(
          data.token,
          data.email,
          data.role,
          data.tenantId,
          data.requirePasswordChange,
          data.hasCompletedOnboarding,
          data.firstName,
          data.lastName,
          data.refreshToken,
        );
        setReady(true);
      } catch {
        // Backend unreachable or demo user missing — fall back to the normal
        // login screen rather than spinning forever.
        setFailed(true);
        setReady(true);
      }
    })();
  }, [isAuthenticated, setAuth]);

  return { ready, failed };
}
