import { Result, Button } from 'antd';
import { useTranslation } from '../i18n';

export default function ServerError() {
  const { t } = useTranslation();

  return (
    <Result
      status="500"
      title={t.errors.serverError}
      subTitle={t.errors.serverErrorDesc}
      extra={
        <Button type="primary" onClick={() => window.location.reload()}>
          {t.errors.tryAgain}
        </Button>
      }
    />
  );
}
