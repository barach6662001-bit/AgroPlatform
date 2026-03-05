import { Form, Input, Button, Card, Typography, Select, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { register } from '../api/auth';

const roleOptions = [
  { value: 'Administrator', label: 'Администратор' },
  { value: 'Manager', label: 'Менеджер' },
  { value: 'Agronomist', label: 'Агроном' },
  { value: 'Storekeeper', label: 'Кладовщик' },
  { value: 'Director', label: 'Директор' },
];

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => {
    try {
      const data = await register(values);
      setAuth(data.token, data.email, data.role);
      message.success('Регистрация прошла успешно!');
      navigate('/');
    } catch {
      message.error('Ошибка регистрации. Попробуйте ещё раз.');
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
      <Card style={{ width: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Typography.Title level={2} style={{ color: '#389e0d', margin: 0 }}>
            🌾 Регистрация
          </Typography.Title>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Имя" name="firstName" rules={[{ required: true, message: 'Введите имя' }]}>
            <Input placeholder="Иван" size="large" />
          </Form.Item>
          <Form.Item label="Фамилия" name="lastName" rules={[{ required: true, message: 'Введите фамилию' }]}>
            <Input placeholder="Иванов" size="large" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Введите email' }]}>
            <Input placeholder="email@example.com" size="large" />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[{ required: true, min: 6, message: 'Минимум 6 символов' }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
          <Form.Item label="Роль" name="role" rules={[{ required: true, message: 'Выберите роль' }]}>
            <Select options={roleOptions} size="large" placeholder="Выберите роль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              Зарегистрироваться
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/login">Уже есть аккаунт? Войти</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
