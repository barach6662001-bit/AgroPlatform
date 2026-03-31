import { Form, Input, Button, Dropdown, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';
import { useTranslation, languages } from '../i18n';

const DEMO_EMAIL = 'demo@agro.local';
const DEMO_PASSWORD = 'DemoPass1';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t, lang, setLang } = useTranslation();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const data = await login(values);
      setAuth(data.token, data.email, data.role, data.tenantId, data.requirePasswordChange, data.firstName, data.lastName);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{l.flag}</span>
        <span>{l.label}</span>
      </div>
    ),
  }));

  const features = [
    t.auth.featureFieldManagement,
    t.auth.featureGpsMonitoring,
    t.auth.featureStorageManagement,
    t.auth.featureAnalyticsAndReports,
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
        className="login-layout"
        style={{
          minHeight: '100vh',
          background: 'var(--bg-app)',
        }}
      >
        {/* Left side — branding */}
        <div
          className="login-left-side"
          style={{
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative gradient */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(35,134,54,0.3)',
          }}>
            <span style={{ fontSize: 20 }}>🌿</span>
          </div>
          <div>
            <div>
              <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 24 }}>Agro</span>
              <span style={{ color: '#2ea043', fontWeight: 700, fontSize: 24 }}>Tech</span>
            </div>
            <p style={{ color: '#8b949e', fontSize: 13, margin: '4px 0 0' }}>
              Farm Management Platform
            </p>
          </div>
        </div>

        {/* Center content */}
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--accent)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Платформа управління агробізнесом
          </div>
          <h2 style={{
            margin: '0 0 16px',
            fontSize: 40,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-1px',
            lineHeight: 1.15,
          }}>
            Повний контроль над вашим агробізнесом
          </h2>
          <p style={{
            margin: 0,
            fontSize: 16,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 480,
          }}>
            Управляйте полями, технікою, складами, персоналом та фінансами в єдиній системі.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map(feature => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--accent-muted)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          © 2026 АгроТех. Всі права захищені.
        </div>
      </div>

      {/* Right side — form */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
      }}>
        {/* Language switcher */}
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <Dropdown
            menu={{
              items: langMenuItems,
              selectedKeys: [lang],
              onClick: ({ key }) => setLang(key as 'uk' | 'en'),
            }}
          >
            <Button type="text" style={{ color: 'var(--text-secondary)', padding: '4px 8px' }}>
              <span style={{ fontSize: 20, lineHeight: 1, marginRight: 4 }}>
                {currentLang?.flag}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {currentLang?.shortLabel}
              </span>
            </Button>
          </Dropdown>
        </div>

        <div style={{ width: '100%', maxWidth: 320 }}>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              margin: '0 0 4px',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}>
              Увійти в акаунт
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>
              Введіть ваші облікові дані
            </p>
          </div>

          <Alert
            type="info"
            style={{ marginBottom: 16, borderRadius: 8, fontSize: 13 }}
            message={
              <span style={{ fontWeight: 600 }}>🚀 Demo-доступ</span>
            }
            description={
              <div style={{ marginTop: 4 }}>
                <div><b>Email:</b> {DEMO_EMAIL}</div>
                <div><b>Пароль:</b> {DEMO_PASSWORD}</div>
                <Button
                  size="small"
                  icon={<ThunderboltOutlined />}
                  style={{ marginTop: 8 }}
                  onClick={async () => {
                    try {
                      const data = await login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
                      setAuth(data.token, data.email, data.role, data.tenantId, data.requirePasswordChange, data.firstName, data.lastName);
                      message.success('Вітаємо в демо!');
                      navigate(data.requirePasswordChange ? '/change-password' : '/');
                    } catch {
                      message.error('Demo login failed. Make sure the server is running.');
                    }
                  }}
                >
                  Спробувати демо
                </Button>
              </div>
            }
          />
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              label={<span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>{t.auth.email}</span>}
              rules={[{ required: true, type: 'email', message: t.auth.enterEmail }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder={t.auth.email}
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>{t.auth.password}</span>}
              rules={[{ required: true, message: t.auth.enterPassword }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder={t.auth.password}
                size="large"
              />
            </Form.Item>
            <Form.Item style={{ marginTop: 8, marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" block size="large" style={{ height: 40, fontSize: 14 }}>
                {t.auth.login}
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)' }}>
              AgroTech Platform
            </div>
          </Form>
        </div>
      </div>
    </div>
    </>
  );
}
