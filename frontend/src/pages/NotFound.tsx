import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="404"
      title={t.errors.notFound}
      subTitle={t.errors.notFoundDesc}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t.errors.backHome}
        </Button>
      }
    />
  );
}
