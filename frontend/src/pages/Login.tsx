import { Form, Input, Button, Typography, message, Dropdown } from 'antd';
import { UserOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';
import { useTranslation } from '../i18n';

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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0a0f0d',
    }}>
      {/* Language switcher */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Dropdown
          menu={{
            items: langMenuItems,
            selectedKeys: [lang],
            onClick: ({ key }) => setLang(key as 'uk' | 'en'),
          }}
        >
          <Button type="default" style={{ background: '#1a2320', border: '1px solid #1f2d24', color: '#86efac' }}>
            {lang === 'uk' ? '🇺🇦 UA' : '🇬🇧 EN'}
          </Button>
        </Dropdown>
      </div>

      {/* Left column — hero / branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 64px',
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(22,163,74,0.15) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(74,222,128,0.08) 0%, transparent 50%),
          #0a0f0d
        `,
        borderRight: '1px solid #1f2d24',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', bottom: -100, left: -100,
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #16a34a, #4ade80)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(22,163,74,0.5)',
          }}>
            <TeamOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <Typography.Text style={{ color: '#f0fdf4', fontWeight: 700, fontSize: 20, letterSpacing: '-0.3px' }}>
            АгроТех
          </Typography.Text>
        </div>

        {/* Headline */}
        <h1 style={{
          margin: '0 0 16px',
          fontSize: 42,
          fontWeight: 800,
          color: '#f0fdf4',
          letterSpacing: '-1px',
          lineHeight: 1.15,
          maxWidth: 480,
        }}>
          Платформа управління агробізнесом
        </h1>
        <p style={{
          margin: '0 0 48px',
          fontSize: 18,
          color: '#4ade80',
          fontWeight: 400,
          maxWidth: 440,
          lineHeight: 1.6,
        }}>
          Повний контроль над полями, технікою та фінансами
        </p>

        {/* Feature bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            'Управління полями та врожаєм',
            'Моніторинг техніки в реальному часі',
            'Аналітика та фінансова звітність',
          ].map((feat) => (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#16a34a',
                boxShadow: '0 0 8px rgba(22,163,74,0.6)',
              }} />
              <Typography.Text style={{ color: '#86efac', fontSize: 15 }}>{feat}</Typography.Text>
            </div>
          ))}
        </div>
      </div>

      {/* Right column — login form */}
      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
        background: '#0a0f0d',
      }}>
        <div style={{ marginBottom: 36 }}>
          <Typography.Title level={2} style={{ color: '#f0fdf4', margin: '0 0 8px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Вхід до системи
          </Typography.Title>
          <Typography.Text style={{ color: '#4ade80', fontSize: 14 }}>
            Введіть дані для входу до вашого акаунту
          </Typography.Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label={<span style={{ color: '#86efac', fontSize: 13 }}>{t.auth.email}</span>}
            rules={[{ required: true, type: 'email', message: t.auth.enterEmail }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#4ade80' }} />}
              placeholder={t.auth.email}
              size="large"
              style={{ background: '#1a2320', border: '1px solid #1f2d24', color: '#f0fdf4', borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span style={{ color: '#86efac', fontSize: 13 }}>{t.auth.password}</span>}
            rules={[{ required: true, message: t.auth.enterPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#4ade80' }} />}
              placeholder={t.auth.password}
              size="large"
              style={{ background: '#1a2320', border: '1px solid #1f2d24', color: '#f0fdf4', borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit" block size="large" style={{ height: 46, fontSize: 15, borderRadius: 8 }}>
              {t.auth.login}
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/register" style={{ color: '#4ade80' }}>{t.auth.register}</Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
