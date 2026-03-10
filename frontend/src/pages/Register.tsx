import { Form, Input, Button, Card, Typography, Select, message, Dropdown } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { register } from '../api/auth';
import { useTranslation } from '../i18n';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t, lang, setLang } = useTranslation();

  const roleOptions = [
    { value: 'Administrator', label: t.roles.Administrator },
    { value: 'Manager', label: t.roles.Manager },
    { value: 'Agronomist', label: t.roles.Agronomist },
    { value: 'Storekeeper', label: t.roles.Storekeeper },
    { value: 'Director', label: t.roles.Director },
  ];

  const onFinish = async (values: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => {
    try {
      const data = await register(values);
      setAuth(data.token, data.email, data.role, data.tenantId);
      message.success(t.auth.registerSuccess);
      navigate('/');
    } catch {
      message.error(t.auth.registerError);
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
      <Card style={{ width: 440, backdropFilter: 'blur(20px)', background: '#161B22', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Typography.Title level={2} style={{ color: '#3FB950', margin: 0 }}>
            {t.app.name}
          </Typography.Title>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label={t.auth.firstName} name="firstName" rules={[{ required: true, message: t.auth.enterFirstName }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item label={t.auth.lastName} name="lastName" rules={[{ required: true, message: t.auth.enterLastName }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item label={t.auth.email} name="email" rules={[{ required: true, type: 'email', message: t.auth.enterEmail }]}>
            <Input placeholder="email@example.com" size="large" />
          </Form.Item>
          <Form.Item label={t.auth.password} name="password" rules={[{ required: true, min: 6, message: t.auth.minPassword }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
          <Form.Item label={t.auth.role} name="role" rules={[{ required: true, message: t.auth.selectRole }]}>
            <Select options={roleOptions} size="large" placeholder={t.auth.selectRole} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {t.auth.register}
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/login">{t.auth.haveAccount}</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
