import { useState } from 'react';
import { Card, Input, Button, Alert, Typography, Space, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { mfaVerify } from '../../api/mfa';
import { useTranslation } from '../../i18n';

const { Title, Paragraph } = Typography;

/**
 * MFA 2nd-factor challenge. Reached after a login where the server returned
 * <code>mfaRequired=true</code> + an <code>mfa_pending</code> token.
 */
export default function MfaVerify() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mfaPendingToken = useAuthStore((s) => s.mfaPendingToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [mode, setMode] = useState<'totp' | 'backup'>('totp');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!mfaPendingToken) {
    // No pending session — the user probably came here directly; send them back to login.
    navigate('/login', { replace: true });
    return null;
  }

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await mfaVerify({
        mfaPendingToken,
        code: mode === 'totp' ? code.trim() : undefined,
        backupCode: mode === 'backup' ? backupCode.trim() : undefined,
      });
      setAuth(
        data.token, data.email, data.role, data.tenantId,
        data.requirePasswordChange, data.hasCompletedOnboarding,
        data.firstName, data.lastName, data.refreshToken,
        data.isSuperAdmin ?? false,
      );
      navigate(data.requirePasswordChange ? '/change-password' : '/');
    } catch {
      setError(t.mfa.invalidCode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 48, maxWidth: 480, margin: '0 auto' }}>
      <Card>
        <Title level={3}>{t.mfa.verifyTitle}</Title>
        <Paragraph>{t.mfa.verifyDescription}</Paragraph>
        <Tabs
          activeKey={mode}
          onChange={(k) => setMode(k as 'totp' | 'backup')}
          items={[
            {
              key: 'totp',
              label: t.mfa.codeTabTotp,
              children: (
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="123456"
                    value={code}
                    maxLength={6}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    onPressEnter={submit}
                  />
                  <Button
                    type="primary"
                    onClick={submit}
                    loading={loading}
                    disabled={code.length !== 6}
                  >
                    {t.mfa.verify}
                  </Button>
                </Space.Compact>
              ),
            },
            {
              key: 'backup',
              label: t.mfa.codeTabBackup,
              children: (
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="XXXXXXXX"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    onPressEnter={submit}
                  />
                  <Button type="primary" onClick={submit} loading={loading} disabled={!backupCode}>
                    {t.mfa.verify}
                  </Button>
                </Space.Compact>
              ),
            },
          ]}
        />
        {error && <Alert style={{ marginTop: 16 }} type="error" message={error} />}
      </Card>
    </div>
  );
}
