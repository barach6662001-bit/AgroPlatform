import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const data = await login(values);
      setAuth(data.token, data.email, data.role);
      message.success('Добро пожаловать!');
      navigate('/');
    } catch {
      message.error('Неверный email или пароль');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9eb 0%, #d9f7be 100%)',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Typography.Title level={2} style={{ color: '#389e0d', margin: 0 }}>
            🌾 АгроПлатформа
          </Typography.Title>
          <Typography.Text type="secondary">Система управления агропредприятием</Typography.Text>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Введите email' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              Войти
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/register">Зарегистрироваться</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
