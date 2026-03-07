import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="403"
      title={t.errors.accessDenied}
      subTitle={t.errors.accessDeniedDesc}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t.errors.backHome}
        </Button>
      }
    />
  );
}
