import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import s from './ErrorPage.module.css';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <p className={s.code}>404</p>
        <h1 className={s.title}>{t.errors.notFound}</h1>
        <p className={s.subtitle}>{t.errors.notFoundDesc}</p>
        <button className={s.button} onClick={() => navigate('/dashboard')}>
          {t.errors.backHome}
        </button>
      </div>
    </div>
  );
}
