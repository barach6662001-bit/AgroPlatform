import { Form, Input, Button, Dropdown, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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

  const currentLang = languages.find(l => l.code === lang);
  const langMenuItems = languages.map(l => ({
    key: l.code,
    label: (
      <div className={s.flex_center}>
        <img src={l.flag} alt={l.shortLabel} className={s.bordered} />
        <span>{l.label}</span>
      </div>
    ),
  }));

  const features = [
    { text: t.auth.featureFieldManagement, metric: '50 000+ га' },
    { text: t.auth.featureGpsMonitoring, metric: 'GPS real-time' },
    { text: t.auth.featureStorageManagement, metric: '99.9%' },
    { text: t.auth.featureAnalyticsAndReports, metric: '-30% витрат' },
  ];

  return (
    <>
      <style>{`
        .login-layout {
          display: grid;
          grid-template-columns: 1fr 420px;
        }

        .login-left-side {
          padding: 48px;
        }

        @media (max-width: 768px) {
          .login-layout {
            grid-template-columns: 1fr;
          }

          .login-left-side {
            padding: 24px 16px;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
        }
      `}</style>
      <div
        className={`login-layout ${s.bg}`}
        
      >
        {/* Left side — branding */}
        <div
          className={`login-left-side ${s.heroSection}`}
          
        >
          {/* Decorative gradient */}
        <div className={s.heroGradient} />

        {/* Logo */}
        <Logo size={40} variant="full" />

        {/* Decorative field illustration */}
        <div className={s.heroIllustration}>
          <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.fieldSvg}>
            <path d="M0 80 Q100 40 200 70 Q300 100 400 60 L400 120 L0 120 Z" fill="var(--brand)" opacity="0.06" />
            <path d="M0 90 Q80 60 180 85 Q280 110 400 75 L400 120 L0 120 Z" fill="var(--brand)" opacity="0.04" />
            <line x1="50" y1="70" x2="150" y2="55" stroke="var(--brand)" strokeWidth="0.5" opacity="0.15" />
            <line x1="100" y1="75" x2="200" y2="60" stroke="var(--brand)" strokeWidth="0.5" opacity="0.12" />
            <line x1="200" y1="65" x2="350" y2="55" stroke="var(--brand)" strokeWidth="0.5" opacity="0.1" />
            <circle cx="120" cy="62" r="3" fill="var(--brand)" opacity="0.3" />
            <circle cx="220" cy="68" r="3" fill="var(--brand)" opacity="0.25" />
            <circle cx="310" cy="58" r="3" fill="var(--brand)" opacity="0.2" />
            <circle cx="180" cy="72" r="2" fill="var(--brand)" opacity="0.15" />
          </svg>
        </div>

        {/* Center content */}
        <div>
          <div className={s.upper}>
            {t.auth.platformTagline}
          </div>
          <h2 className={s.heroHeadline}>
            {t.auth.heroHeadline}
          </h2>
          <p className={s.heroDesc}>
            {t.auth.heroDescription}
          </p>

          {/* Feature list */}
          <div className={s.featureList}>
            {features.map(feature => (
              <div key={feature.text} className={s.featureItem}>
                <div className={s.featureCheck}>
                  <svg width="10" height="10" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="var(--brand)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className={s.featureText}>{feature.text}</span>
                <span className={s.featureMetric}>{feature.metric}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className={s.socialProof}>
            <div className={s.proofMetric}>
              <span className={s.proofNumber}>12+</span>
              <span className={s.proofLabel}>{t.auth.proofCompanies}</span>
            </div>
            <div className={s.proofMetric}>
              <span className={s.proofNumber}>200K+</span>
              <span className={s.proofLabel}>{t.auth.proofHectares}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={s.copyright}>
          {t.auth.copyright}
        </div>
      </div>

      {/* Right side — form */}
      <div className={s.formSection}>
        {/* Language switcher */}
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
              <span className={s.langLabel}>
                {currentLang?.shortLabel}
              </span>
            </Button>
          </Dropdown>
        </div>

        <div className={s.formWrapper}>
          <div className={s.formHeader}>
            <h3 className={s.formTitle}>
              {t.auth.loginTitle}
            </h3>
            <p className={s.formSubtitle}>
              {t.auth.loginSubtitle}
            </p>
          </div>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              label={<span className={s.fieldLabel}>{t.auth.email}</span>}
              rules={[{ required: true, type: 'email', message: t.auth.enterEmail }]}
            >
              <Input
                prefix={<UserOutlined className={s.inputIcon} />}
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
                prefix={<LockOutlined className={s.inputIcon} />}
                placeholder={t.auth.password}
                size="large"
              />
            </Form.Item>
            <Form.Item className={s.submitGap}>
              <Button type="primary" htmlType="submit" block size="large" className={s.submitButton}>
                {t.auth.login}
              </Button>
            </Form.Item>
            <div className={s.forgotLink}>
              {t.auth.forgotPassword}
            </div>
          </Form>
        </div>
      </div>
    </div>
    </>
  );
}
