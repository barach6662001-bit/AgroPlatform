import { Form, Input, Button, Dropdown } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';
import { useTranslation } from '../i18n';
import { message } from 'antd';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t, lang, setLang } = useTranslation();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const data = await login(values);
      setAuth(data.token, data.email, data.role, data.tenantId);
      message.success(t.auth.welcomeMessage);
      navigate('/');
    } catch {
      message.error(t.auth.loginError);
    }
  };

  const langMenuItems = [
    { key: 'uk', label: '🇺🇦 Українська' },
    { key: 'en', label: '🇬🇧 English' },
  ];

  const features = [
    'Облік полів та врожайності',
    'GPS моніторинг техніки',
    'Управління зерносховищем',
    'Аналітика та звітність',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 420px',
      background: 'var(--bg-app)',
    }}>
      {/* Left side — branding */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
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
            background: 'var(--accent)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
            АгроТех
          </span>
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
            <Button type="text" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              {lang === 'uk' ? '🇺🇦 UA' : '🇬🇧 EN'}
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
            <div style={{ textAlign: 'center' }}>
              <Link to="/register" style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{t.auth.register}</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
