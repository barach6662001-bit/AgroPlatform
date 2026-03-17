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
      background: '#0e1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
          <Button type="default" style={{ background: '#1c2128', border: '1px solid #30363d', color: '#8b949e' }}>
            {lang === 'uk' ? '🇺🇦 UA' : '🇬🇧 EN'}
          </Button>
        </Dropdown>
      </div>

      <div style={{
        width: 360,
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: 12,
        padding: '32px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40,
            background: '#238636',
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <TeamOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <Typography.Title level={3} style={{ color: '#e6edf3', margin: 0, fontSize: 18, fontWeight: 600 }}>
            АгроТех
          </Typography.Title>
          <p style={{ color: '#8b949e', margin: '4px 0 0', fontSize: 13 }}>
            Увійдіть у свій акаунт
          </p>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label={<span style={{ color: '#8b949e', fontSize: 13 }}>{t.auth.email}</span>}
            rules={[{ required: true, type: 'email', message: t.auth.enterEmail }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#8b949e' }} />}
              placeholder={t.auth.email}
              size="large"
              style={{ background: '#1c2128', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 6 }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span style={{ color: '#8b949e', fontSize: 13 }}>{t.auth.password}</span>}
            rules={[{ required: true, message: t.auth.enterPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8b949e' }} />}
              placeholder={t.auth.password}
              size="large"
              style={{ background: '#1c2128', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 6 }}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit" block size="large" style={{ height: 40, fontSize: 14, borderRadius: 6 }}>
              {t.auth.login}
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/register" style={{ color: '#8b949e', fontSize: 13 }}>{t.auth.register}</Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
