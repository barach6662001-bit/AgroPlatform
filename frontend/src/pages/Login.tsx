import { Form, Input, Button, Dropdown, message } from 'antd';
import { User, Lock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';
import { useTranslation, languages } from '../i18n';
import Logo from '../components/Logo';
import s from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t, lang, setLang } = useTranslation();
  const [demoLoading, setDemoLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const data = await login(values);
      setAuth(data.token, data.email, data.role, data.tenantId, data.requirePasswordChange, data.hasCompletedOnboarding, data.firstName, data.lastName, data.refreshToken);
      message.success(t.auth.welcomeMessage);
      navigate(data.requirePasswordChange ? '/change-password' : '/');
    } catch {
      message.error(t.auth.loginError);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const data = await login({ email: 'demo@agro.local', password: 'DemoPass1' });
      setAuth(data.token, data.email, data.role, data.tenantId, data.requirePasswordChange, data.hasCompletedOnboarding, data.firstName, data.lastName, data.refreshToken);
      message.success(t.auth.welcomeMessage);
      navigate(data.requirePasswordChange ? '/change-password' : '/');
    } catch {
      message.error(t.auth.loginError);
    } finally {
      setDemoLoading(false);
    }
  };

  const currentLang = languages.find(l => l.code === lang);
  const langMenuItems = languages.map(l => ({
    key: l.code,
    label: (
      <div className={s.flexCenter}>
        <img src={l.flag} alt={l.shortLabel} className={s.bordered} />
        <span>{l.label}</span>
      </div>
    ),
  }));

  return (
    <div className={s.loginPage}>
      {/* Card */}
      <div className={s.loginCard}>
        {/* Logo area */}
        <div className={s.logoArea}>
          <Logo size={28} variant="full" />
          <div className={s.brandSubtitle}>ПЛАТФОРМА УПРАВЛІННЯ</div>
        </div>

        {/* Form header */}
        <h3 className={s.formTitle}>{t.auth.loginTitle}</h3>
        <p className={s.formSubtitle}>{t.auth.loginSubtitle}</p>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label={<span className={s.fieldLabel}>{t.auth.email}</span>}
            rules={[{ required: true, type: 'email', message: t.auth.enterEmail }]}
          >
            <Input
              prefix={<User size={16} strokeWidth={1.5} className={s.inputIcon} />}
              placeholder={t.auth.email}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span className={s.fieldLabel}>{t.auth.password}</span>}
            rules={[{ required: true, message: t.auth.enterPassword }]}
          >
            <Input.Password
              prefix={<Lock size={16} strokeWidth={1.5} className={s.inputIcon} />}
              placeholder={t.auth.password}
              size="large"
            />
          </Form.Item>
          <Form.Item className={s.submitGap}>
            <Button type="primary" htmlType="submit" block size="large" className={s.submitButton}>
              {t.auth.login}
            </Button>
          </Form.Item>
          <div className={s.forgotLink}>{t.auth.forgotPassword}</div>
        </Form>

        {/* Divider */}
        <div className={s.divider}>
          <span className={s.dividerText}>{t.auth.or ?? 'або'}</span>
        </div>

        {/* Demo button */}
        <Button
          block
          size="large"
          loading={demoLoading}
          onClick={handleDemoLogin}
          className={s.demoButton}
        >
          {t.auth.demoLogin ?? 'Увійти як Demo'} →
        </Button>

        {/* Stats bar */}
        <div className={s.statsBar}>
          350.5 га · 5 од. техніки · 12+ підприємств
        </div>
      </div>

      {/* Language switcher — bottom left */}
      <div className={s.langSwitcher}>
        <Dropdown
          menu={{
            items: langMenuItems,
            selectedKeys: [lang],
            onClick: ({ key }) => setLang(key as 'uk' | 'en'),
          }}
        >
          <Button type="text" className={s.langButton}>
            <img src={currentLang?.flag} alt={currentLang?.shortLabel} className={s.flagIcon} />
            <span className={s.langLabel}>{currentLang?.shortLabel}</span>
          </Button>
        </Dropdown>
      </div>

      {/* Copyright — bottom right */}
      <div className={s.copyright}>{t.auth.copyright}</div>
    </div>
  );
}
