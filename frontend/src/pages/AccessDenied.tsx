import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="403"
      title={t.accessDenied.title}
      subTitle={t.accessDenied.subtitle}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t.accessDenied.backHome}
        </Button>
      }
    />
  );
}
