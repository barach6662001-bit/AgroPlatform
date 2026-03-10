import { Form, Input, Button, Card, Typography, message, Dropdown } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #134E4A 100%)',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <Dropdown
          menu={{
            items: langMenuItems,
            selectedKeys: [lang],
            onClick: ({ key }) => setLang(key as 'uk' | 'en'),
          }}
        >
          <Button type="default">
            {lang === 'uk' ? '🇺🇦 UA' : '🇬🇧 EN'}
          </Button>
        </Dropdown>
      </div>
      <Card style={{ width: 420, backdropFilter: 'blur(20px)', background: '#161B22', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Typography.Title level={2} style={{ color: '#3FB950', margin: 0 }}>
            {t.app.name}
          </Typography.Title>
          <Typography.Text type="secondary">{t.app.subtitle}</Typography.Text>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: t.auth.enterEmail }]}>
            <Input prefix={<UserOutlined />} placeholder={t.auth.email} size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t.auth.enterPassword }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t.auth.password} size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {t.auth.login}
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/register">{t.auth.register}</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
