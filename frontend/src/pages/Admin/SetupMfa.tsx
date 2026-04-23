import { useEffect, useState } from 'react';
import { Button, Card, Input, Alert, Space, Typography, List, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { mfaSetup, mfaEnable } from '../../api/mfa';
import { useTranslation } from '../../i18n';

const { Title, Paragraph, Text } = Typography;

/**
 * Super-admin MFA enrollment. Shown automatically after login for super-admins
 * who have not yet completed TOTP setup. After the QR is scanned and the
 * 6-digit code is verified, the server returns 10 plaintext backup codes —
 * they are displayed **exactly once** and cannot be retrieved again.
 */
export default function SetupMfa() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUri, setQrDataUri] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await mfaSetup();
        if (cancelled) return;
        setSecret(resp.secret);
        const dataUri = await QRCode.toDataURL(resp.otpAuthUri, { margin: 2, width: 220 });
        if (!cancelled) setQrDataUri(dataUri);
      } catch {
        if (!cancelled) setError(t.mfa.setupError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t.mfa.setupError]);

  const submit = async () => {
    setError(null);
    setVerifying(true);
    try {
      const resp = await mfaEnable(code.trim());
      setBackupCodes(resp.backupCodes);
    } catch {
      setError(t.mfa.invalidCode);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (backupCodes) {
    return (
      <div style={{ padding: 48, maxWidth: 640, margin: '0 auto' }}>
        <Card>
          <Title level={3}>{t.mfa.backupCodesTitle}</Title>
          <Paragraph>{t.mfa.backupCodesIntro}</Paragraph>
          <List
            size="small"
            bordered
            dataSource={backupCodes}
            renderItem={(code) => (
              <List.Item>
                <Text code copyable>
                  {code}
                </Text>
              </List.Item>
            )}
          />
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => navigate('/admin/tenants')}>
              {t.mfa.continue}
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 48, maxWidth: 640, margin: '0 auto' }}>
      <Card>
        <Title level={3}>{t.mfa.setupTitle}</Title>
        <Paragraph>{t.mfa.setupDescription}</Paragraph>
        {qrDataUri && (
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <img src={qrDataUri} alt="TOTP QR" width={220} height={220} />
          </div>
        )}
        {secret && (
          <Paragraph>
            <Text type="secondary">{t.mfa.manualSecretLabel}: </Text>
            <Text code copyable>{secret}</Text>
          </Paragraph>
        )}
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="123456"
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            onPressEnter={submit}
          />
          <Button type="primary" onClick={submit} loading={verifying} disabled={code.length !== 6}>
            {t.mfa.verify}
          </Button>
        </Space.Compact>
        {error && <Alert style={{ marginTop: 16 }} type="error" message={error} />}
      </Card>
    </div>
  );
}
