import { useTranslation } from '../i18n';
import s from './ErrorPage.module.css';

export default function ServerError() {
  const { t } = useTranslation();

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <p className={s.code}>500</p>
        <h1 className={s.title}>{t.errors.serverError}</h1>
        <p className={s.subtitle}>{t.errors.serverErrorDesc}</p>
        <button className={s.button} onClick={() => window.location.reload()}>
          {t.errors.tryAgain}
        </button>
      </div>
    </div>
  );
}
