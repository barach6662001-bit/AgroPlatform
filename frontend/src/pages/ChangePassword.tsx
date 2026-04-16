import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { changePassword } from '../api/auth';
import { useTranslation } from '../i18n';
import s from './ChangePassword.module.css';

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
        data.hasCompletedOnboarding,
        data.firstName,
        data.lastName,
        data.refreshToken
      );
      message.success(t.auth.passwordChanged);
      navigate('/dashboard');
    } catch {
      message.error(t.auth.passwordChangeError);
    }
  };

  return (
    <div
      className={s.flex_center_centered}
    >
      <div
        className={s.fullWidth}
      >
        <div className={s.textCenter}>
          <div className={s.text32}>🔒</div>
          <h2 className={s.text22}>
            {t.auth.changePasswordTitle}
          </h2>
          <p className={s.text14}>
            {t.auth.changePasswordSubtitle}
          </p>
          {email && (
            <p className={s.text13}>
              {email}
            </p>
          )}
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label={<span className={s.text12}>{t.auth.currentPassword}</span>}
            rules={[{ required: true, message: t.auth.enterCurrentPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined className={s.colored} />}
              placeholder={t.auth.currentPassword}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<span className={s.text12}>{t.auth.newPassword}</span>}
            rules={[
              { required: true, message: t.auth.enterNewPassword },
              { min: 8, message: t.auth.minPassword },
              { pattern: /[0-9]/, message: t.auth.passwordNeedsDigit },
              { pattern: /[a-z]/, message: t.auth.passwordNeedsLower },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className={s.colored} />}
              placeholder={t.auth.newPassword}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span className={s.text12}>{t.auth.confirmPassword}</span>}
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
              prefix={<LockOutlined className={s.colored} />}
              placeholder={t.auth.confirmPassword}
              size="large"
            />
          </Form.Item>

          <Form.Item className={s.spaced}>
            <Button type="primary" htmlType="submit" block size="large" className={s.text141}>
              {t.auth.changePasswordButton}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
