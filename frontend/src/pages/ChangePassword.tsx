import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { changePassword } from '../api/auth';
import { useTranslation } from '../i18n';

export default function ChangePassword() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const email = useAuthStore((s) => s.email);
  const { t } = useTranslation();

  const onFinish = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      const data = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setAuth(
        data.token,
        data.email,
        data.role,
        data.tenantId,
        data.requirePasswordChange,
        data.firstName,
        data.lastName
      );
      message.success(t.auth.passwordChanged);
      navigate('/');
    } catch {
      message.error(t.auth.passwordChangeError);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '40px 48px',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
          <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 22, fontWeight: 700 }}>
            {t.auth.changePasswordTitle}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
            {t.auth.changePasswordSubtitle}
          </p>
          {email && (
            <p style={{ margin: '8px 0 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
              {email}
            </p>
          )}
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label={<span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>{t.auth.currentPassword}</span>}
            rules={[{ required: true, message: t.auth.enterCurrentPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder={t.auth.currentPassword}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>{t.auth.newPassword}</span>}
            rules={[
              { required: true, message: t.auth.enterNewPassword },
              { min: 8, message: t.auth.minPassword },
              { pattern: /[0-9]/, message: t.auth.passwordNeedsDigit },
              { pattern: /[a-z]/, message: t.auth.passwordNeedsLower },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder={t.auth.newPassword}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>{t.auth.confirmPassword}</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t.auth.enterConfirmPassword },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error(t.auth.passwordsDoNotMatch));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder={t.auth.confirmPassword}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" style={{ height: 40, fontSize: 14 }}>
              {t.auth.changePasswordButton}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
