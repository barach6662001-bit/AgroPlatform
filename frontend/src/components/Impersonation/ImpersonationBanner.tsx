import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { endImpersonation } from '../../api/admin';
import { useTranslation } from '../../i18n';

/**
 * Persistent red banner shown while a super-admin is impersonating another user
 * (PR #614). Per spec it is NOT closable / dismissable, sits above every other
 * UI layer (z-index 9999), spans the full viewport width and exposes a single
 * "exit" action that calls /api/admin/impersonate/end and restores the
 * pre-impersonation super-admin token.
 */
export default function ImpersonationBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const impersonation = useAuthStore((s) => s.impersonation);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearImpersonation = useAuthStore((s) => s.clearImpersonation);

  const [now, setNow] = useState<number>(() => Date.now());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!impersonation) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [impersonation]);

  if (!impersonation) return null;

  const expiresAt = new Date(impersonation.expiresAtUtc).getTime();
  const remainingMs = Math.max(0, expiresAt - now);
  const totalSec = Math.floor(remainingMs / 1000);
  const mm = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const ss = (totalSec % 60).toString().padStart(2, '0');

  const onExit = async () => {
    setBusy(true);
    try {
      // Best-effort server-side end. Even if it fails (e.g. token already
      // expired) we still locally restore the original super-admin token.
      try {
        await endImpersonation();
      } catch {
        /* ignore — local restore below is the source of truth */
      }
      setAuth(
        impersonation.originalToken,
        impersonation.originalEmail,
        impersonation.originalRole,
        impersonation.originalTenantId,
        false,
        true,
        impersonation.originalFirstName,
        impersonation.originalLastName,
        undefined,
        true,
      );
      clearImpersonation();
      navigate('/admin/users');
    } catch {
      message.error(t.admin.bannerExitFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100vw',
        zIndex: 9999,
        background: '#b91c1c',
        color: '#fff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <strong style={{ letterSpacing: 0.3 }}>
          {t.admin.bannerActiveAs}: {impersonation.targetEmail} ({impersonation.targetTenantName})
        </strong>
        <span style={{ opacity: 0.9 }}>
          {t.admin.bannerOriginal}: {impersonation.originalEmail}
        </span>
        <span style={{ opacity: 0.9 }}>
          {t.admin.bannerExpiresIn}: {mm}:{ss}
        </span>
      </div>
      <Button danger type="primary" size="small" loading={busy} onClick={onExit}>
        {t.admin.bannerExit}
      </Button>
    </div>
  );
}
