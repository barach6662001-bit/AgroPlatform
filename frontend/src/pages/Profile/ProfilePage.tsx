import { Card, Descriptions, Button, Space, Tag } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { useAuthStore } from '../../stores/authStore';

export default function ProfilePage() {
  const { t, lang, setLang } = useTranslation();
  const { isAdmin, isManager, isAgronomist, isStorekeeper, isDirector } = useRole();
  const { token, email: storedEmail } = useAuthStore();

  // Derive current role string from the hook flags
  const roleKey = isAdmin
    ? 'Administrator'
    : isManager
    ? 'Manager'
    : isAgronomist
    ? 'Agronomist'
    : isStorekeeper
    ? 'Storekeeper'
    : isDirector
    ? 'Director'
    : 'Unknown';

  // Decode additional claims (firstName, lastName) from JWT; use store email as primary source
  let email = storedEmail ?? '';
  let firstName = '';
  let lastName = '';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      email = email || (
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
        payload['email'] ??
        '');
      firstName =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ??
        payload['firstName'] ??
        '';
      lastName =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] ??
        payload['lastName'] ??
        '';
    }
  } catch {
    // Token parse failed — leave empty
  }

  return (
    <div>
      <PageHeader title={t.profile.title} subtitle={t.profile.subtitle} />

      <Card
        style={{ maxWidth: 640, background: '#161B22', border: '1px solid #30363D' }}
        bodyStyle={{ padding: 24 }}
      >
        <Descriptions
          column={1}
          labelStyle={{ color: '#8B949E', width: 160 }}
          contentStyle={{ color: '#E6EDF3' }}
          bordered
          size="middle"
        >
          <Descriptions.Item label={t.profile.email}>
            {email || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={t.profile.firstName}>
            {firstName || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={t.profile.lastName}>
            {lastName || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={t.profile.role}>
            <Tag color="blue">{t.roles[roleKey as keyof typeof t.roles] ?? roleKey}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t.profile.language}>
            <Space>
              <Button
                size="small"
                type={lang === 'uk' ? 'primary' : 'default'}
                icon={<GlobalOutlined />}
                onClick={() => setLang('uk')}
              >
                {t.profile.langUk}
              </Button>
              <Button
                size="small"
                type={lang === 'en' ? 'primary' : 'default'}
                icon={<GlobalOutlined />}
                onClick={() => setLang('en')}
              >
                {t.profile.langEn}
              </Button>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
